import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readmePath = resolve(root, "README.md");
const indexUrl = pathToFileURL(resolve(root, "index.html")).href;
const outputWidth = 400;
const outputHeight = 350;

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}

function parseReadmeSamples(markdown) {
  const samples = [];
  const samplePattern =
    /\[!\[([^\]]*)\]\((readme-samples\/[^)\s]+\.png)(?:\s+"[^"]*")?\)\]\((\S+?)(?:\s+"[^"]*")?\)/g;

  for (const match of markdown.matchAll(samplePattern)) {
    samples.push({
      title: match[1],
      screenshot: match[2],
      url: localAppUrl(match[3]),
    });
  }

  if (samples.length === 0) {
    throw new Error("No readme sample image links found.");
  }

  const seen = new Set();
  for (const sample of samples) {
    if (seen.has(sample.screenshot)) {
      throw new Error(`Duplicate readme sample output path: ${sample.screenshot}`);
    }
    seen.add(sample.screenshot);
  }

  return samples;
}

function localAppUrl(href) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    const url = new URL(href);
    return `${indexUrl}${url.search}${url.hash}`;
  }

  if (href.startsWith("?")) {
    return `${indexUrl}${href}`;
  }

  if (/^[A-Za-z0-9_-]+$/.test(href)) {
    return `${indexUrl}?s=${href}`;
  }

  throw new Error(`Unsupported readme sample URL: ${href}`);
}

async function canvasPngBase64(page) {
  return page.evaluate(
    ({ outputWidth, outputHeight }) => {
      const canvas = document.querySelector("#room");
      if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("Missing room canvas.");
      }

      const output = document.createElement("canvas");
      output.width = outputWidth;
      output.height = outputHeight;
      const ctx = output.getContext("2d");
      if (!ctx) {
        throw new Error("Missing output canvas context.");
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(canvas, 0, 0, output.width, output.height);
      return output.toDataURL("image/png").split(",")[1];
    },
    { outputWidth, outputHeight },
  );
}

const markdown = await readFile(readmePath, "utf8");
const samples = parseReadmeSamples(markdown);

run("npm", ["run", "build"]);

const browser = await chromium.launch();

try {
  for (const sample of samples) {
    const output = resolve(root, sample.screenshot);
    console.log(`Rendering ${sample.title} -> ${sample.screenshot}`);
    await mkdir(dirname(output), { recursive: true });

    const page = await browser.newPage({
      deviceScaleFactor: 1,
      viewport: { width: 1180, height: 900 },
    });
    page.on("pageerror", (error) => {
      throw error;
    });

    await page.goto(sample.url);
    await page.waitForSelector('#room[data-render-ready="true"]');
    const pngBase64 = await canvasPngBase64(page);
    await writeFile(output, Buffer.from(pngBase64, "base64"));
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(`Rendered ${samples.length} readme sample${samples.length === 1 ? "" : "s"}.`);
