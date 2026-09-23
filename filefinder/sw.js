const CACHE='file-finder-v6';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.origin===location.origin && (url.pathname.endsWith('/filefinder/') || url.pathname.endsWith('/filefinder/index.html'))){
    e.respondWith(fetch(e.request).then(resp=>{
      const copy=resp.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return resp;
    }).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(resp=>{
    const copy=resp.clone();
    if(url.origin===location.origin) caches.open(CACHE).then(c=>c.put(e.request,copy));
    return resp;
  })));
});