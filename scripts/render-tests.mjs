import { mkdir, readdir, readFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";

const root = resolve(new URL("..", import.meta.url).pathname);
const testsPath = resolve(root, "TESTS.md");
const screenshotsDir = resolve(root, "screenshots");

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

function parseTests(markdown) {
  const tests = [];
  const blockPattern =
    /^## (.+?)\n\nScreenshot: `([^`]+)`\n\nURL: `(file:\/\/\/[^`]+)`/gm;

  for (const match of markdown.matchAll(blockPattern)) {
    tests.push({
      name: match[1],
      screenshot: match[2],
      url: match[3],
    });
  }

  if (tests.length === 0) {
    throw new Error("No rendering tests found in TESTS.md");
  }

  const seen = new Set();
  for (const test of tests) {
    if (!test.screenshot.startsWith("screenshots/") || !test.screenshot.endsWith(".png")) {
      throw new Error(`Invalid screenshot path for "${test.name}": ${test.screenshot}`);
    }
    if (seen.has(test.screenshot)) {
      throw new Error(`Duplicate screenshot path: ${test.screenshot}`);
    }
    seen.add(test.screenshot);
  }

  return tests;
}

async function clearScreenshots() {
  await mkdir(screenshotsDir, { recursive: true });
  const entries = await readdir(screenshotsDir, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".png"))
      .map((entry) => unlink(resolve(screenshotsDir, entry.name))),
  );
}

const markdown = await readFile(testsPath, "utf8");
const tests = parseTests(markdown);

run("npm", ["run", "build"]);
await clearScreenshots();

const browser = await chromium.launch();

for (const test of tests) {
  const output = resolve(root, test.screenshot);
  console.log(`Rendering ${test.name}`);
  const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
  page.on("pageerror", (error) => {
    throw error;
  });
  await page.goto(test.url);
  await page.waitForSelector('#room[data-render-ready="true"]');
  await freezeCanvasForScreenshot(page);
  await page.screenshot({ path: output, fullPage: true });
  await page.close();
}

await browser.close();
console.log(`Rendered ${tests.length} screenshot${tests.length === 1 ? "" : "s"}.`);

async function freezeCanvasForScreenshot(page) {
  await page.evaluate(async () => {
    const canvas = document.querySelector("#room");
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("Missing room canvas.");
    }

    const image = document.createElement("img");
    image.id = canvas.id;
    image.className = canvas.className;
    image.alt = canvas.getAttribute("aria-label") ?? "";
    image.src = canvas.toDataURL("image/png");
    image.style.width = canvas.style.width;
    image.style.height = canvas.style.height;
    image.style.display = getComputedStyle(canvas).display;
    image.style.background = getComputedStyle(canvas).background;
    image.style.boxShadow = getComputedStyle(canvas).boxShadow;

    await image.decode();
    canvas.replaceWith(image);
  });
}
