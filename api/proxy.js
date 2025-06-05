// /api/proxy.js ── handles PDFs & normal pages
export default async function handler(req, res) {
  const target = req.query.u;
  if (!target) return res.status(400).send("Missing ?u=");

  // Always pretend we’re Mobile-Safari
  const MOBILE_UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) " +
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 " +
    "Mobile/15E148 Safari/604.1";

  try {
    /* ── Fetch the upstream resource ─────────────────────────────── */
    const upstream = await fetch(target, { headers: { "user-agent": MOBILE_UA } });
    const ctype    = upstream.headers.get("content-type") || "";

    /* ── 1. PDF handling ─────────────────────────────────────────── */
    const looksLikePDF =
      /\.pdf(\b|$)/i.test(new URL(target).pathname) ||
      ctype.includes("application/pdf");

    if (looksLikePDF) {
      const viewerHTML = `
<!DOCTYPE html><html><head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>PDF · Stumble Higher</title>
  <style>html,body,iframe{margin:0;height:100%;width:100%;background:#fff;}</style>
</head>
<body>
  <iframe src="https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(
    target
  )}" frameborder="0"></iframe>
</body></html>`;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(viewerHTML);
    }

    /* ── 2. Normal HTML / text path ──────────────────────────────── */
    let html = await upstream.text();

    // Add <base> so relative assets work
    const base = `<base href="${new URL(target).origin}/">`;
    html = html.replace(/<head[^>]*>/i, (h) => `${h}\n${base}`);

    // Force light colour-scheme
    const lightCSS =
      `<style>html{color-scheme:light only;}` +
      `@media(prefers-color-scheme:dark){html{color-scheme:light;}}</style>`;
    html = html.replace(/<head[^>]*>/i, (h) => `${h}\n${lightCSS}`);

    res.setHeader("Content-Type", ctype || "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (err) {
    console.error("[proxy error]", err);
    res.status(500).send("Proxy error");
  }
}
