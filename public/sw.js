const CACHE_NAME = 'yut-game-v1';

// 설치 시 캐시할 파일 정의 (선택 사항)
self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
});

// 활성화 시 이전 캐시 정리
self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
});

// 네트워크 요청 시 처리 (현재는 네트워크 우선)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
