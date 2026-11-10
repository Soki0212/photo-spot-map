const CACHE_NAME = 'photo-map-v1';

const FILES_TO_CACHE = [
  './',
  './index.html',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/suncalc@1.9.0/suncalc.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// インストール時に必要なファイルを保存
self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=>{
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>{
      return Promise.all(
        keys
          .filter(key=>key!==CACHE_NAME)
          .map(key=>caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 保存済みファイルを優先して表示
self.addEventListener('fetch',event=>{
  const request=event.request;

  if(request.method!=='GET') return;

  const url=new URL(request.url);

  // Supabaseへの通信は通常どおり行う
  if(url.hostname.includes('supabase.co')) return;

  event.respondWith(
    caches.match(request).then(cached=>{
      if(cached) return cached;

      return fetch(request).then(response=>{
        if(response.ok && url.origin===self.location.origin){
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>{
            cache.put(request,copy);
          });
        }
        return response;
      });
    })
  );
});
