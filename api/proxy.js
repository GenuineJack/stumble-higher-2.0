// /api/proxy.js  ── Vercel Serverless Function
export default async function handler(req, res) {
  // URL of the page we want to fetch
  const url = req.query.u;
  if (!url) return res.status(400).send("Missing url ?u=");

  // Hard-coded mobile User-Agent (iPhone / Safari 17)
  const MOBILE_UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) " +
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 " +
    "Mobile/15E148 Safari/604.1";

  try {
    const upstream = await fetch(url, {
      headers: { "user-agent": MOBILE_UA }
    });

    // Grab the HTML as text
    const html = await upstream.text();

    // Serve it back so the iframe loads it
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (e) {
    console.error("[proxy error]", e);
    res.status(500).send("Proxy error");
  }
}
