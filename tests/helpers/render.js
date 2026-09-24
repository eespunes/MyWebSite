// Build v1.100 · 2026-09-24
/* Serves the project over HTTP and renders a page in headless Chrome, so the
   tests see exactly what a browser builds from CONTENT.md. */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { ROOT } = require("./content.js");

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
};

function chromeAvailable() {
  return fs.existsSync(CHROME);
}

function startServer() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "");
    const file = path.join(ROOT, rel || "index.html");
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

async function connect(port) {
  for (let i = 0; i < 80; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error("Chrome did not expose a debugging target");
}

/* Renders `page` and returns the value of `expression` evaluated in it. */
async function evaluateOn(page, expression) {
  const { server, port } = await startServer();
  const devtoolsPort = 9500 + Math.floor(Math.random() * 400);
  const profile = fs.mkdtempSync(path.join(require("node:os").tmpdir(), "cv-test-"));
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      `--remote-debugging-port=${devtoolsPort}`,
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  const errors = [];
  let socket;
  try {
    const wsUrl = await connect(devtoolsPort);
    socket = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = reject;
    });

    let id = 0;
    const pending = new Map();
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.method === "Runtime.exceptionThrown") {
        errors.push(message.params.exceptionDetails.exception?.description ||
          message.params.exceptionDetails.text);
      }
      if (message.id && pending.has(message.id)) {
        pending.get(message.id)(message);
        pending.delete(message.id);
      }
    };
    const send = (method, params = {}) =>
      new Promise((resolve) => {
        const messageId = ++id;
        pending.set(messageId, resolve);
        socket.send(JSON.stringify({ id: messageId, method, params }));
      });

    await send("Runtime.enable");
    await send("Page.enable");
    await send("Page.navigate", { url: `http://127.0.0.1:${port}/${page}` });

    /* Wait for the renderer to finish rather than guessing a delay. */
    const deadline = Date.now() + 15000;
    for (;;) {
      const ready = await send("Runtime.evaluate", {
        expression: `!!document.querySelector('${page.startsWith("cv") ? ".cv-page" : "section[data-snap]"}')`,
        returnByValue: true,
      });
      if (ready.result?.result?.value) break;
      if (Date.now() > deadline) throw new Error(`${page} never rendered`);
      await new Promise((r) => setTimeout(r, 150));
    }

    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.result?.exceptionDetails) {
      throw new Error(
        "expression threw: " +
          (result.result.exceptionDetails.exception?.description ||
            result.result.exceptionDetails.text)
      );
    }
    return { value: result.result?.result?.value, errors };
  } finally {
    try { socket?.close(); } catch {}
    chrome.kill();
    server.close();
    /* Chrome may still be flushing its profile; cleaning it is best-effort. */
    await new Promise((resolve) => {
      const done = setTimeout(resolve, 1500);
      chrome.once("exit", () => {
        clearTimeout(done);
        resolve();
      });
    });
    try {
      fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    } catch {}
  }
}

module.exports = { evaluateOn, chromeAvailable, CHROME };
