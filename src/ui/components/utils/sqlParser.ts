import type { SqlSegment } from '../types';

export const parseSql = (sql: string): SqlSegment[] => {
  const regex = /(\{\{.*?\}\})/g;
  const parts = sql.split(regex);

  return parts.map((part) => {
    const editable = part.startsWith('{{') && part.endsWith('}}');
    const value = editable ? part.slice(2, -2) : undefined;
    const label = editable ? detectLabel(value || '') : '';
    return { text: part, editable, value, label };
  });
};

export const detectLabel = (val: string): string => {
  const labelMappings: Record<string, string> = {
    start_date: 'Start Date',
    end_date: 'End Date',
    currency: 'Currency',
    game_type: "Game Type",
  };

  return labelMappings[val] || val
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Returns default value for a variable, or empty string
export const getDefaultValue = (key: string): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // month is 0-indexed
  const dd = String(today.getDate()).padStart(2, '0');

  const defaultValues: Record<string, string> = {
    start_date: `${yyyy}-${mm}-01`,   // first day of current month
    end_date: `${yyyy}-${mm}-${dd}`,  // today
    currency: 'BDT',                  // leave empty
    game_type: 'Sport',               // leave empty
  };

  return defaultValues[key] ?? '';
};
