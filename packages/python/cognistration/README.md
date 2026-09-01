# cognistration

Minimal dependency-free Python client for Cognistration's public MCP and REST surfaces.

```python
from cognistration import CognistrationClient

client = CognistrationClient()
tools = client.mcp("tools/list")
```

Public calls are anonymous. Keep private tokens in a secure host store and never send passwords, card data, payment credentials, or diary content to the client. See the [developer docs](https://cognistration.com/docs).
