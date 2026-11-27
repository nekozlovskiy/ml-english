const VERSION = "9d6a989aaeb7485b";
const SHELL_FILES = ["/ml-english/","/ml-english/_expo/static/css/global-d235028da909a901142a3968863e4fa3.css","/ml-english/_expo/static/js/web/__expo-metro-runtime-1f8f5d3ca6b7f58204d51e14506d73fb.js","/ml-english/_expo/static/js/web/_layout-4fa510cc07089da2a147146ff6a57ced.js","/ml-english/_expo/static/js/web/_layout-b769fe9388c97136308f235b35496643.js","/ml-english/_expo/static/js/web/index-a257a105816b29a8c20fc9c6c767e159.js","/ml-english/_expo/static/js/web/__common-18582545bd901664ff79abefcc4b03db.js","/ml-english/_expo/static/js/web/entry-741f6b90ea23397c3ac0bdde1a0ed25a.js","/ml-english/_expo/static/js/web/[lessonId]-c94193161217bc69891f771bdd3cf5b6.js","/ml-english/_expo/static/js/web/[unitId]-7740dbca434870ea7db9eccf3eaf7ea9.js","/ml-english/_expo/static/js/web/about-576544c58e7ee8088deb1bd8fab045f1.js","/ml-english/_expo/static/js/web/analyst-shift-291d76bbaa4ee1b95d8ead6280add2c4.js","/ml-english/_expo/static/js/web/collocation-practice-381d82bb638ec862c9d042a831d313c7.js","/ml-english/_expo/static/js/web/collocations-5d4721f2aab532edf61b2ea9cd28fdbf.js","/ml-english/_expo/static/js/web/complete-29a8f6fa10ae66ba6e3d958c0b405094.js","/ml-english/_expo/static/js/web/dictionary-bf2f5b1b4139ed7a4c35f552c0452d93.js","/ml-english/_expo/static/js/web/flashcards-eb1b198b3a283e9be1bb9163a501679e.js","/ml-english/_expo/static/js/web/hearts-2cd37f404a4dedeffc51ce330d7f47b9.js","/ml-english/_expo/static/js/web/phrasebook-2b6ea1e314406a53f9c51bdcbc7f718c.js","/ml-english/_expo/static/js/web/profile-963688c9449586a951dd3bdbb36ab185.js","/ml-english/_expo/static/js/web/progress-4dbb1e97699fe0ebf8f5f7dd45a91dc6.js","/ml-english/_expo/static/js/web/review-862988984e6161f8e0466745ebdcff74.js","/ml-english/_expo/static/js/web/settings-362d39a9987679760671204b65063945.js","/ml-english/_expo/static/js/web/shop-f39a01aa70b1b5515b26a3a13021cd6d.js","/ml-english/_expo/static/js/web/streak-639ebbecc20254e6618e2a34d67cb0c5.js","/ml-english/_expo/static/js/web/today-9b0b37f6f061940d1b44d96d7eb729a3.js","/ml-english/manifest.webmanifest","/ml-english/icons/grady-180.png"];
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
