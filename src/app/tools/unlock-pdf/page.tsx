import { PdfProtectClient } from '../pdf-protect/page';

export default function UnlockPdfPage() {
  return <PdfProtectClient initialMode="unlock" />;
}
