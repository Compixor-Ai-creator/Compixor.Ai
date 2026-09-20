declare module 'pdf-lib-encrypt' {
  import type { PDFDocument } from 'pdf-lib';

  export interface LockOptions {
    ownerPassword?: string;
    algo?: 'aes' | 'rc4';
  }

  export function configure(pdfLib: unknown): void;
  export function lock(
    plainBytes: Uint8Array,
    userPassword: string,
    opts?: LockOptions
  ): Promise<Uint8Array>;
  export function unlockInPlace(
    pdfDoc: PDFDocument,
    password: string
  ): Promise<boolean>;
}
