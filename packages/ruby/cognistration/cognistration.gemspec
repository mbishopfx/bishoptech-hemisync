Gem::Specification.new do |spec|
  spec.name          = "cognistration"
  spec.version       = "0.1.0"
  spec.summary       = "Minimal Ruby client for Cognistration's public agent surfaces"
  spec.description   = "A dependency-free client for the public Cognistration MCP endpoint."
  spec.authors       = ["BishopTech"]
  spec.email         = ["matt@bishoptech.dev"]
  spec.homepage      = "https://cognistration.com/docs"
  spec.metadata      = {
    "homepage_uri" => "https://cognistration.com",
    "source_code_uri" => "https://github.com/mbishopfx/bishoptech-hemisync/tree/main/packages/ruby/cognistration",
    "documentation_uri" => "https://cognistration.com/docs"
  }
  spec.license       = "MIT"
  spec.files         = ["lib/cognistration.rb", "README.md", "cognistration.gemspec"]
  spec.require_paths = ["lib"]
  spec.required_ruby_version = ">= 3.0"
end
