import { createServer } from "node:http";
import { chmod, readFile } from "node:fs/promises";
import { exec as execCallback } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execCallback);
const subtxt = './.npm/sub.txt';
const PORT = Deno.env.get("PORT") || 3000;

// Run start.sh
try {
  await Deno.chmod("start.sh", 0o777);
  console.log(`start.sh empowerment successful`);
  
  const process = Deno.run({
    cmd: ["bash", "start.sh"],
    stdout: "piped",
    stderr: "piped"
  });
  
  // Process stdout and stderr
  const decoder = new TextDecoder();
  
  // Handle stdout
  const stdout = process.stdout;
  (async () => {
    for await (const chunk of stdout.readable) {
      console.log(decoder.decode(chunk));
    }
  })();
  
  // Handle stderr
  const stderr = process.stderr;
  (async () => {
    for await (const chunk of stderr.readable) {
      console.error(decoder.decode(chunk));
    }
  })();
  
  // Wait for process to complete
  const status = await process.status();
  console.log(`child process exited with code ${status.code}`);
  console.clear();
  console.log(`App is running`);
} catch (err) {
  console.error(`start.sh empowerment failed: ${err}`);
}

// create HTTP server
const server = createServer(async (req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Hello world!');
  }
  // get-sub
  if (req.url === '/sub') {
    try {
      const data = await Deno.readTextFile(subtxt);
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(data);
    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error reading sub.txt' }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
