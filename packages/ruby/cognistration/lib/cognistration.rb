require "json"
require "net/http"
require "uri"

module Cognistration
  class Client
    def initialize(base_url = "https://cognistration.com", access_token: nil)
      @base_url = base_url.sub(%r{/\z}, "")
      @access_token = access_token
    end

    def mcp(method, params = {}, request_id: "ruby-sdk-1")
      uri = URI("#{@base_url}/api/mcp")
      request = Net::HTTP::Post.new(uri)
      request["Content-Type"] = "application/json"
      request["MCP-Protocol-Version"] = "2026-07-28"
      request["Mcp-Method"] = method
      request["Authorization"] = "Bearer #{@access_token}" if @access_token
      request.body = JSON.generate(jsonrpc: "2.0", id: request_id, method: method, params: params)
      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https") { |http| http.request(request) }
      JSON.parse(response.body)
    end
  end
end
