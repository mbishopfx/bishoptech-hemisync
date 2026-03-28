export const ExportProfiles = {
  standard: {
    id: 'standard',
    sampleRate: 44100,
    wavBitDepthCode: '24',
    mp3Kbps: 160,
    mastering: {
      ceilingDb: -1.2,
      lookaheadMs: 4,
      attackMs: 2,
      releaseMs: 140,
      dcBlockHz: 18
    }
  },
  premium: {
    id: 'premium',
    sampleRate: 48000,
    wavBitDepthCode: '24',
    mp3Kbps: 192,
    mastering: {
      ceilingDb: -1.0,
      lookaheadMs: 5,
      attackMs: 1.5,
      releaseMs: 160,
      dcBlockHz: 18
    }
  }
};

export function resolveExportProfile(profileId = 'premium') {
  return ExportProfiles[profileId] || ExportProfiles.premium;
}
