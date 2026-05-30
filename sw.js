// Warhammer 40K《為了帝皇》Service Worker
// network-first：上線時永遠拿最新版，離線時用快取備援。
// 更新時只清除舊「快取」，絕不觸碰 localStorage（玩家分數紀錄安全）。
const C = 'wh40k-v3';

self.addEventListener('install', e => { self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== C).map(k => caches.delete(k))); // 只刪舊快取
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      try { if (res && res.status === 200) { const copy = res.clone(); caches.open(C).then(c => c.put(e.request, copy)); } } catch (_) {}
      return res;
    }).catch(() => caches.match(e.request).then(h => h || caches.match('./index.html')))
  );
});
