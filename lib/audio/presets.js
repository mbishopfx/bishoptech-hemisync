export const FocusPresets = {
  F10: {
    description: 'Induction to mind awake, body asleep. Alpha to Theta glide.',
    deltaHzPath: [{ at: 0, hz: 10 }, { at: 600, hz: 8 }, { at: 1200, hz: 6 }],
    carriers: { leftHz: 220, rightHzOffsetHz: 0 },
    noise: { type: 'pink', mixDb: -24 },
    modes: { binaural: true, monaural: false, isochronic: true }
  },
  F12: {
    description: 'Expanded awareness. Theta center with stability.',
    deltaHzPath: [{ at: 0, hz: 8 }, { at: 900, hz: 6 }],
    carriers: { leftHz: 240, rightHzOffsetHz: 0 },
    noise: { type: 'pink', mixDb: -26 },
    modes: { binaural: true, monaural: true, isochronic: true }
  },
  F15: {
    description: 'No-time exploration. Deeper Theta with breath-coupled AM.',
    deltaHzPath: [{ at: 0, hz: 7 }, { at: 900, hz: 5 }],
    carriers: { leftHz: 210, rightHzOffsetHz: 0 },
    noise: { type: 'brown', mixDb: -28 },
    modes: { binaural: true, monaural: true, isochronic: false }
  },
  F21: {
    description: 'Boundary conditions. Low Theta with careful transitions.',
    deltaHzPath: [{ at: 0, hz: 6 }, { at: 1200, hz: 4 }],
    carriers: { leftHz: 200, rightHzOffsetHz: 0 },
    noise: { type: 'pink', mixDb: -26 },
    modes: { binaural: true, monaural: true, isochronic: false }
  }
};

export function pickPreset({ programPreset, focusLevel }) {
  if (programPreset && FocusPresets[programPreset]) return FocusPresets[programPreset];
  if (focusLevel && FocusPresets[focusLevel]) return FocusPresets[focusLevel];
  return FocusPresets.F10;
}


