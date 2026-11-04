/** Encode Wi-Fi credentials according to the common ZXing WIFI payload format. */
export function escapeWifiField(value: string): string {
  const escaped = value.replace(/[\\;,:\"]/g, '\\$&');
  // Quote hex-looking ASCII values so scanners do not interpret them as raw hex.
  return /^[0-9a-f]+$/i.test(value) ? `"${escaped}"` : escaped;
}

export function buildWifiQrPayload(
  ssid: string,
  password: string,
  encryption: 'WPA' | 'WEP' | 'nopass',
  hidden: boolean,
): string {
  const passwordField = encryption === 'nopass' ? '' : `P:${escapeWifiField(password)};`;
  return `WIFI:T:${encryption};S:${escapeWifiField(ssid)};${passwordField}H:${hidden ? 'true' : 'false'};;`;
}
