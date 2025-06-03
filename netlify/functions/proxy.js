const fetch = (...args)=>import('node-fetch').then(({default:fetch})=>fetch(...args));
exports.handler = async (event) => {
  const url = event.queryStringParameters.u;
  if(!url) return { statusCode:400, body:'Missing url'};
  try{
    const r = await fetch(url,{headers:{'user-agent':'Mozilla/5.0'}});
    const html = await r.text();
    return { statusCode:200, headers:{'Content-Type':'text/html'}, body:html };
  }catch(e){
    return { statusCode:500, body:'Proxy error'};
  }
};
