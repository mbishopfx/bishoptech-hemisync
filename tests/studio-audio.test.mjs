import assert from 'node:assert/strict';
import test from 'node:test';
import { encodeMp3Stereo, encodeWavStereo } from '../lib/audio/engine/encode.js';

function firstMp3Frame(buffer) {
  for (let index = 0; index < buffer.length - 4; index += 1) {
    if (buffer[index] === 0xff && (buffer[index + 1] & 0xe0) === 0xe0) return index;
  }
  return -1;
}

test('Studio encoders create 24-bit 48 kHz stereo WAV and genuine 192 kbps MP3', async () => {
  const sampleRate = 48000;
  const left = new Float32Array(sampleRate);
  const right = new Float32Array(sampleRate);
  for (let index = 0; index < sampleRate; index += 1) {
    left[index] = Math.sin((2 * Math.PI * 220 * index) / sampleRate) * 0.1;
    right[index] = Math.sin((2 * Math.PI * 226 * index) / sampleRate) * 0.1;
  }

  const wav = encodeWavStereo({ left, right, sampleRate, bitDepthCode: '24' });
  assert.equal(wav.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(wav.subarray(8, 12).toString('ascii'), 'WAVE');
  assert.equal(wav.readUInt16LE(22), 2);
  assert.equal(wav.readUInt32LE(24), 48000);
  assert.equal(wav.readUInt16LE(34), 24);

  const mp3 = await encodeMp3Stereo({ left, right, sampleRate, kbps: 192 });
  const frame = firstMp3Frame(mp3);
  assert.ok(frame >= 0, 'expected an MPEG audio frame signature');
  const versionBits = (mp3[frame + 1] >> 3) & 0x03;
  const layerBits = (mp3[frame + 1] >> 1) & 0x03;
  const bitrateIndex = (mp3[frame + 2] >> 4) & 0x0f;
  const sampleRateIndex = (mp3[frame + 2] >> 2) & 0x03;
  const channelMode = (mp3[frame + 3] >> 6) & 0x03;
  assert.equal(versionBits, 3, 'expected MPEG-1');
  assert.equal(layerBits, 1, 'expected Layer III');
  assert.equal(bitrateIndex, 11, 'expected 192 kbps MPEG-1 Layer III');
  assert.equal(sampleRateIndex, 1, 'expected 48 kHz');
  assert.notEqual(channelMode, 3, 'expected stereo, not mono');
});
