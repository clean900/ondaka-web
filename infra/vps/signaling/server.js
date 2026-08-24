const http = require('http');
const { WebSocketServer } = require('ws');
const crypto = require('crypto');

const SECRET = process.env.SIGNALING_SECRET || '';
const PORT = process.env.PORT || 8080;

function b64urlDecode(s){ s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s+='='; return Buffer.from(s,'base64'); }
function verifyToken(token){
  try{
    const [h,p,sig] = String(token).split('.');
    if(!h||!p||!sig) return null;
    const expected = crypto.createHmac('sha256', SECRET).update(h+'.'+p).digest();
    const got = b64urlDecode(sig);
    if(expected.length!==got.length || !crypto.timingSafeEqual(expected,got)) return null;
    const payload = JSON.parse(b64urlDecode(p).toString());
    if(payload.exp && Date.now()/1000 > payload.exp) return null;
    return payload; // { room, uid, exp }
  }catch(e){ return null; }
}

const rooms = new Map(); // room -> Set<ws>

const server = http.createServer((req,res)=>{
  if(req.url==='/health'){ res.writeHead(200); res.end('ok'); return; }
  res.writeHead(426); res.end('upgrade required');
});
const wss = new WebSocketServer({ server });

wss.on('connection',(ws,req)=>{
  let claims=null;
  try{
    const u=new URL(req.url,'http://x');
    claims=verifyToken(u.searchParams.get('token'));
  }catch(e){}
  if(!claims||!claims.room){ ws.close(4001,'unauthorized'); return; }
  const room=String(claims.room);
  if(!rooms.has(room)) rooms.set(room,new Set());
  const set=rooms.get(room);
  set.add(ws);
  for(const p of set) if(p!==ws&&p.readyState===1) p.send(JSON.stringify({type:'peer-joined',uid:claims.uid}));
  ws.on('message',(data)=>{
    const msg=data.toString();
    for(const p of set) if(p!==ws&&p.readyState===1) p.send(msg);
  });
  ws.on('close',()=>{
    set.delete(ws);
    for(const p of set) if(p.readyState===1) p.send(JSON.stringify({type:'peer-left',uid:claims.uid}));
    if(set.size===0) rooms.delete(room);
  });
});
server.listen(PORT,()=>console.log('signaling on '+PORT));
