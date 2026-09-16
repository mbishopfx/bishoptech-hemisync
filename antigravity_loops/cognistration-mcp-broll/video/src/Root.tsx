import { Composition } from 'remotion';
import { McpBroll, MCP_BROLL_DURATION, MCP_BROLL_FPS } from './McpBroll';

export const Root = () => (
  <>
    <Composition
      id="MCPBroll"
      component={McpBroll}
      durationInFrames={MCP_BROLL_DURATION}
      fps={MCP_BROLL_FPS}
      width={1920}
      height={1080}
    />
  </>
);
