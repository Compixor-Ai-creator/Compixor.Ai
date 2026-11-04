import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWifiQrPayload, escapeWifiField } from './wifiQr';

test('escapes Wi-Fi delimiters and backslashes', () => {
  assert.equal(escapeWifiField('Cafe;Wi:Fi,Guest\\"'), 'Cafe\\;Wi\\:Fi\\,Guest\\\\\\"');
  assert.equal(buildWifiQrPayload('Cafe;Guest', 'pa;ss:word\\', 'WPA', false), 'WIFI:T:WPA;S:Cafe\\;Guest;P:pa\\;ss\\:word\\\\;H:false;;');
});

test('preserves spaces, unicode and quotes hexadecimal-looking values', () => {
  assert.equal(escapeWifiField(' Café WiFi '), ' Café WiFi ');
  assert.equal(escapeWifiField('abcdef12'), '"abcdef12"');
  assert.equal(escapeWifiField('12abCD'), '"12abCD"');
});

test('open networks do not include a previously entered password', () => {
  assert.equal(buildWifiQrPayload('Guest', 'old-secret', 'nopass', true), 'WIFI:T:nopass;S:Guest;H:true;;');
});
