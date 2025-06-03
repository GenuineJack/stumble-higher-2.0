export default async function handler(req, res){
  const url=req.query.u;
  if(!url) return res.status(400).send('Missing url');
  try{
    const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0'}});
    const html=await r.text();
    res.setHeader('Content-Type','text/html');
    res.send(html);
  }catch(e){
    res.status(500).send('Proxy error');
  }
}
