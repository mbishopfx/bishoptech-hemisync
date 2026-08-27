import { MCP_PROTOCOL_VERSION, MCP_SERVER_NAME, MCP_SERVER_VERSION } from '../agentic/mcp-contract.js';

const ucpAgentMeta = {
  type: 'object',
  properties: {
    'ucp-agent': {
      type: 'object',
      properties: {
        profile: { type: 'string', format: 'uri' }
      },
      required: ['profile'],
      additionalProperties: true
    },
    'idempotency-key': { type: 'string', minLength: 8, maxLength: 80 }
  },
  required: ['ucp-agent'],
  additionalProperties: true
};

const ucpAgentMetaWithIdempotency = {
  ...ucpAgentMeta,
  required: ['ucp-agent', 'idempotency-key']
};

const buyer = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', maxLength: 254 },
    first_name: { type: 'string', maxLength: 80 },
    last_name: { type: 'string', maxLength: 80 },
    phone_number: { type: 'string', maxLength: 40 }
  },
  additionalProperties: false
};

const checkout = {
  type: 'object',
  properties: {
    buyer,
    line_items: {
      type: 'array',
      minItems: 1,
      maxItems: 1,
      items: {
        type: 'object',
        properties: {
          item: {
            type: 'object',
            properties: { id: { type: 'string', minLength: 1, maxLength: 120 } },
            required: ['id'],
            additionalProperties: true
          },
          quantity: { type: 'integer', const: 1 }
        },
        required: ['item', 'quantity'],
        additionalProperties: true
      }
    },
    currency: { type: 'string', enum: ['USD', 'usd'] },
    payment: { type: 'object', additionalProperties: true }
  },
  required: ['line_items'],
  additionalProperties: true
};

const completeCheckout = {
  type: 'object',
  properties: {
    payment: { type: 'object', additionalProperties: true },
    risk_signals: { type: 'object', additionalProperties: true }
  },
  required: ['payment'],
  additionalProperties: true
};

const operationInput = (properties, required, metaSchema = ucpAgentMeta) => ({
  type: 'object',
  properties: { meta: metaSchema, ...properties },
  required,
  additionalProperties: false
});

export const UCP_MCP_PROTOCOL_VERSION = MCP_PROTOCOL_VERSION;
export const UCP_MCP_SERVER_INFO = {
  name: `${MCP_SERVER_NAME}-ucp-shopping`,
  version: MCP_SERVER_VERSION
};

export const UCP_MCP_INSTRUCTIONS = 'Use the published Cognistration catalog. Checkout totals are server-authoritative. Hosted payment requires a buyer review, and payment credentials must never be sent to this service unless a negotiated UCP payment handler explicitly allows them.';

export const UCP_MCP_TOOLS = Object.freeze([
  {
    name: 'create_checkout',
    description: 'Create a Cognistration checkout for one published tone pack.',
    inputSchema: operationInput({ checkout }, ['meta', 'checkout']),
    annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false }
  },
  {
    name: 'get_checkout',
    description: 'Read the current state, totals, payment options, and next step for a Cognistration checkout.',
    inputSchema: operationInput({ id: { type: 'string', minLength: 1, maxLength: 120 } }, ['meta', 'id']),
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false }
  },
  {
    name: 'update_checkout',
    description: 'Update the buyer or selected tone pack on an incomplete Cognistration checkout.',
    inputSchema: operationInput({
      id: { type: 'string', minLength: 1, maxLength: 120 },
      checkout
    }, ['meta', 'id', 'checkout']),
    annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false }
  },
  {
    name: 'complete_checkout',
    description: 'Complete a Cognistration checkout after the buyer has approved the final order and payment step.',
    inputSchema: operationInput({
      id: { type: 'string', minLength: 1, maxLength: 120 },
      checkout: completeCheckout
    }, ['meta', 'id', 'checkout'], ucpAgentMetaWithIdempotency),
    annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false }
  },
  {
    name: 'cancel_checkout',
    description: 'Cancel an incomplete Cognistration checkout.',
    inputSchema: operationInput({ id: { type: 'string', minLength: 1, maxLength: 120 } }, ['meta', 'id'], ucpAgentMetaWithIdempotency),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false }
  }
]);

export const UCP_MCP_TOOL_NAMES = new Set(UCP_MCP_TOOLS.map((tool) => tool.name));
