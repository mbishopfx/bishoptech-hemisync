export const SCIENCE_GUIDE_RESOURCE_URI = 'ui://cognistration/science-guide/v2.html';
export const SCIENCE_GUIDE_LEGACY_RESOURCE_URI = 'ui://cognistration/science-guide/v1.html';
export const SCIENCE_GUIDE_RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app';
export const SCIENCE_GUIDE_BACKGROUND_URL = 'https://vgpu.sh/examples/fft-ocean-surface';

export const SCIENCE_GUIDE_SOURCES = [
  {
    id: 'vgpu-fft-ocean',
    label: 'vGPU FFT ocean surface visual reference',
    url: SCIENCE_GUIDE_BACKGROUND_URL,
    kind: 'visual reference'
  },
  {
    id: 'pmc-electrophysiology',
    label: 'Electrophysiological measurement of binaural beats',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3243787/',
    kind: 'primary research'
  },
  {
    id: 'nature-ffr',
    label: 'Cortical contributions to the auditory frequency-following response',
    url: 'https://www.nature.com/articles/ncomms11070',
    kind: 'primary research'
  },
  {
    id: 'pubmed-eeg',
    label: 'Tracking EEG changes in response to alpha and beta binaural beats',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23085086/',
    kind: 'primary research'
  },
  {
    id: 'pmc-auditory-pathway',
    label: 'Binaural beats through the auditory pathway',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7082494/',
    kind: 'research review'
  },
  {
    id: 'health-warning',
    label: 'Cognistration health and safety boundaries',
    url: 'https://cognistration.com/health-warning',
    kind: 'Cognistration policy'
  }
];

export const SCIENCE_GUIDE_SLIDES = [
  {
    id: 'signal',
    eyebrow: '01 · The starting signal',
    title: 'Start with the relationship between tones',
    body: 'A binaural-beat stimulus sends nearby tones to the left and right channels. The carrier is the shared base tone; the difference between the channels is the beat value a listener may perceive as a rhythmic change.',
    facts: [
      { label: 'Carrier', detail: 'The audible base tone shared by both channels.' },
      { label: 'Difference', detail: 'The separation between the left and right frequencies.' },
      { label: 'Boundary', detail: 'A perceived rhythm is not a promise of a target brain state.' }
    ],
    sourceIds: ['pmc-electrophysiology']
  },
  {
    id: 'ffr',
    eyebrow: '02 · What researchers measure',
    title: 'FFR is a measurement, not a switch',
    body: 'The frequency-following response, or FFR, is an electrophysiological response that can be time-locked to periodic features in sound. It helps researchers study how auditory pathways encode timing; it does not prove that an app can globally switch the brain into one state.',
    facts: [
      { label: 'Observed', detail: 'Neural activity can track regular acoustic structure.' },
      { label: 'Recorded', detail: 'Researchers use methods such as EEG or MEG to study the response.' },
      { label: 'Not established', detail: 'An FFR is not a diagnosis, treatment, or guarantee of a cognitive outcome.' }
    ],
    sourceIds: ['pmc-electrophysiology', 'nature-ffr']
  },
  {
    id: 'bands',
    eyebrow: '03 · A useful vocabulary',
    title: 'Brain-state bands are descriptive shorthand',
    body: 'Delta, theta, alpha, beta, and gamma are commonly used labels for frequency ranges. Their boundaries overlap across conventions, and their interpretation depends on the task, location, baseline, and analysis. Cognistration uses them as listening directions, not as mental-state switches.',
    bands: [
      { label: 'Delta', range: 'about 0.5–4 Hz', direction: 'slower rest cue' },
      { label: 'Theta', range: 'about 4–8 Hz', direction: 'reflective space' },
      { label: 'Alpha', range: 'about 8–14 Hz', direction: 'calm flow' },
      { label: 'Beta', range: 'about 14–30 Hz', direction: 'active focus' },
      { label: 'Gamma', range: 'about 30–50 Hz', direction: 'synthesis cue' }
    ],
    sourceIds: ['pmc-auditory-pathway']
  },
  {
    id: 'evidence',
    eyebrow: '04 · Keep the claim calibrated',
    title: 'Evidence is useful precisely where it has limits',
    body: 'Studies do not all ask the same question or use the same stimulus and recording method. Some examine auditory encoding, some examine EEG or mood, and some test whether a proposed beat changes a measured rhythm. Results are mixed, so the responsible product claim stays narrow.',
    facts: [
      { label: 'One EEG study', detail: 'Reported no frequency-following effect from the tested alpha and beta binaural beats.' },
      { label: 'Different pathways', detail: 'Binaural and monaural stimuli can be compared across subcortical and cortical responses.' },
      { label: 'Product promise', detail: 'Cognistration offers a controllable listening cue, not a guaranteed neurological result.' }
    ],
    sourceIds: ['pubmed-eeg', 'pmc-auditory-pathway']
  },
  {
    id: 'machine',
    eyebrow: '05 · What the machine actually does',
    title: 'Turn an intention into bounded controls',
    body: 'The agent maps a short intention to an approved public direction, then the visible machine exposes the settings behind that choice. You can inspect and adjust the state label, carrier, difference, and volume before deciding whether to preview.',
    facts: [
      { label: 'Agent', detail: 'Chooses from an approved public catalog instead of inventing a tone.' },
      { label: 'Listener', detail: 'Keeps control of the visible sliders and the final preview action.' },
      { label: 'Privacy', detail: 'The guide carries technical settings only; it does not request diary text.' }
    ],
    sourceIds: ['vgpu-fft-ocean']
  },
  {
    id: 'safety',
    eyebrow: '06 · The practical boundary',
    title: 'Use it as a cue, not a claim',
    body: 'Keep the experience ordinary and voluntary: use comfortable volume, stop if the sound feels uncomfortable, and never use an audio preview while driving or operating something hazardous. The guide is educational and is not medical or crisis support.',
    facts: [
      { label: 'Before listening', detail: 'Use headphones and a comfortable volume if you choose to preview.' },
      { label: 'During listening', detail: 'Stop whenever the experience is unpleasant or distracting.' },
      { label: 'Need clinical help?', detail: 'Use Cognistration’s health and safety page instead of asking the tone tool for advice.' }
    ],
    sourceIds: ['health-warning']
  },
  {
    id: 'sources',
    eyebrow: '07 · Continue exploring',
    title: 'Read the primary sources behind the guide',
    body: 'This guide is a concise product explanation, not a literature review. Open the linked research and visual reference if you want the technical detail behind the terms.',
    facts: [],
    sourceIds: ['pmc-electrophysiology', 'nature-ffr', 'pubmed-eeg', 'pmc-auditory-pathway', 'vgpu-fft-ocean']
  }
];
