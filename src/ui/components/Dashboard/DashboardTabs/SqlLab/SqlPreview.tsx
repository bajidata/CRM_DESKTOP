import React from 'react';
import type { SqlFile } from '../../../types';

interface SqlPreviewProps {
  sqlFiles: SqlFile[];
}

export const SqlPreview: React.FC<SqlPreviewProps> = ({ sqlFiles }) => {
  return (
    <div className="w-full border border-gray-300 rounded p-3 bg-gray-50 whitespace-pre-wrap">
      {sqlFiles.length > 0 ? (
        sqlFiles[0].parsedSegments.map((seg, idx) =>
          seg.editable ? (
            <span
              key={idx}
              className="bg-green-100 text-green-800 px-1 rounded"
            >
              {seg.value}
            </span>
          ) : (
            <span key={idx}>{seg.text}</span>
          )
        )
      ) : (
        <p className="text-gray-500 mt-2">Select a file to view SQL content.</p>
      )}
    </div>
  );
};