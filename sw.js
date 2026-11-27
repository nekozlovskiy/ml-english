const VERSION = "be299c27f0d18145";
const SHELL_FILES = ["/ml-english/","/ml-english/_expo/static/css/global-d235028da909a901142a3968863e4fa3.css","/ml-english/_expo/static/js/web/__expo-metro-runtime-1f8f5d3ca6b7f58204d51e14506d73fb.js","/ml-english/_expo/static/js/web/_layout-6d5576deffc1e61cbddcda4c05f0bd52.js","/ml-english/_expo/static/js/web/_layout-693081d4e6798ce072bb1e9f350404b1.js","/ml-english/_expo/static/js/web/index-7c6da47f6256a2941bd9137a845e6c03.js","/ml-english/_expo/static/js/web/__common-d51e8d09998020c3d742f9b46f43b211.js","/ml-english/_expo/static/js/web/entry-b1a2bac39a1c4ad30bd033eeaa4ee9ed.js","/ml-english/_expo/static/js/web/[lessonId]-bfebf49317662388644d0453581453de.js","/ml-english/_expo/static/js/web/[unitId]-11fa02695f86a224fbe5edd1627f24cd.js","/ml-english/_expo/static/js/web/about-bf7f18cc850fa0ca5a5ebbfb612a4fce.js","/ml-english/_expo/static/js/web/analyst-shift-6d7d4400ef5d4ef244c3b89c5fe7c214.js","/ml-english/_expo/static/js/web/collocation-practice-b740392a199016866178f2d6c88ab371.js","/ml-english/_expo/static/js/web/collocations-3edd41b14e8e08ffec824673d4405548.js","/ml-english/_expo/static/js/web/complete-232791a55ba8e2ba724bce3c8148f68f.js","/ml-english/_expo/static/js/web/dictionary-142cec3b63a98cd960862e2969bbe7d9.js","/ml-english/_expo/static/js/web/flashcards-bf2d4e3a5f106418a2f0bdc7e24686ae.js","/ml-english/_expo/static/js/web/hearts-38ca5c64577e6342dbc0fea847a20a75.js","/ml-english/_expo/static/js/web/phrasebook-9aec221db12ddf2fe79abb84e434e5c9.js","/ml-english/_expo/static/js/web/profile-d00c73350d4de376e4386fe03ba44d5a.js","/ml-english/_expo/static/js/web/progress-5cbfe7c1bb855e558e0e8500ba6904e7.js","/ml-english/_expo/static/js/web/review-1463674fcab1af4a21a7456da2aebef5.js","/ml-english/_expo/static/js/web/settings-c75566b3dc26a12994495e2c0f4b7915.js","/ml-english/_expo/static/js/web/shop-b1ad765f90b0d84a5669f8e5c4f44192.js","/ml-english/_expo/static/js/web/sql-lab-6de5ab69c7204792463f6ea36f314261.js","/ml-english/_expo/static/js/web/streak-e332099262f16f77635e8c2725acbe28.js","/ml-english/_expo/static/js/web/today-c31586382538e982590f53bb8d86f19a.js","/ml-english/sql-lab-runtime/sql-wasm.js","/ml-english/sql-lab-runtime/sql-wasm.wasm","/ml-english/sql-lab-runtime/worker.js","/ml-english/manifest.webmanifest","/ml-english/icons/grady-180.png"];
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
  if (!navigation && !/\/(?:_expo\/static|assets|icons|sql-lab-runtime)\//.test(url.pathname)) return;

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
