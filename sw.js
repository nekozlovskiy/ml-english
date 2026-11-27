const VERSION = "49ccd183f31f957c";
const SHELL_FILES = ["/ml-english/","/ml-english/_expo/static/css/global-d235028da909a901142a3968863e4fa3.css","/ml-english/_expo/static/js/web/__expo-metro-runtime-1f8f5d3ca6b7f58204d51e14506d73fb.js","/ml-english/_expo/static/js/web/_layout-4fa510cc07089da2a147146ff6a57ced.js","/ml-english/_expo/static/js/web/_layout-b769fe9388c97136308f235b35496643.js","/ml-english/_expo/static/js/web/index-a257a105816b29a8c20fc9c6c767e159.js","/ml-english/_expo/static/js/web/__common-214813ab631413a4a7f8b59ef7b828d3.js","/ml-english/_expo/static/js/web/entry-c34413a554fb5dae14b2a3231533eae6.js","/ml-english/_expo/static/js/web/[lessonId]-409cf0b1465c5bbd56dcad4a81433506.js","/ml-english/_expo/static/js/web/[unitId]-3870dfaabdc75c9b29c84742423be4be.js","/ml-english/_expo/static/js/web/about-576544c58e7ee8088deb1bd8fab045f1.js","/ml-english/_expo/static/js/web/analyst-shift-90324138240811645b2ec50978ae0e67.js","/ml-english/_expo/static/js/web/collocation-practice-bf404192381a22bbde2c9f41f7e63095.js","/ml-english/_expo/static/js/web/collocations-5d4721f2aab532edf61b2ea9cd28fdbf.js","/ml-english/_expo/static/js/web/complete-32bcfb53f76c1a450b611d5a6dfcce0b.js","/ml-english/_expo/static/js/web/dictionary-bf2f5b1b4139ed7a4c35f552c0452d93.js","/ml-english/_expo/static/js/web/flashcards-7f0871d0132d7ba9dc30a42ca7597df2.js","/ml-english/_expo/static/js/web/hearts-2a470545a1dd85f30aca6bb0c2f9d564.js","/ml-english/_expo/static/js/web/phrasebook-2b6ea1e314406a53f9c51bdcbc7f718c.js","/ml-english/_expo/static/js/web/profile-963688c9449586a951dd3bdbb36ab185.js","/ml-english/_expo/static/js/web/progress-4dbb1e97699fe0ebf8f5f7dd45a91dc6.js","/ml-english/_expo/static/js/web/review-71e7aee8a04912bffe7ec0e20c692f80.js","/ml-english/_expo/static/js/web/settings-bceae41bf894118b274b390f05102f3b.js","/ml-english/_expo/static/js/web/shop-f39a01aa70b1b5515b26a3a13021cd6d.js","/ml-english/_expo/static/js/web/streak-639ebbecc20254e6618e2a34d67cb0c5.js","/ml-english/_expo/static/js/web/today-9b0b37f6f061940d1b44d96d7eb729a3.js","/ml-english/manifest.webmanifest","/ml-english/icons/grady-180.png"];
/* VERSION and SHELL_FILES are supplied by the Pages build. */
const scope = new URL(self.registration.scope);
const cachePrefix = `grady:${scope.pathname}:`;
const cacheName = cachePrefix + VERSION;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(SHELL_FILES)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(cachePrefix) && key !== cacheName).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;

  const navigation = request.mode === 'navigate';
  if (!navigation && !/\/(?:_expo\/static|assets|icons)\//.test(url.pathname)) return;

  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached && !navigation) return cached;

    try {
      const response = await fetch(request);
      // The offline shell must stay paired with the chunks installed by this worker.
      if (!navigation && response.ok && response.type === 'basic') {
        await cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (error) {
      const offline = cached ?? (navigation ? await cache.match(scope.href) : undefined);
      if (offline) return offline;
      throw error;
    }
  })());
});
