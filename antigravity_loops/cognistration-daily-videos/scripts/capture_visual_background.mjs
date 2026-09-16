#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { openBrowser } from "../video1/node_modules/@remotion/renderer/dist/index.js";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { url: null, output: null, width: 1080, height: 1920, frames: 2700 };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];
    if (!arg.startsWith("--") && !options.url) options.url = arg;
    else if (arg === "--output") options.output = next;
    else if (arg === "--width") options.width = Number(next);
    else if (arg === "--height") options.height = Number(next);
    else if (arg === "--frames") options.frames = Number(next);
    if (arg.startsWith("--")) i += 1;
  }
  if (!options.url || !options.output) {
    throw new Error("Usage: capture_visual_background.mjs <url> --output <dir> [--width 1080 --height 1920 --frames 2700]");
  }
  return options;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const options = parseArgs();
  await fs.rm(options.output, { recursive: true, force: true });
  await fs.mkdir(options.output, { recursive: true });

  const browser = await openBrowser("chrome", {
    chromeMode: "headless-shell",
    logLevel: "error",
    chromiumOptions: { gl: "angle" },
  });
  const context = browser.browserContexts()[0];
  const page = await browser.newPage({
    context,
    logLevel: "error",
    indent: false,
    pageIndex: 0,
    onBrowserLog: null,
    onLog: () => {},
  });

  try {
    await page.setViewport({
      width: options.width,
      height: options.height,
      deviceScaleFactor: 1,
    });
    await page.goto({ url: options.url, timeout: 30000, options: { waitUntil: "load" } });
    await sleep(1200);
    await page.evaluate(() => {
      if (typeof noLoop !== "function" || typeof redraw !== "function") {
        throw new Error("The visual does not expose p5 noLoop()/redraw() controls");
      }
      const canvas = document.querySelector("canvas");
      if (!canvas) throw new Error("The visual canvas was not found");
      canvas.style.transform = "none";
      canvas.style.transformOrigin = "center center";
      noLoop();
      window.__bishoptechDeterministicCapture = true;
    });

    for (let frame = 0; frame < options.frames; frame += 1) {
      await page.evaluate(() => redraw());
      const { value: screenshot } = await page._client().send("Page.captureScreenshot", {
        format: "jpeg",
        quality: 92,
        fromSurface: true,
      });
      const filename = path.join(options.output, `frame-${String(frame).padStart(6, "0")}.jpg`);
      await fs.writeFile(filename, Buffer.from(screenshot.data, "base64"));
      if (frame === 0 || (frame + 1) % 60 === 0 || frame === options.frames - 1) {
        process.stdout.write(`Captured ${frame + 1}/${options.frames}\n`);
      }
    }
  } finally {
    await page.close().catch(() => {});
    await browser.close({ silent: true }).catch(() => {});
  }
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
