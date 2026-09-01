import json
import urllib.request


class CognistrationClient:
    def __init__(self, base_url="https://cognistration.com", access_token=None):
        self.base_url = base_url.rstrip("/")
        self.access_token = access_token

    def mcp(self, method, params=None, request_id="python-sdk-1"):
        headers = {
            "Content-Type": "application/json",
            "MCP-Protocol-Version": "2026-07-28",
            "Mcp-Method": method,
        }
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        request = urllib.request.Request(
            f"{self.base_url}/api/mcp",
            data=json.dumps({"jsonrpc": "2.0", "id": request_id, "method": method, "params": params or {}}).encode(),
            headers=headers,
            method="POST",
        )
        with urllib.request.urlopen(request) as response:
            return json.load(response)

    def capabilities(self):
        with urllib.request.urlopen(f"{self.base_url}/api/capabilities") as response:
            return json.load(response)
