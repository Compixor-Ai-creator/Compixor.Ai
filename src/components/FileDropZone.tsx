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
  const dragCounterRef = useRef(0);

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

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer?.types && Array.from(e.dataTransfer.types).includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className={`drop-zone p-8 md:p-12 flex flex-col items-center justify-center text-center transition-all duration-300 ${
        isDragOver
          ? 'drag-over !border-brand-500 !bg-brand-500/10 ring-4 ring-brand-500/20 shadow-glow scale-[1.01]'
          : ''
      } ${className}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
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
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center">
            <File className="w-7 h-7 text-brand-500" />
          </div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-xs">
            {fileName}
          </p>
          <p className="text-xs text-zinc-500">Click or drop to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 pointer-events-none">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragOver
                ? 'bg-brand-500 text-white scale-110 shadow-glow-lg animate-bounce'
                : 'bg-brand-500/10 text-brand-500'
            }`}
          >
            {icon || <Upload className="w-8 h-8" />}
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              {isDragOver ? 'Release to upload file' : title}
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              {isDragOver ? 'Drop your document now' : subtitle}
            </p>
          </div>
          <p className="text-xs text-zinc-400">
            Max file size: {maxSizeMB}MB
          </p>
        </div>
      )}
    </div>
  );
}
