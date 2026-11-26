const VERSION = "71aa67879df10fc6";
const SHELL_FILES = ["/ml-english/","/ml-english/_expo/static/css/global-d235028da909a901142a3968863e4fa3.css","/ml-english/_expo/static/js/web/__expo-metro-runtime-1f8f5d3ca6b7f58204d51e14506d73fb.js","/ml-english/_expo/static/js/web/_layout-b14b438a1df329ce11fffb66de66b27c.js","/ml-english/_expo/static/js/web/_layout-a3700a78c1a481895433b9b764f83eb7.js","/ml-english/_expo/static/js/web/index-d85466d4e3d2d7c093862a168cbeab29.js","/ml-english/_expo/static/js/web/__common-0288063c3698335964eb6b86592bcae2.js","/ml-english/_expo/static/js/web/entry-18a80f115c4c1101c955def7a8a39cd0.js","/ml-english/_expo/static/js/web/[lessonId]-1d2e775924e14385ad2e96d366f6b1c2.js","/ml-english/_expo/static/js/web/[unitId]-0a8e6e0dd0023e3f9a9f04aeecb082c0.js","/ml-english/_expo/static/js/web/about-8af39f81dde5abd0de73bb084dc55b85.js","/ml-english/_expo/static/js/web/collocation-practice-30152ac81c75846f5caf85373424011a.js","/ml-english/_expo/static/js/web/collocations-c30240362c4048edf2114e83f80feae3.js","/ml-english/_expo/static/js/web/complete-8c468214e3f03568eb6b8b97831b33ea.js","/ml-english/_expo/static/js/web/dictionary-0e467d68f3a1446d257203ce7fa34553.js","/ml-english/_expo/static/js/web/flashcards-4c44c833441f0b45014cd810038270f7.js","/ml-english/_expo/static/js/web/hearts-fb5d5a3ec29ca4b706172a1d57e70794.js","/ml-english/_expo/static/js/web/phrasebook-e39324696d26d7967333c54f629d613c.js","/ml-english/_expo/static/js/web/profile-2dc87c2a93b13c9e2a78ba30d24a70fb.js","/ml-english/_expo/static/js/web/progress-ae8a63b4abcdcfc56d5d3718b0a14620.js","/ml-english/_expo/static/js/web/review-4fcfdc0ec59ce776f20d944c1737a22c.js","/ml-english/_expo/static/js/web/settings-8557fb5285fd1286d827a919c658aeab.js","/ml-english/_expo/static/js/web/shop-cc7988934529547936a95c7f13406f18.js","/ml-english/_expo/static/js/web/streak-ff78f2529ff1948a581332abd893136d.js","/ml-english/_expo/static/js/web/today-407829f5eaa62a7b7483cb73d86bcd0c.js","/ml-english/manifest.webmanifest","/ml-english/icons/grady-180.png"];
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
