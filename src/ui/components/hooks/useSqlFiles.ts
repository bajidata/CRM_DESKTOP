import { useState, useCallback } from 'react';
import type { SqlFile } from '../types';
import { parseSql } from '../utils/sqlParser';

export const useSqlFiles = () => {
  const [sqlFiles, setSqlFiles] = useState<SqlFile[]>([]);

  const loadFileContent = useCallback(async (brand: string, file: string) => {
    const res = await window.electron?.getFileContent(brand, file);
    if (res?.success && res.content) {
      const parsed = parseSql(res.content);
      setSqlFiles([{ name: file, content: res.content, parsedSegments: parsed }]);
    }
  }, []);

  const updatePlaceholder = useCallback((placeholderKey: string, newValue: string) => {
    setSqlFiles(prevFiles => {
      if (prevFiles.length === 0) return prevFiles;
      
      const newFiles = [...prevFiles];
      const fileIndex = 0;
      
      // Update only the specific placeholder without creating new objects unnecessarily
      let contentChanged = false;
      newFiles[fileIndex].parsedSegments = newFiles[fileIndex].parsedSegments.map(seg => {
        if (seg.editable && seg.value === placeholderKey && seg.value !== newValue) {
          contentChanged = true;
          return { ...seg, value: newValue };
        }
        return seg;
      });

      // Only update content if it actually changed
      if (contentChanged) {
        newFiles[fileIndex].content = newFiles[fileIndex].parsedSegments
          .map(seg => seg.editable ? `{{${seg.value}}}` : seg.text)
          .join('');
      }

      return newFiles;
    });
  }, []);

  return {
    sqlFiles,
    loadFileContent,
    updatePlaceholder,
    setSqlFiles
  };
};