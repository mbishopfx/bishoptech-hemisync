export type BrollCard = {
  kind: 'tool' | 'skill';
  names: string[];
};

// Snapshot of the public Cognistration MCP catalog fetched from the live
// tools/list and skills/list endpoints on 2026-08-30. Two related tool names
// share a card so the complete catalog fits a 28-second voiceover window.
export const brollCards: BrollCard[] = [
  { kind: 'tool', names: ['get_agentic_capabilities', 'search_public_tones'] },
  { kind: 'tool', names: ['get_public_tone', 'recommend_tone'] },
  { kind: 'tool', names: ['clarify_intention', 'calibrate_tone'] },
  { kind: 'tool', names: ['compare_tone_directions', 'plan_listening_session'] },
  { kind: 'tool', names: ['get_session_cue', 'prepare_session_recipe'] },
  { kind: 'tool', names: ['search_public_tone_packs', 'get_public_tone_pack'] },
  { kind: 'tool', names: ['get_policy_info', 'get_account_options'] },
  { kind: 'tool', names: ['open_account_signup', 'get_ios_app_offer'] },
  { kind: 'tool', names: ['open_phone_download_options', 'create_tone_pack_checkout'] },
  { kind: 'tool', names: ['get_tone_pack_delivery', 'open_tone_pack_checkout'] },
  { kind: 'tool', names: ['create_workshop_access_checkout', 'get_workshop_access'] },
  { kind: 'tool', names: ['get_workshop_access_status', 'revoke_workshop_access'] },
  { kind: 'tool', names: ['get_machine_payment_options', 'get_tone_pack_payment_options'] },
  { kind: 'tool', names: ['get_autonomous_payment_options', 'get_machine_control_contract'] },
  { kind: 'tool', names: ['set_machine_controls', 'adjust_machine_controls'] },
  { kind: 'tool', names: ['set_machine_direction', 'start_machine_preview'] },
  { kind: 'tool', names: ['stop_machine_preview', 'open_machine_fullscreen'] },
  { kind: 'tool', names: ['open_machine_generator', 'open_science_guide'] },
  { kind: 'tool', names: ['open_feedback'] },
  { kind: 'skill', names: ['cognistration-agentic-routing'] },
  { kind: 'skill', names: ['cognistration-tone-orchestration'] },
  { kind: 'skill', names: ['cognistration-account-safety'] },
  { kind: 'skill', names: ['cognistration-agent-evaluation'] },
  { kind: 'skill', names: ['cognistration-feedback'] },
];

export const catalogToolCount = brollCards
  .filter((card) => card.kind === 'tool')
  .reduce((count, card) => count + card.names.length, 0);

export const catalogSkillCount = brollCards.filter((card) => card.kind === 'skill').length;
