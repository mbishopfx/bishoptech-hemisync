# @cognistration/sdk

Small dependency-free TypeScript client for the public Cognistration MCP and REST contracts.

```ts
import { CognistrationClient } from '@cognistration/sdk';

const cognistration = new CognistrationClient();
const tools = await cognistration.mcp('tools/list');
const packs = await cognistration.searchTonePacks('focus');
```

Public discovery is anonymous. Keep private tokens in the host credential store and never pass passwords, card data, payment credentials, or diary content to this client. See the [developer docs](https://cognistration.com/docs) and [agent instructions](https://cognistration.com/agent-instructions.md).
