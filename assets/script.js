// assets/script.js – Offline + Daily Refresh (Fixed for GitHub Pages)
// Developed by Arshdeep Singh - DairyCare Pro

// 1. Register Service Worker with Dynamic Path
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // ਚੈੱਕ ਕਰੋ ਕਿ ਸਾਈਟ GitHub 'ਤੇ ਚੱਲ ਰਹੀ ਹੈ ਜਾਂ ਲੋਕਲ ਕੰਪਿਊਟਰ 'ਤੇ
    const isGitHub = window.location.hostname.includes("github.io");
    const repoName = window.location.pathname.split('/')[1];
    // ਜੇਕਰ GitHub ਹੈ ਤਾਂ ਰੈਪੋਜ਼ਿਟਰੀ ਦਾ ਪਾਥ ਜੋੜੋ, ਨਹੀਂ ਤਾਂ ਸਿੱਧਾ ਰੂਟ ਚੁੱਕੋ
    const swPath = isGitHub ? `/${repoName}/sw.js` : "/sw.js";

    navigator.serviceWorker.register(swPath)
      .then(reg => console.log('SW registered successfully:', reg))
      .catch(err => console.error('SW registration failed:', err));
  });
}

// 2. Daily version check (once per day)
function checkForUpdates() {
  const lastCheck = localStorage.getItem('sw_update_check');
  const today = new Date().toISOString().slice(0, 10);

  if (lastCheck !== today) {
    localStorage.setItem('sw_update_check', today);

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update().then(() => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        });
      });
    }
  }
}

// Listen for skip waiting message
navigator.serviceWorker.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
  }
});

checkForUpdates();
window.addEventListener('online', () => checkForUpdates());

// Manual update check
async function checkForManualUpdate() {
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();

    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    } else if (registration.active) {
      alert('No update available. Your app is up to date.');
    } else {
      alert('Service worker is installing. Please reload page once.');
    }
  } catch (error) {
    console.error('Update check failed:', error);
    alert('Update check failed. Please refresh page and try again.');
  }
}

// Event delegation for dynamic button
document.addEventListener('click', async (event) => {
  if (event.target.id === 'checkUpdateBtn') {
    await checkForManualUpdate();
  }
});

// This MUST match the CACHE_NAME in sw.js
const APP_VERSION = 'dairycare-v4.5';  // Update manually when you change CACHE_NAME

// Version display with Safe Retry Limit (Prevents Infinite Loop)
let versionRetryCount = 0;
function setVersionNumber() {
  const versionSpan = document.getElementById('appVersion');
  if (versionSpan) {
    versionSpan.innerText = APP_VERSION.replace('dairycare-', 'v');
    console.log('Version set to:', versionSpan.innerText);
  } else {
    // ਜੇ ਹੈਡਰ ਅਜੇ ਲੋਡ ਨਹੀਂ ਹੋਇਆ, ਤਾਂ ਸਿਰਫ਼ 30 ਵਾਰ (6 ਸੈਕਿੰਡ) ਚੈੱਕ ਕਰੋ, ਉਸ ਤੋਂ ਬਾਅਦ ਲੂਪ ਬੰਦ ਕਰ ਦਿਓ
    if (versionRetryCount < 30) {
      versionRetryCount++;
      console.log('Waiting for header to load... Retry: ' + versionRetryCount);
      setTimeout(setVersionNumber, 200);
    } else {
      console.log('Header load timeout. Version display bypassed.');
    }
  }
}

// Start checking after DOM ready
document.addEventListener('DOMContentLoaded', function () {
  setVersionNumber();
});
