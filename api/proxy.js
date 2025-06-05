// /api/proxy.js  – improved proxy with base tag + charset + light-mode override
export default async function handler(req, res) {
  const target = req.query.u;
  if (!target) return res.status(400).send("Missing url ?u=");

  // iPhone UA so we always get mobile layout
  const UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) " +
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 " +
    "Mobile/15E148 Safari/604.1";

  try {
    const upstream = await fetch(target, { headers: { "user-agent": UA } });
    let html = await upstream.text();

    /* 1 — insert <base> so relative links work */
    const baseTag = `<base href="${new URL(target).origin}/">`;
    html = html.replace(/<head[^>]*>/i, match => `${match}\n${baseTag}`);

    /* 2 — force light colour-scheme */
    const lightCSS =
      `<style>html{color-scheme:light only;}` +
      `@media(prefers-color-scheme:dark){html{color-scheme:light;}}</style>`;
    html = html.replace(/<head[^>]*>/i, match => `${match}\n${lightCSS}`);

    /* 3 — forward correct content-type (preserves charset) */
    const ctype = upstream.headers.get("content-type") || "text/html; charset=utf-8";
    res.setHeader("Content-Type", ctype);

    res.status(200).send(html);
  } catch (err) {
    console.error("[proxy error]", err);
    res.status(500).send("Proxy error");
  }
}
