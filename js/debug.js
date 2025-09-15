function showUpdatePrompt(registration) {
    const statusEl = document.getElementById('update-status');
    if (!statusEl) return;
    statusEl.innerHTML = `Update available! <button id="update-button">Refresh</button>`;
    
    const updateButton = document.getElementById('update-button');
    if (updateButton) {
        updateButton.addEventListener('click', () => {
            if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
        });
    }
}

function getVersionFromWorker(worker) {
    return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => resolve(event.data);
        worker.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);
    });
}

function initServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    const versionEl = document.getElementById('app-version');
    const statusEl = document.getElementById('update-status');

    navigator.serviceWorker.ready.then(reg => {
        if (versionEl && reg.active) {
             getVersionFromWorker(reg.active).then(version => {
                versionEl.textContent = version;
             });
        }
    });

    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
        .then(reg => {
            if (!reg) return;

            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdatePrompt(reg);
                    }
                });
            });

            if (reg.waiting) {
                showUpdatePrompt(reg);
            } else {
                if (statusEl) statusEl.textContent = 'App is up to date';
            }

            reg.update();

            setInterval(() => {
                reg.update();
            }, 1000 * 60 * 30);

            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    reg.update();
                }
            });
        })
        .catch(error => console.error('Service Worker registration failed:', error));

    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const versionEl = document.getElementById('app-version');
    if (versionEl) {
        initServiceWorker();
    }
});