// pwa-install.js
let deferredPrompt;
const pwaInstallBtn = document.getElementById('pwa-install-btn');
const pwaInstallPrompt = document.getElementById('pwa-install-prompt');

// Debugging function
function logPWAState() {
  console.log('PWA State:', {
    isRunningAsPWA: isRunningAsPWA(),
    hasDeferredPrompt: !!deferredPrompt,
    isInstallable: isInstallable()
  });
}

// Check if PWA meets install criteria
function isInstallable() {
  return !isRunningAsPWA() && 
         'BeforeInstallPromptEvent' in window && 
         navigator.serviceWorker.controller;
}

// Check if running as installed PWA
function isRunningAsPWA() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone ||
         document.referrer.includes('android-app://');
}

// Initialize PWA functionality
function initializePWA() {
  console.log('Initializing PWA functionality...');
  logPWAState();
  
  if (!('serviceWorker' in navigator)) {
    console.error('Service Worker API not supported');
    return;
  }
  
  setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
  // Before install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event triggered');
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
    
    // Auto-show prompt after 30 seconds if not installed
    setTimeout(() => {
      if (deferredPrompt && !isRunningAsPWA()) {
        showInstallPrompt();
      }
    }, 30000);
  });

  // App installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA was successfully installed');
    deferredPrompt = null;
    hideInstallUI();
    logPWAState();
  });

  // Install button click
  if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', installPWA);
  }

  // Install prompt buttons
  if (pwaInstallPrompt) {
    document.getElementById('pwa-install-prompt-btn')?.addEventListener('click', installPWA);
    document.getElementById('pwa-install-prompt-close')?.addEventListener('click', hideInstallPrompt);
  }
}

// Show install button
function showInstallButton() {
  console.log('Showing install button');
  if (pwaInstallBtn && isInstallable()) {
    pwaInstallBtn.classList.remove('hidden');
  }
}

// Hide install button
function hideInstallButton() {
  if (pwaInstallBtn) {
    pwaInstallBtn.classList.add('hidden');
  }
}

// Show install prompt
function showInstallPrompt() {
  console.log('Showing install prompt');
  if (pwaInstallPrompt && isInstallable()) {
    pwaInstallPrompt.classList.remove('hidden');
    
    // Auto-hide after 15 seconds if not interacted with
    setTimeout(() => {
      if (!pwaInstallPrompt.classList.contains('hidden')) {
        hideInstallPrompt();
      }
    }, 15000);
  }
}

// Hide install prompt
function hideInstallPrompt() {
  if (pwaInstallPrompt) {
    pwaInstallPrompt.classList.add('hidden');
  }
}

// Hide all install UI
function hideInstallUI() {
  hideInstallButton();
  hideInstallPrompt();
}

// Install PWA
async function installPWA() {
  console.log('Attempting to install PWA...');
  
  if (!deferredPrompt) {
    console.error('No deferred prompt available');
    return;
  }
  
  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User ${outcome} the install prompt`);
    
    if (outcome === 'accepted') {
      hideInstallUI();
    }
  } catch (err) {
    console.error('Error during installation:', err);
  } finally {
    deferredPrompt = null;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePWA);

// Periodically check PWA state (for debugging)
setInterval(logPWAState, 10000);
