import { z } from 'zod';

export const FEEDBACK_CAPABILITY_ID = 'cognistration-agent-feedback';
export const FEEDBACK_CAPABILITY_VERSION = '0.1.0';
export const FeedbackOpenInputSchema = z.object({}).strict();

export function feedbackOpenState() {
  return {
    capabilityId: FEEDBACK_CAPABILITY_ID,
    version: FEEDBACK_CAPABILITY_VERSION,
    status: 'ready',
    userSubmissionRequired: true,
    persisted: false,
    availableActions: ['thumbs_up', 'thumbs_down', 'optional_note', 'dismiss'],
    message: 'A private in-platform feedback form is ready. Nothing is submitted until the user chooses a rating and presses submit.'
  };
}
