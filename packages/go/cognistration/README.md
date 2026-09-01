# Cognistration Go client

Small standard-library client for the public MCP contract.

```go
client := cognistration.NewClient("")
result, err := client.MCP("tools/list", map[string]any{})
```

See the [developer docs](https://cognistration.com/docs). The client is read-only by default and does not handle passwords, payment credentials, or private diary data.
