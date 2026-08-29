export const WEBMCP_CONTRACT_ID = 'cognistration-webmcp-tone-controls';
export const WEBMCP_CONTRACT_VERSION = '0.5.0';
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

export const WEBMCP_TOOL_DEFINITIONS = [
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
    description: 'Use this when the user wants to browse finished Cognistration tone packs for relaxation, sleep preparation, journaling, focus, or creative work. This returns public metadata and preview tracks without starting audio.',
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
    description: 'Use this when the user asks about Cognistration safety, terms, privacy, cookies, AI use, pricing, or account creation. Return a canonical page link and concise source-grounded summary.',
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
    description: 'Use this when the user asks for a free trial, account, access, or platform cost. Explain the free public preview and the one-time private workspace without collecting credentials or submitting payment.',
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
    name: 'cognistration_open_account_signup',
    description: 'Navigate the current browser to the semantic Cognistration account-creation form. The user must review and submit it.',
    inputSchema: noArgumentsSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
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
    description: 'Use the same free intent clarifier available to visitors while signed in. It returns a few safe directions or a safety-page handoff and never writes private data.',
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
    description: 'Use bounded tone calibration from feedback such as too intense, too quiet, too bright, too slow, too flat, or just right. This remains ephemeral and audio-free.',
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
  return WEBMCP_TOOL_DEFINITIONS.map(({ name, description, inputSchema, annotations, authorization, sideEffect, consent }) => ({
    name,
    description,
    inputSchema,
    annotations,
    authorization,
    sideEffect,
    consent
  }));
}

export function memberWebMcpManifestTools() {
  return MEMBER_WEBMCP_TOOL_DEFINITIONS.map(({ name, description, inputSchema, annotations, authorization, sideEffect, consent }) => ({
    name,
    description,
    inputSchema,
    annotations,
    authorization,
    sideEffect,
    consent
  }));
}
