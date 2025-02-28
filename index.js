import { serve } from "bun";
import { extract_kwik, extract_zaza } from "./handlers/pahe.js";
const port = process.env.PORT || 3000;
const server = serve({
  port: port,
  idleTimeout: 255,
  async fetch(req, server) {
    try {
      const url = new URL(req.url);
      const path = url.pathname;
      const s = url.searchParams.get("url");
      if (path === "/pahe") {
        const data = await extract_kwik(s);
        return new Response(data);
      } else if (path === "/zaza") {
        const data = await extract_zaza(url?.search?.replace("?url=", ""));
        return new Response(data);
      } else {
        return new Response("404 Not Found", { status: 404 });
      }
    } catch (error) {
      console.log(error);
      return new Response("Error", { status: 500 });
    }
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
