'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, File } from 'lucide-react';

interface FileDropZoneProps {
  onFileDrop: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function FileDropZone({
  onFileDrop,
  accept = '*',
  maxSizeMB = 50,
  icon,
  title = 'Drop your file here',
  subtitle = 'or click to browse',
  className = '',
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File too large. Max size is ${maxSizeMB}MB.`);
        return;
      }
      setFileName(file.name);
      onFileDrop(file);
    },
    [maxSizeMB, onFileDrop]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className={`drop-zone p-8 md:p-12 flex flex-col items-center justify-center text-center ${
        isDragOver ? 'drag-over' : ''
      } ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {fileName ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center">
            <File className="w-7 h-7 text-brand-500" />
          </div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-xs">
            {fileName}
          </p>
          <p className="text-xs text-zinc-500">Click or drop to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragOver
                ? 'bg-brand-500/20 scale-110'
                : 'bg-brand-500/10'
            }`}
          >
            {icon || <Upload className="w-8 h-8 text-brand-500" />}
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
              {title}
            </p>
            <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
          </div>
          <p className="text-xs text-zinc-400">
            Max file size: {maxSizeMB}MB
          </p>
        </div>
      )}
    </div>
  );
}
