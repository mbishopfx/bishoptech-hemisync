# cognistration

Minimal dependency-free Ruby client for Cognistration's public MCP endpoint.

```ruby
client = Cognistration::Client.new
tools = client.mcp("tools/list")
```

See the [developer docs](https://cognistration.com/docs). Public discovery is anonymous; never send passwords, card data, payment credentials, or private diary content to the client.
