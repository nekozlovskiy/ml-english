const VERSION = "564d74cf18b4643c";
const SHELL_FILES = ["/ml-english/","/ml-english/_expo/static/css/global-d235028da909a901142a3968863e4fa3.css","/ml-english/_expo/static/js/web/__expo-metro-runtime-1f8f5d3ca6b7f58204d51e14506d73fb.js","/ml-english/_expo/static/js/web/_layout-23af4fb273e0226879b453ce7a8178d8.js","/ml-english/_expo/static/js/web/_layout-a3700a78c1a481895433b9b764f83eb7.js","/ml-english/_expo/static/js/web/index-f8316cc4c3d440cfc790519573d9099b.js","/ml-english/_expo/static/js/web/__common-1e0fe6e1e3eb1fd12447563241a20249.js","/ml-english/_expo/static/js/web/entry-68615fd4211c7b1c1cafb7016893f884.js","/ml-english/_expo/static/js/web/[lessonId]-12af8b9b14c0b6c4025a68d49b7b16af.js","/ml-english/_expo/static/js/web/[unitId]-b6a8346b07a2bcb12aca8c0f141c2f0c.js","/ml-english/_expo/static/js/web/about-530ac2e4753846cf21164617a14a40f0.js","/ml-english/_expo/static/js/web/collocation-practice-bf3f90c3288e195cf407e93ba3361045.js","/ml-english/_expo/static/js/web/collocations-c30240362c4048edf2114e83f80feae3.js","/ml-english/_expo/static/js/web/complete-41354eb7bfba94175b0c9a032299dad2.js","/ml-english/_expo/static/js/web/dictionary-0e467d68f3a1446d257203ce7fa34553.js","/ml-english/_expo/static/js/web/flashcards-21ec6300de0997d0e6266b50011df765.js","/ml-english/_expo/static/js/web/hearts-508fa6ba50d6ad344f615a5ba7846a82.js","/ml-english/_expo/static/js/web/phrasebook-e39324696d26d7967333c54f629d613c.js","/ml-english/_expo/static/js/web/profile-5c8c5cc6b07cd246715d2e80001ead74.js","/ml-english/_expo/static/js/web/progress-f899bb88bd934bab293980d9d93cbf98.js","/ml-english/_expo/static/js/web/review-d3a2f57670e5b9a7d2aedd9f5548e601.js","/ml-english/_expo/static/js/web/settings-d236d3b09a07eedc76b527c409c0e5b3.js","/ml-english/_expo/static/js/web/shop-5f1f21c2d577f8240d17af6c5d7fbb31.js","/ml-english/_expo/static/js/web/streak-4ce11356acb0361e5fd5c8e06ab25bdf.js","/ml-english/_expo/static/js/web/today-3783cf704ec0377c5945c8f4fe60321e.js","/ml-english/manifest.webmanifest","/ml-english/icons/grady-180.png"];
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
