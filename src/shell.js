import { spawn } from "node:child_process";

export function runShell(command, options = {}) {
  const started = Date.now();
  return new Promise((resolve) => {
    const child = spawn(command, {
      cwd: options.cwd || process.cwd(),
      env: { ...process.env, ...(options.env || {}) },
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
      timeout: options.timeoutMs || 120000
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (code, signal) => {
      resolve({
        command,
        code,
        signal,
        stdout,
        stderr,
        durationMs: Date.now() - started
      });
    });
  });
}
