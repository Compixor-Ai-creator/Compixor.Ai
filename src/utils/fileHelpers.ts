/**
 * fileHelpers.ts
 * Shared file utility functions for PDF tools.
 * Centralizes: formatFileSize, validatePdfFile, downloadBlob
 */

// ─── Format file size ─────────────────────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// ─── Validate PDF file (type + size) ─────────────────────────────────────────
/**
 * Returns an error string if invalid, or null if valid.
 * @param file - The File object to validate
 * @param maxSizeMB - Maximum allowed size in MB (default 100MB)
 */
export function validatePdfFile(file: File, maxSizeMB = 100): string | null {
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) return 'Please select a valid PDF file.';

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File is too large. Maximum allowed size is ${maxSizeMB} MB. Your file is ${formatFileSize(file.size)}.`;
  }
  return null;
}

// ─── Download a Blob as a file ────────────────────────────────────────────────
/**
 * Triggers a browser download for the given Blob.
 * Safely creates and revokes the object URL.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Small delay before revoke so the browser has time to initiate download
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── Robust PDF error detection ───────────────────────────────────────────────
/**
 * Checks if an unknown error is a PDF password/encryption error.
 * More robust than hardcoded string matching.
 */
export function isPdfPasswordError(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes('password') ||
      msg.includes('encrypt') ||
      msg.includes('decrypt') ||
      msg.includes('protected') ||
      msg.includes('not authorized')
    );
  }
  return false;
}
