export const WEBMCP_CONTRACT_ID = 'cognistration-webmcp-tone-controls';
export const WEBMCP_CONTRACT_VERSION = '0.6.0';
export const MEMBER_WEBMCP_CONTRACT_ID = 'cognistration-member-workspace';
export const MEMBER_WEBMCP_CONTRACT_VERSION = '0.2.0';

const noArgumentsSchema = {
  type: 'object',
  properties: {},
  additionalProperties: false
};

const ritualPlanInputSchema = {
  type: 'object',
  properties: {
    intention: { type: 'string', minLength: 1, maxLength: 240, description: 'What the listener wants to practice next.' },
    durationMin: { type: 'integer', minimum: 5, maximum: 60, default: 20, description: 'Planned ritual length in minutes.' },
    mode: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'], description: 'Optional listening mode.' },
    targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'], description: 'Optional main state override.' }
  },
  required: ['intention'],
  additionalProperties: false
};

const recipeInputSchema = {
  type: 'object',
  properties: {
    targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'], default: 'theta' },
    carrierHz: { type: 'integer', minimum: 100, maximum: 400, default: 200 },
    beatHz: { type: 'number', minimum: 0.5, maximum: 40, default: 6 },
    volume: { type: 'integer', minimum: 0, maximum: 100, default: 72 },
    durationSec: { type: 'integer', minimum: 60, maximum: 3600, default: 120 },
    intentionLabel: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'], default: 'reflect', description: 'A safe direction label, not diary text.' }
  },
  additionalProperties: false
};

const scienceGuideInputSchema = {
  type: 'object',
  properties: {
    toneId: { type: 'string', minLength: 1, maxLength: 120, description: 'Optional ID from the public tone catalog.' },
    state: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
    targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
    carrierHz: { type: 'number', minimum: 100, maximum: 400 },
    beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
    volume: { type: 'number', minimum: 0, maximum: 100 },
    intentionLabel: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'] }
  },
  additionalProperties: false
};

const sessionScoreStageSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', minLength: 1, maxLength: 48, pattern: '^[a-z0-9][a-z0-9-]*$' },
    label: { type: 'string', minLength: 1, maxLength: 48 },
    state: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
    durationSec: { type: 'integer', minimum: 15, maximum: 3600 },
    carrierHz: { type: 'integer', minimum: 50, maximum: 2000, description: 'Constant carrier for this stage.' },
    beatHz: {
      type: 'object',
      properties: {
        from: { type: 'number', minimum: 0.1, maximum: 40, multipleOf: 0.1 },
        to: { type: 'number', minimum: 0.1, maximum: 40, multipleOf: 0.1 }
      },
      required: ['from', 'to'],
      additionalProperties: false
    },
    volume: { type: 'integer', minimum: 0, maximum: 100 }
  },
  required: ['id', 'label', 'state', 'durationSec', 'carrierHz', 'beatHz', 'volume'],
  additionalProperties: false
};

const sessionScoreSoundSchema = {
  type: 'object',
  properties: {
    entrainmentModes: {
      type: 'object',
      properties: {
        binaural: { type: 'boolean', default: true },
        monaural: { type: 'boolean', default: false },
        isochronic: { type: 'boolean', default: false }
      },
      additionalProperties: false,
      description: 'Choose one or more signal modes.'
    },
    background: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['none', 'ocean', 'asset'] },
        assetId: { type: 'string', enum: ['lumina', 'mindsEyes', 'nattkatt', 'papa', 'scatter'] },
        mixDb: { type: 'number', minimum: -60, maximum: -6 },
        crossfadeSec: { type: 'number', minimum: 0, maximum: 10 }
      },
      required: ['type'],
      additionalProperties: false,
      description: 'Approved ambience metadata; browser preview remains signal-only.'
    },
    breathGuide: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        pattern: { type: 'string', enum: ['coherent-5.5', '4-7-8', 'box'] },
        bpm: { type: 'number', minimum: 2, maximum: 12 }
      },
      additionalProperties: false
    },
    fades: {
      type: 'object',
      properties: {
        inSec: { type: 'number', minimum: 0, maximum: 60 },
        outSec: { type: 'number', minimum: 0, maximum: 60 }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
};

const sessionScoreSoundPatchSchema = {
  type: 'object',
  properties: {
    entrainmentModes: { type: 'object', properties: { binaural: { type: 'boolean' }, monaural: { type: 'boolean' }, isochronic: { type: 'boolean' } }, additionalProperties: false },
    background: sessionScoreSoundSchema.properties.background,
    breathGuide: { type: 'object', properties: { enabled: { type: 'boolean' }, pattern: { type: 'string', enum: ['coherent-5.5', '4-7-8', 'box'] }, bpm: { type: 'number', minimum: 2, maximum: 12 } }, additionalProperties: false },
    fades: { type: 'object', properties: { inSec: { type: 'number', minimum: 0, maximum: 60 }, outSec: { type: 'number', minimum: 0, maximum: 60 } }, additionalProperties: false }
  },
  additionalProperties: false
};

const sessionScoreSchema = {
  type: 'object',
  properties: {
    durationSec: { type: 'integer', minimum: 60, maximum: 3600 },
    stages: { type: 'array', minItems: 1, maxItems: 12, items: sessionScoreStageSchema },
    sound: sessionScoreSoundSchema
  },
  required: ['durationSec', 'stages'],
  additionalProperties: false
};

export const WEBMCP_TOOL_DEFINITIONS = [
  {
    name: 'cognistration_compose_session_score',
    description: 'Compose a browser-local full-spectrum score with up to twelve stages. No save or render.',
    inputSchema: {
      type: 'object',
      properties: {
        intention: { type: 'string', minLength: 1, maxLength: 240 },
        direction: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'], default: 'focus' },
        durationSec: { type: 'integer', minimum: 60, maximum: 3600, default: 600 },
        score: sessionScoreSchema,
        sound: sessionScoreSoundSchema
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_session', sideEffect: 'updates_visible_score', consent: 'none'
  },
  {
    name: 'cognistration_refine_session_score_stage',
    description: 'Refine one score stage or its full-spectrum sound profile; duration and order stay fixed.',
    inputSchema: {
      type: 'object',
      properties: {
        stageId: { type: 'string', minLength: 1, maxLength: 48 },
        label: { type: 'string', minLength: 1, maxLength: 48 },
        state: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
        carrierHz: { type: 'integer', minimum: 50, maximum: 2000 },
        beatFromHz: { type: 'number', minimum: 0.1, maximum: 40, multipleOf: 0.1 },
        beatToHz: { type: 'number', minimum: 0.1, maximum: 40, multipleOf: 0.1 },
        volume: { type: 'integer', minimum: 0, maximum: 100 },
        soundPatch: sessionScoreSoundPatchSchema
      },
      required: ['stageId'], additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    authorization: 'public_session', sideEffect: 'updates_visible_score', consent: 'none'
  },
  {
    name: 'cognistration_undo_session_score',
    description: 'Undo browser-local score revisions.',
    inputSchema: { type: 'object', properties: { steps: { type: 'integer', minimum: 1, maximum: 20, default: 1 } }, additionalProperties: false },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    authorization: 'public_session', sideEffect: 'updates_visible_score', consent: 'none'
  },
  {
    name: 'cognistration_select_session_score_stage',
    description: 'Select a score stage for inspection or preview; no audio starts.',
    inputSchema: { type: 'object', properties: { stageId: { type: 'string', minLength: 1, maxLength: 48 } }, required: ['stageId'], additionalProperties: false },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_session', sideEffect: 'updates_visible_selection', consent: 'none'
  },
  {
    name: 'cognistration_preview_session_score',
    description: 'Start a capped stage preview only after confirmation and audio readiness.',
    inputSchema: { type: 'object', properties: { confirmed: { type: 'boolean', const: true }, stageId: { type: 'string', minLength: 1, maxLength: 48 } }, required: ['confirmed'], additionalProperties: false },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    authorization: 'public_session', sideEffect: 'starts_local_audio_after_confirmation', consent: 'explicit_audio_confirmation'
  },
  {
    name: 'cognistration_get_session_state',
    description: 'Read the visible Cognistration tone machine state and current browser controls.',
    inputSchema: noArgumentsSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none',
    consent: 'none'
  },
  {
    name: 'cognistration_set_session_controls',
    description: 'Set bounded, visible tone-machine controls in the current browser session, such as a gamma direction with a 246 Hz carrier. This does not save an account record.',
    inputSchema: {
      type: 'object',
      properties: {
        targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'], description: 'Visible target state.' },
        carrierHz: { type: 'number', minimum: 100, maximum: 400, description: 'Base carrier frequency in Hz.' },
        beatHz: { type: 'number', minimum: 0.5, maximum: 40, description: 'Left/right difference in Hz.' },
        volume: { type: 'number', minimum: 0, maximum: 100, description: 'Master volume percentage.' }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'updates_visible_controls',
    consent: 'none'
  },
  {
    name: 'cognistration_adjust_session_control',
    description: 'Make a relative live change to one visible tone-machine slider. Map speed up or slow down to rhythm faster or slower, carrier smaller or larger to the shared tone, and quieter or louder to volume. The existing oscillator and gain nodes are updated without pausing playback.',
    inputSchema: {
      type: 'object',
      properties: {
        control: { type: 'string', enum: ['carrier', 'rhythm', 'volume'], description: 'The slider to move.' },
        direction: { type: 'string', enum: ['smaller', 'larger', 'slower', 'faster', 'quieter', 'louder'], description: 'Carrier uses smaller/larger; rhythm uses slower/faster; volume uses quieter/louder.' },
        step: { type: 'number', minimum: 0.5, maximum: 50, description: 'Optional magnitude. Defaults are 24 Hz carrier, 1 Hz rhythm, or 8 volume points.' }
      },
      required: ['control', 'direction'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'updates_visible_controls_and_live_audio',
    consent: 'none'
  },
  {
    name: 'cognistration_set_session_direction',
    description: 'Select a published Delta, Theta, Alpha, Beta, or Gamma direction in the visible machine. This covers direction buttons and presets and keeps any current audio running while the beat and optional controls update.',
    inputSchema: {
      type: 'object',
      properties: {
        targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'], description: 'Published direction.' },
        carrierHz: { type: 'number', minimum: 100, maximum: 400, description: 'Optional shared carrier preset.' },
        beatHz: { type: 'number', minimum: 0.5, maximum: 40, description: 'Optional rhythm preset.' },
        volume: { type: 'number', minimum: 0, maximum: 100, description: 'Optional volume preset.' }
      },
      required: ['targetState'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'updates_visible_controls_and_live_audio',
    consent: 'none'
  },
  {
    name: 'cognistration_nudge_carrier',
    description: 'Read the current visible carrier and move it a modest bounded step smaller or larger, returning both the previous and new absolute values.',
    inputSchema: {
      type: 'object',
      properties: {
        direction: { type: 'string', enum: ['smaller', 'larger'], description: 'Whether the carrier should move down or up.' },
        stepHz: { type: 'number', minimum: 1, maximum: 50, default: 24, description: 'Absolute carrier adjustment in hertz.' }
      },
      required: ['direction'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'updates_visible_controls',
    consent: 'none'
  },
  {
    name: 'cognistration_generate_tone',
    description: 'Match a short user intention to a public Cognistration tone and apply the resulting controls to the visible machine.',
    inputSchema: {
      type: 'object',
      properties: {
        intention: { type: 'string', minLength: 1, maxLength: 240, description: 'What the listener wants to practice next.' }
      },
      required: ['intention'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    authorization: 'public_preview',
    sideEffect: 'sets_preview_cookie_and_updates_visible_controls',
    consent: 'preview_limit_disclosed'
  },
  {
    name: 'cognistration_clarify_intention',
    description: 'Help the listener choose a simple session direction when their request is too broad to route confidently. This returns choices only and does not change controls or start audio.',
    inputSchema: {
      type: 'object',
      properties: {
        intention: { type: 'string', minLength: 1, maxLength: 240, description: 'What the listener has in mind, even if it is incomplete.' }
      },
      required: ['intention'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none',
    consent: 'none'
  },
  {
    name: 'cognistration_calibrate_tone',
    description: 'Adjust the visible machine from a listener response such as too intense, too quiet, too bright, too slow, too flat, or just right. It never starts audio.',
    inputSchema: {
      type: 'object',
      properties: {
        feedback: { type: 'string', enum: ['too_intense', 'too_quiet', 'too_bright', 'too_slow', 'too_flat', 'just_right'] },
        targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
        carrierHz: { type: 'number', minimum: 100, maximum: 400 },
        beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
        volume: { type: 'number', minimum: 0, maximum: 100 }
      },
      required: ['feedback'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'updates_visible_controls',
    consent: 'none'
  },
  {
    name: 'cognistration_compare_tone_directions',
    description: 'Compare a few approved public listening directions for an intention, including practical fit and tradeoffs without making a medical claim.',
    inputSchema: {
      type: 'object',
      properties: {
        intention: { type: 'string', minLength: 1, maxLength: 240, description: 'What the listener wants to practice next.' },
        limit: { type: 'integer', minimum: 2, maximum: 4, default: 3, description: 'Number of directions to compare.' }
      },
      required: ['intention'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none',
    consent: 'none'
  },
  {
    name: 'cognistration_plan_listening_session',
    description: 'Build a bounded arrive, practice, and close plan from an intention. This plans a session without starting audio or saving a record.',
    inputSchema: {
      type: 'object',
      properties: {
        intention: { type: 'string', minLength: 1, maxLength: 240, description: 'What the listener wants to practice next.' },
        durationMin: { type: 'integer', minimum: 5, maximum: 60, default: 20, description: 'Planned session length in minutes.' },
        mode: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'], description: 'Optional listening mode.' },
        targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'], description: 'Optional main state override.' }
      },
      required: ['intention'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none',
    consent: 'none'
  },
  {
    name: 'cognistration_get_session_cue',
    description: 'Get a short journaling, focus, reset, or creative cue to pair with a listening direction. It never reads or stores diary content.',
    inputSchema: {
      type: 'object',
      properties: {
        intention: { type: 'string', minLength: 1, maxLength: 240, description: 'Optional listening intention used to choose the cue.' },
        mode: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'], description: 'Optional cue mode.' }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none',
    consent: 'none'
  },
  {
    name: 'cognistration_begin_ritual',
    description: 'Build and stage an interactive arrive, practice, and close ritual in the visible machine. It applies only the first phase controls; it does not start audio or save a record.',
    inputSchema: ritualPlanInputSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'updates_visible_controls',
    consent: 'none'
  },
  {
    name: 'cognistration_advance_ritual',
    description: 'Move a staged ritual to arrive, practice, or close and apply that phase’s bounded visible controls. The transition is manual and never starts audio.',
    inputSchema: {
      type: 'object',
      properties: {
        phase: { type: 'string', enum: ['arrive', 'practice', 'close'], description: 'The phase to stage next.' }
      },
      required: ['phase'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'updates_visible_controls',
    consent: 'none'
  },
  {
    name: 'cognistration_prepare_session_recipe',
    description: 'Prepare a portable session recipe containing only a safe intention label, state, carrier, beat, volume, and duration. It never includes diary text, account data, or audio.',
    inputSchema: recipeInputSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none',
    consent: 'none'
  },
  {
    name: 'cognistration_open_science_guide',
    description: 'Reveal the visible click-through Cognistration science guide for the current machine direction. It explains the two-channel signal, FFR, descriptive frequency bands, evidence limits, and safe listening; it never starts audio or saves a user record, and its PDF export is a static technical snapshot without diary content.',
    inputSchema: scienceGuideInputSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'reveals_educational_guide',
    consent: 'none'
  },
  {
    name: 'cognistration_search_tone_packs',
    description: 'Public finished tone-pack browsing for relaxation, sleep preparation, journaling, focus, or creative work. Results include metadata and preview tracks without starting audio.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', maxLength: 240, description: 'Optional pack search or intention text.' },
        state: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
        limit: { type: 'integer', minimum: 1, maximum: 8 }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none',
    consent: 'none'
  },
  {
    name: 'cognistration_preview_tone_pack',
    description: 'Start one public tone-pack preview in the current browser after the user or agent explicitly confirms audio should begin. Search for a pack first and use one of its listed tracks.',
    inputSchema: {
      type: 'object',
      properties: {
        packSlug: { type: 'string', minLength: 1, maxLength: 120 },
        trackId: { type: 'string', minLength: 1, maxLength: 160 },
        confirmed: { type: 'boolean', description: 'Must be true to start pack audio.' }
      },
      required: ['packSlug', 'confirmed'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'starts_local_tone_pack_audio',
    consent: 'explicit_confirmation_required'
  },
  {
    name: 'cognistration_get_policy_info',
    description: 'Canonical policy lookup for Cognistration safety, terms, privacy, cookies, AI use, pricing, or account creation, with a source-grounded summary and page link.',
    inputSchema: {
      type: 'object',
      properties: { topic: { type: 'string', enum: ['safety', 'terms', 'privacy', 'cookies', 'ai', 'pricing', 'account'] } },
      required: ['topic'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none',
    consent: 'none'
  },
  {
    name: 'cognistration_get_account_options',
    description: 'Account and access overview for questions about a free trial, account, platform access, or cost. It explains the free public preview and one-time private workspace without collecting credentials or submitting payment.',
    inputSchema: noArgumentsSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none',
    consent: 'none'
  },
  {
    name: 'cognistration_begin_preview',
    description: 'Start the visible browser audio preview after the user or agent explicitly confirms they want audio to begin.',
    inputSchema: {
      type: 'object',
      properties: {
        confirmed: { type: 'boolean', description: 'Must be true to start browser audio.' }
      },
      required: ['confirmed'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'starts_local_browser_audio',
    consent: 'explicit_confirmation_required'
  },
  {
    name: 'cognistration_stop_preview',
    description: 'Stop local browser audio in the visible machine without changing the selected controls. This is safe to repeat.',
    inputSchema: noArgumentsSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'stops_local_browser_audio',
    consent: 'none'
  },
  {
    name: 'cognistration_open_fullscreen',
    description: 'Request the visible machine in the host’s larger display mode without changing its controls or audio.',
    inputSchema: noArgumentsSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'requests_fullscreen_display',
    consent: 'none'
  },
  {
    name: 'cognistration_open_account_signup',
    description: 'Navigate the current browser to the semantic Cognistration account-creation form. The user must review and submit it.',
    inputSchema: noArgumentsSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false, untrustedContentHint: true },
    authorization: 'public_navigation',
    sideEffect: 'navigation_only',
    consent: 'user_submission_required'
  }
];

export const MEMBER_WEBMCP_TOOL_DEFINITIONS = [
  {
    name: 'cognistration_member_get_workspace',
    description: 'Read the signed-in member workspace, including private sessions, recent renders, and access state.',
    inputSchema: noArgumentsSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'authenticated_member',
    sideEffect: 'none',
    consent: 'signed_in_member'
  },
  {
    name: 'cognistration_member_prepare_session',
    description: 'Plan a private Cognistration session from a short intention without saving or rendering it.',
    inputSchema: {
      type: 'object',
      properties: {
        intention: { type: 'string', minLength: 1, maxLength: 240 },
        durationSec: { type: 'integer', minimum: 300, maximum: 1200 },
        targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
        name: { type: 'string', minLength: 1, maxLength: 120 }
      },
      required: ['intention'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'authenticated_member',
    sideEffect: 'none',
    consent: 'none'
  },
  {
    name: 'cognistration_member_clarify_intention',
    description: 'Signed-in access to the same free intent clarifier available to visitors. It returns a few safe directions or a safety-page handoff and never writes private data.',
    inputSchema: {
      type: 'object',
      properties: { intention: { type: 'string', minLength: 1, maxLength: 240 } },
      required: ['intention'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'authenticated_member',
    sideEffect: 'none',
    consent: 'signed_in_member'
  },
  {
    name: 'cognistration_member_calibrate_tone',
    description: 'Bounded tone calibration from feedback such as too intense, too quiet, too bright, too slow, too flat, or just right. The operation remains ephemeral and audio-free.',
    inputSchema: {
      type: 'object',
      properties: {
        feedback: { type: 'string', enum: ['too_intense', 'too_quiet', 'too_bright', 'too_slow', 'too_flat', 'just_right'] },
        targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
        carrierHz: { type: 'integer', minimum: 100, maximum: 400 },
        beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
        volume: { type: 'integer', minimum: 0, maximum: 100 }
      },
      required: ['feedback'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'authenticated_member',
    sideEffect: 'none',
    consent: 'signed_in_member'
  },
  {
    name: 'cognistration_member_compare_tone_directions',
    description: 'Compare two to four approved public tone directions from the private workspace without saving the intention or changing the account.',
    inputSchema: {
      type: 'object',
      properties: {
        intention: { type: 'string', minLength: 1, maxLength: 240 },
        limit: { type: 'integer', minimum: 2, maximum: 4, default: 3 }
      },
      required: ['intention'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'authenticated_member',
    sideEffect: 'none',
    consent: 'signed_in_member'
  },
  {
    name: 'cognistration_member_plan_listening_session',
    description: 'Plan a free arrive, practice, and close listening ritual from the private workspace without creating a Studio record.',
    inputSchema: ritualPlanInputSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'authenticated_member',
    sideEffect: 'none',
    consent: 'signed_in_member'
  },
  {
    name: 'cognistration_member_get_session_cue',
    description: 'Return a short focus, rest, reflection, or creative cue for a signed-in member without reading or storing diary content.',
    inputSchema: {
      type: 'object',
      properties: {
        intention: { type: 'string', minLength: 1, maxLength: 240 },
        mode: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'] }
      },
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'authenticated_member',
    sideEffect: 'none',
    consent: 'signed_in_member'
  },
  {
    name: 'cognistration_member_prepare_session_recipe',
    description: 'Prepare a local technical-settings-only recipe for a signed-in member. It contains no diary text, saved session, or account data.',
    inputSchema: recipeInputSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'authenticated_member',
    sideEffect: 'none',
    consent: 'signed_in_member'
  },
  {
    name: 'cognistration_member_generate_tone',
    description: 'Create a private session and render record from a member intention. Saving and rendering require explicit confirmation.',
    inputSchema: {
      type: 'object',
      properties: {
        intention: { type: 'string', minLength: 1, maxLength: 240 },
        durationSec: { type: 'integer', minimum: 300, maximum: 1200 },
        targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
        name: { type: 'string', minLength: 1, maxLength: 120 },
        confirmed: { type: 'boolean', description: 'Must be true before a private session and render record are created.' },
        idempotencyKey: { type: 'string', pattern: '^[A-Za-z0-9._:-]{8,80}$' },
        startRender: { type: 'boolean', description: 'Whether the client should start the expensive audio render after creation.' }
      },
      required: ['intention', 'confirmed'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    authorization: 'authenticated_member',
    sideEffect: 'creates_private_session_and_render',
    consent: 'explicit_confirmation_required'
  },
  {
    name: 'cognistration_member_start_render',
    description: 'Start a previously created private render after the member explicitly confirms the audio generation cost.',
    inputSchema: {
      type: 'object',
      properties: {
        renderId: { type: 'string', minLength: 1, maxLength: 120 },
        confirmed: { type: 'boolean' }
      },
      required: ['renderId', 'confirmed'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    authorization: 'authenticated_member',
    sideEffect: 'starts_private_audio_render',
    consent: 'explicit_confirmation_required'
  },
  {
    name: 'cognistration_member_get_render',
    description: 'Read one private render owned by the signed-in member and its current delivery state.',
    inputSchema: {
      type: 'object',
      properties: { renderId: { type: 'string', minLength: 1, maxLength: 120 } },
      required: ['renderId'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'authenticated_member',
    sideEffect: 'none',
    consent: 'signed_in_member'
  }
];

export function nativeWebMcpTool(definition, execute) {
  return {
    name: definition.name,
    description: definition.description,
    inputSchema: definition.inputSchema,
    annotations: definition.annotations,
    execute
  };
}

export function webMcpManifestTools() {
  return WEBMCP_TOOL_DEFINITIONS.map(({ name, description, inputSchema, annotations }) => ({
    name,
    description,
    inputSchema,
    annotations
  }));
}

export function memberWebMcpManifestTools() {
  return MEMBER_WEBMCP_TOOL_DEFINITIONS.map(({ name, description, inputSchema, annotations }) => ({
    name,
    description,
    inputSchema,
    annotations
  }));
}
