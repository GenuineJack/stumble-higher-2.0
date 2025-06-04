export default async function handler(req,res){
  const url=req.query.u, ua=req.query.ua||req.headers['user-agent']||'Mozilla/5.0';
  if(!url) return res.status(400).send('Missing url');
  try{const r=await fetch(url,{headers:{'user-agent':ua}});res.setHeader('Content-Type','text/html');res.send(await r.text());}
  catch{res.status(500).send('Proxy error');}
}
