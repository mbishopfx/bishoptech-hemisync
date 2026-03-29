import { buildJourneyBlueprint } from '@/lib/audio/journeys';

function createTemplate(template) {
  return {
    defaultLengthSec: 900,
    sampleLengthSec: 120,
    ...template
  };
}

export const consumerTemplateOptions = [
  createTemplate({
    id: 'daily-reset',
    title: 'Daily Reset',
    shortLabel: 'Reset',
    category: 'Reset',
    accent: 'gold',
    journeyPresetId: 'induction-alpha-theta-integration-15',
    focusLevel: 'F10',
    baseFreqHz: 236,
    background: { type: 'asset', assetId: 'lumina', mixDb: -24 },
    breathPattern: 'coherent-5.5',
    useCase: 'Calm down and come back clear.',
    description: 'A balanced alpha-theta glide for settling the nervous system and returning without fog.',
    bestFor: 'Late afternoon decompression or a clean evening reset.',
    ritual: 'Low light, headphones on, shoulders released.'
  }),
  createTemplate({
    id: 'evening-unwind',
    title: 'Evening Unwind',
    shortLabel: 'Unwind',
    category: 'Reset',
    accent: 'copper',
    journeyPresetId: 'induction-alpha-theta-integration-15',
    focusLevel: 'F10',
    baseFreqHz: 230,
    background: { type: 'asset', assetId: 'papa', mixDb: -26 },
    breathPattern: 'coherent-5.5',
    useCase: 'Let the day lose its grip.',
    description: 'A warmer arrival with a gentler center for people who want tension to leave the body before night.',
    bestFor: 'Post-work unwinding, dinner transition, or reading prep.',
    ritual: 'Sit upright first, then recline once the breath slows.'
  }),
  createTemplate({
    id: 'breath-reset',
    title: 'Breath Reset',
    shortLabel: 'Breath',
    category: 'Reset',
    accent: 'ice',
    journeyPresetId: 'induction-alpha-theta-integration-15',
    focusLevel: 'F10',
    baseFreqHz: 242,
    background: null,
    breathPattern: 'coherent-5.5',
    useCase: 'Pair a clean stereo beat with a steady exhale rhythm.',
    description: 'Minimal and clear, with the emphasis on settling breath, pulse, and attention.',
    bestFor: 'After a stressful call, before journaling, or during a midday reset.',
    ritual: 'Stay with the exhale and keep the volume moderate.'
  }),
  createTemplate({
    id: 'stoic-calm',
    title: 'Stoic Calm',
    shortLabel: 'Stoic',
    category: 'Reset',
    accent: 'copper',
    journeyPresetId: 'induction-alpha-theta-integration-15',
    focusLevel: 'F10',
    baseFreqHz: 232,
    background: { type: 'asset', assetId: 'papa', mixDb: -27 },
    breathPattern: 'box',
    useCase: 'Settle emotion without collapsing your edge.',
    description: 'Grounded, deliberate, and slightly firmer than a sleepier reset arc.',
    bestFor: 'Before hard conversations, reflection, or an intentional reset.',
    ritual: 'Sit tall, breathe evenly, and let the sound hold the frame.'
  }),
  createTemplate({
    id: 'midday-reset',
    title: 'Midday Reset',
    shortLabel: 'Midday',
    category: 'Reset',
    accent: 'gold',
    journeyPresetId: 'induction-alpha-theta-integration-15',
    focusLevel: 'F10',
    baseFreqHz: 238,
    background: { type: 'asset', assetId: 'lumina', mixDb: -24 },
    breathPattern: 'coherent-5.5',
    useCase: 'Clear accumulated friction and start the second half fresh.',
    description: 'A lighter, brighter reset that calms without making you sleepy.',
    bestFor: 'Midday breaks, walk-to-desk resets, and post-lunch clarity.',
    ritual: 'Use seated, then stand slowly at the end.'
  }),
  createTemplate({
    id: 'grounded-return',
    title: 'Grounded Return',
    shortLabel: 'Grounded',
    category: 'Reset',
    accent: 'emerald',
    journeyPresetId: 'induction-alpha-theta-integration-15',
    focusLevel: 'F10',
    baseFreqHz: 228,
    background: { type: 'asset', assetId: 'papa', mixDb: -26 },
    breathPattern: 'coherent-5.5',
    useCase: 'Come back from overload without feeling detached.',
    description: 'A reassuring arc that favors calm embodiment over heavy descent.',
    bestFor: 'After travel, overstimulation, or mentally noisy days.',
    ritual: 'Keep one hand on your chest or abdomen for the first minute.'
  }),
  createTemplate({
    id: 'deep-focus',
    title: 'Deep Focus',
    shortLabel: 'Focus',
    category: 'Focus',
    accent: 'ice',
    journeyPresetId: 'focus-15-no-time-15',
    focusLevel: 'F15',
    baseFreqHz: 224,
    background: { type: 'asset', assetId: 'nattkatt', mixDb: -26 },
    breathPattern: 'coherent-5.5',
    useCase: 'Drop into work without harsh stimulation.',
    description: 'A steady theta-leaning focus arc for long concentration blocks and uninterrupted deep work.',
    bestFor: 'Writing, coding, studying, and analytical flow work.',
    ritual: 'Queue your task first, then press render once the desk is clear.'
  }),
  createTemplate({
    id: 'study-lock',
    title: 'Study Lock',
    shortLabel: 'Study',
    category: 'Focus',
    accent: 'gold',
    journeyPresetId: 'focus-15-no-time-15',
    focusLevel: 'F12',
    baseFreqHz: 232,
    background: { type: 'asset', assetId: 'lumina', mixDb: -25 },
    breathPattern: 'coherent-5.5',
    useCase: 'Stabilize attention for absorb-and-recall work.',
    description: 'Designed to support long reading sessions, memorization, and consistent cognitive pacing.',
    bestFor: 'Exam prep, reading dense material, or lecture review.',
    ritual: 'Use a clean desk and keep notifications off for the full session.'
  }),
  createTemplate({
    id: 'code-tunnel',
    title: 'Code Tunnel',
    shortLabel: 'Code',
    category: 'Focus',
    accent: 'ice',
    journeyPresetId: 'focus-15-no-time-15',
    focusLevel: 'F15',
    baseFreqHz: 218,
    background: null,
    breathPattern: 'coherent-5.5',
    useCase: 'Stay locked in on pure implementation.',
    description: 'A cleaner carrier-first template with minimal softening for people who want signal over scenery.',
    bestFor: 'Coding, debugging, architecture sessions, and refactors.',
    ritual: 'Best with headphones and a no-context-switch block.'
  }),
  createTemplate({
    id: 'writer-window',
    title: 'Writer Window',
    shortLabel: 'Write',
    category: 'Focus',
    accent: 'copper',
    journeyPresetId: 'focus-15-no-time-15',
    focusLevel: 'F12',
    baseFreqHz: 236,
    background: { type: 'asset', assetId: 'papa', mixDb: -27 },
    breathPattern: 'coherent-5.5',
    useCase: 'Hold attention while language stays fluid.',
    description: 'Focused enough for structure, soft enough for phrasing and voice to stay natural.',
    bestFor: 'Drafting, editing, outlining, and long-form writing.',
    ritual: 'Open one document, one tab, and stay inside the window.'
  }),
  createTemplate({
    id: 'pre-meeting-clarity',
    title: 'Pre-Meeting Clarity',
    shortLabel: 'Clarity',
    category: 'Focus',
    accent: 'emerald',
    journeyPresetId: 'focus-15-no-time-15',
    focusLevel: 'F10',
    baseFreqHz: 244,
    background: { type: 'asset', assetId: 'lumina', mixDb: -25 },
    breathPattern: 'box',
    defaultLengthSec: 600,
    useCase: 'Sharpen before a conversation that matters.',
    description: 'Shorter, cleaner, and slightly brighter for presence, listening, and articulate thinking.',
    bestFor: 'Meetings, calls, interviews, or performance prep.',
    ritual: 'Use it immediately before you need to speak.'
  }),
  createTemplate({
    id: 'morning-clarity',
    title: 'Morning Clarity',
    shortLabel: 'Morning',
    category: 'Focus',
    accent: 'gold',
    journeyPresetId: 'focus-15-no-time-15',
    focusLevel: 'F10',
    baseFreqHz: 246,
    background: { type: 'asset', assetId: 'lumina', mixDb: -24 },
    breathPattern: 'coherent-5.5',
    useCase: 'Wake the mind up without caffeine-style sharpness.',
    description: 'A brighter, cleaner front-end for building calm momentum at the start of the day.',
    bestFor: 'Morning journaling, planning, or starting the first focus block.',
    ritual: 'Use after water, before inbox.'
  }),
  createTemplate({
    id: 'decision-focus',
    title: 'Decision Focus',
    shortLabel: 'Decide',
    category: 'Focus',
    accent: 'copper',
    journeyPresetId: 'focus-15-no-time-15',
    focusLevel: 'F15',
    baseFreqHz: 228,
    background: null,
    breathPattern: 'box',
    useCase: 'Reduce noise before strategic thinking.',
    description: 'Minimalist and firmer, built for synthesis, prioritization, and clear calls.',
    bestFor: 'Strategy sessions, decision reviews, and planning windows.',
    ritual: 'Enter with one question you need to resolve.'
  }),
  createTemplate({
    id: 'rainy-focus',
    title: 'Rainy Focus',
    shortLabel: 'Rainy',
    category: 'Focus',
    accent: 'ice',
    journeyPresetId: 'focus-15-no-time-15',
    focusLevel: 'F12',
    baseFreqHz: 220,
    background: { type: 'asset', assetId: 'nattkatt', mixDb: -27 },
    breathPattern: 'coherent-5.5',
    useCase: 'A softer focus field with more atmosphere.',
    description: 'Less clinical than a hard focus template, with a nocturnal calm that still supports sustained work.',
    bestFor: 'Deep reading, research, or creative-adjacent concentration.',
    ritual: 'Good for late-night work blocks.'
  }),
  createTemplate({
    id: 'deep-recovery',
    title: 'Deep Recovery',
    shortLabel: 'Recover',
    category: 'Recovery',
    accent: 'emerald',
    journeyPresetId: 'deep-reset-15',
    focusLevel: 'F12',
    baseFreqHz: 228,
    background: { type: 'asset', assetId: 'mindsEyes', mixDb: -25 },
    breathPattern: 'coherent-5.5',
    useCase: 'Let the body soften and restore.',
    description: 'A restorative descent with a slow center near the delta edge and a deliberate return.',
    bestFor: 'Stress recovery, nervous system downshifts, and end-of-day restoration.',
    ritual: 'Best lying down with the lights low.'
  }),
  createTemplate({
    id: 'post-workout-recovery',
    title: 'Post-Workout Recovery',
    shortLabel: 'Restore',
    category: 'Recovery',
    accent: 'emerald',
    journeyPresetId: 'deep-reset-15',
    focusLevel: 'F12',
    baseFreqHz: 230,
    background: { type: 'asset', assetId: 'papa', mixDb: -26 },
    breathPattern: 'coherent-5.5',
    useCase: 'Shift out of physical intensity without crashing.',
    description: 'Grounded and restorative, with a calmer body-led feel after training or exertion.',
    bestFor: 'After lifting, long runs, hard classes, or heat exposure.',
    ritual: 'Hydrate first, then let the shoulders and jaw soften.'
  }),
  createTemplate({
    id: 'after-travel-recovery',
    title: 'After Travel Recovery',
    shortLabel: 'Travel',
    category: 'Recovery',
    accent: 'copper',
    journeyPresetId: 'deep-reset-15',
    focusLevel: 'F12',
    baseFreqHz: 222,
    background: { type: 'asset', assetId: 'nattkatt', mixDb: -27 },
    breathPattern: 'coherent-5.5',
    useCase: 'Recover from time-zone drift and environmental overload.',
    description: 'Heavier in the body, slower in the middle, and good at taking the edge off travel fatigue.',
    bestFor: 'Flights, hotel stays, road trips, and disrupted routines.',
    ritual: 'Use once you are physically settled and can stay still.'
  }),
  createTemplate({
    id: 'nervous-system-downshift',
    title: 'Nervous System Downshift',
    shortLabel: 'Downshift',
    category: 'Recovery',
    accent: 'emerald',
    journeyPresetId: 'deep-reset-15',
    focusLevel: 'F12',
    baseFreqHz: 226,
    background: { type: 'asset', assetId: 'mindsEyes', mixDb: -26 },
    breathPattern: '4-7-8',
    useCase: 'Help the whole system stop bracing.',
    description: 'Slow, reassuring, and aimed at reducing the feeling of internal acceleration.',
    bestFor: 'High-stress evenings, emotional overload, or post-adrenaline recovery.',
    ritual: 'Keep the exhale longer than the inhale and let the sound do less.'
  }),
  createTemplate({
    id: 'body-scan-reset',
    title: 'Body Scan Reset',
    shortLabel: 'Body',
    category: 'Recovery',
    accent: 'ice',
    journeyPresetId: 'deep-reset-15',
    focusLevel: 'F12',
    baseFreqHz: 224,
    background: null,
    breathPattern: 'coherent-5.5',
    useCase: 'A cleaner body-led restorative session.',
    description: 'Carrier first, minimal texture, and useful when you want to notice sensation without extra scenery.',
    bestFor: 'Somatic check-ins, stretching, or body scan meditations.',
    ritual: 'Lie flat or sit upright without shifting once it starts.'
  }),
  createTemplate({
    id: 'sunset-recovery',
    title: 'Sunset Recovery',
    shortLabel: 'Sunset',
    category: 'Recovery',
    accent: 'copper',
    journeyPresetId: 'deep-reset-15',
    focusLevel: 'F12',
    baseFreqHz: 225,
    background: { type: 'asset', assetId: 'mindsEyes', mixDb: -25 },
    breathPattern: 'coherent-5.5',
    useCase: 'A softer landing between daylight and night.',
    description: 'Warm, paced, and restorative without drifting too far into sleepiness.',
    bestFor: 'End-of-day transitions, sunset walks indoors, or evening reflection.',
    ritual: 'Use when you want the day to end cleanly, not abruptly.'
  }),
  createTemplate({
    id: 'sleep-gate',
    title: 'Sleep Gate',
    shortLabel: 'Sleep',
    category: 'Recovery',
    accent: 'emerald',
    journeyPresetId: 'deep-reset-15',
    focusLevel: 'F12',
    baseFreqHz: 216,
    background: { type: 'asset', assetId: 'nattkatt', mixDb: -28 },
    breathPattern: '4-7-8',
    defaultLengthSec: 1200,
    useCase: 'Ease into the threshold before sleep.',
    description: 'Lower, slower, and a little darker in tone for people who want a clean pre-sleep gate.',
    bestFor: 'Sleep prep, insomnia-support routines, or night resets.',
    ritual: 'Use in bed or wherever you intend to stay.'
  }),
  createTemplate({
    id: 'pre-sleep-soften',
    title: 'Pre-Sleep Soften',
    shortLabel: 'Soften',
    category: 'Recovery',
    accent: 'gold',
    journeyPresetId: 'deep-reset-15',
    focusLevel: 'F12',
    baseFreqHz: 220,
    background: { type: 'asset', assetId: 'mindsEyes', mixDb: -27 },
    breathPattern: 'coherent-5.5',
    defaultLengthSec: 1200,
    useCase: 'Take the edge off without going too deep too fast.',
    description: 'A softer and slightly brighter sleepward session for easing into rest.',
    bestFor: 'Reading-to-sleep transitions or gentle downshifts before bed.',
    ritual: 'Start seated, finish reclined.'
  }),
  createTemplate({
    id: 'creative-drift',
    title: 'Creative Drift',
    shortLabel: 'Create',
    category: 'Creative',
    accent: 'rose',
    journeyPresetId: 'creative-hypnagogia-15',
    focusLevel: 'F12',
    baseFreqHz: 242,
    background: { type: 'asset', assetId: 'scatter', mixDb: -25 },
    breathPattern: 'box',
    useCase: 'Open imagery, ideas, and intuitive drift.',
    description: 'A liminal alpha-theta design for sketching, journaling, ideation, and visual drift.',
    bestFor: 'Creative planning, brainstorming, and idea capture.',
    ritual: 'Keep a notebook nearby for the return.'
  }),
  createTemplate({
    id: 'idea-flow',
    title: 'Idea Flow',
    shortLabel: 'Ideas',
    category: 'Creative',
    accent: 'rose',
    journeyPresetId: 'creative-hypnagogia-15',
    focusLevel: 'F12',
    baseFreqHz: 246,
    background: { type: 'asset', assetId: 'scatter', mixDb: -24 },
    breathPattern: 'box',
    useCase: 'Nudge the mind into generative motion.',
    description: 'Slightly brighter and more active than a dreamy template, while still staying spacious.',
    bestFor: 'Naming, campaign ideas, concepts, and early creative exploration.',
    ritual: 'Good before whiteboarding or sketching.'
  }),
  createTemplate({
    id: 'visual-flow',
    title: 'Visual Flow',
    shortLabel: 'Visual',
    category: 'Creative',
    accent: 'rose',
    journeyPresetId: 'creative-hypnagogia-15',
    focusLevel: 'F12',
    baseFreqHz: 240,
    background: { type: 'asset', assetId: 'mindsEyes', mixDb: -25 },
    breathPattern: 'coherent-5.5',
    useCase: 'Support image-led thinking and spatial imagination.',
    description: 'A more cinematic template for design thinking, visual work, and inner imagery.',
    bestFor: 'Moodboards, visual design, and scene-building.',
    ritual: 'Best when you want less language and more image.'
  }),
  createTemplate({
    id: 'dream-notes',
    title: 'Dream Notes',
    shortLabel: 'Dream',
    category: 'Creative',
    accent: 'rose',
    journeyPresetId: 'creative-hypnagogia-15',
    focusLevel: 'F12',
    baseFreqHz: 232,
    background: { type: 'asset', assetId: 'mindsEyes', mixDb: -26 },
    breathPattern: 'coherent-5.5',
    useCase: 'Skim the edge where symbolic material surfaces.',
    description: 'More reflective, slower, and better for imagery, dream residue, and symbolic association.',
    bestFor: 'Morning pages, reflection, or imagination work.',
    ritual: 'Use soon after waking or before journaling.'
  }),
  createTemplate({
    id: 'open-imagery',
    title: 'Open Imagery',
    shortLabel: 'Imagery',
    category: 'Creative',
    accent: 'rose',
    journeyPresetId: 'creative-hypnagogia-15',
    focusLevel: 'F12',
    baseFreqHz: 244,
    background: { type: 'asset', assetId: 'scatter', mixDb: -25 },
    breathPattern: 'coherent-5.5',
    useCase: 'Expand the visual field without forcing it.',
    description: 'Gentle enough for daydreaming, structured enough to stay coherent.',
    bestFor: 'Visualization, ideation, and open-ended reflection.',
    ritual: 'Let images arrive; do not chase them.'
  }),
  createTemplate({
    id: 'reflective-journal',
    title: 'Reflective Journal',
    shortLabel: 'Journal',
    category: 'Creative',
    accent: 'copper',
    journeyPresetId: 'creative-hypnagogia-15',
    focusLevel: 'F10',
    baseFreqHz: 238,
    background: { type: 'asset', assetId: 'papa', mixDb: -27 },
    breathPattern: 'coherent-5.5',
    useCase: 'Create a softer mental field for honest writing.',
    description: 'Reflective and grounded, with enough openness to help language surface naturally.',
    bestFor: 'Journaling, debriefing, and self-inquiry.',
    ritual: 'Render it before writing if you want a longer session.'
  }),
  createTemplate({
    id: 'meditation-onramp',
    title: 'Meditation Onramp',
    shortLabel: 'Meditate',
    category: 'Meditation',
    accent: 'gold',
    journeyPresetId: 'induction-alpha-theta-integration-15',
    focusLevel: 'F10',
    baseFreqHz: 234,
    background: { type: 'asset', assetId: 'lumina', mixDb: -26 },
    breathPattern: 'coherent-5.5',
    useCase: 'Ease into stillness if silent meditation feels abrupt.',
    description: 'A clean induction template for people who want support entering meditation without lots of complexity.',
    bestFor: 'Pre-meditation settling or first 15 minutes of a contemplative sit.',
    ritual: 'Use it as the bridge into silence.'
  }),
  createTemplate({
    id: 'jet-lag-ease',
    title: 'Jet Lag Ease',
    shortLabel: 'Jet Lag',
    category: 'Recovery',
    accent: 'ice',
    journeyPresetId: 'deep-reset-15',
    focusLevel: 'F12',
    baseFreqHz: 222,
    background: { type: 'asset', assetId: 'mindsEyes', mixDb: -26 },
    breathPattern: 'coherent-5.5',
    useCase: 'Help the mind and body stop feeling out of phase.',
    description: 'Balanced between reset and restoration for displaced schedules and overstimulated systems.',
    bestFor: 'Jet lag, odd hours, or nervous-system mismatch after travel.',
    ritual: 'Use at your new destination once you can stay still.'
  })
];

function buildBackgroundLayer(template, journey) {
  const resolvedBackground = template.background === undefined ? journey.background : template.background;
  if (!resolvedBackground) {
    return null;
  }

  if (resolvedBackground.type === 'asset') {
    return {
      id: 'layer-background',
      type: 'background',
      params: {
        sourceType: 'asset',
        assetId: resolvedBackground.assetId,
        mixDb: resolvedBackground.mixDb ?? -24
      }
    };
  }

  return {
    id: 'layer-background',
    type: 'background',
    params: {
      sourceType: 'ocean',
      mixDb: resolvedBackground.mixDb ?? -24
    }
  };
}

export function buildTemplateSessionSpec(template, overrides = {}) {
  const nextTemplate = template || consumerTemplateOptions[0];
  const journey = buildJourneyBlueprint({
    journeyPresetId: nextTemplate.journeyPresetId,
    totalLengthSec: overrides.lengthSec ?? nextTemplate.defaultLengthSec,
    baseFreqHz: overrides.baseFreqHz ?? nextTemplate.baseFreqHz,
    focusLevel: overrides.focusLevel ?? nextTemplate.focusLevel
  });

  const backgroundLayer = buildBackgroundLayer(nextTemplate, journey);
  const layers = [
    {
      id: 'layer-binaural-base',
      type: 'binaural',
      params: {
        baseFreqHz: journey.baseFreqHz,
        delta: {
          from: journey.stages[0]?.deltaHz?.from ?? 8,
          to: journey.stages[journey.stages.length - 1]?.deltaHz?.to ?? 6
        },
        mixDb: -10
      }
    },
    {
      id: 'layer-breath',
      type: 'breath',
      params: {
        pattern: overrides.breathPattern ?? nextTemplate.breathPattern ?? journey.breathPattern ?? 'coherent-5.5',
        depth: 0.12
      }
    }
  ];

  if (backgroundLayer) {
    layers.splice(1, 0, backgroundLayer);
  }

  return {
    version: 2,
    journeyPresetId: journey.journeyPresetId,
    focusLevel: journey.focusLevel,
    lengthSec: journey.totalLengthSec,
    baseFreqHz: journey.baseFreqHz,
    deltaHz: journey.stages[0]?.deltaHz?.from ?? 8,
    volumeDb: -14,
    breathRate: 0.095,
    layers,
    stages: journey.stages
  };
}

export const defaultSessionSpec = buildTemplateSessionSpec(consumerTemplateOptions[0]);
