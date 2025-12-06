// Vérifier le statut du backend
async function checkBackendStatus() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/detect-hallucination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'test' })
      });
      
      statusDot.classList.remove('offline');
      statusText.textContent = '✅ Backend connecté';
    } catch (error) {
      statusDot.classList.add('offline');
      statusText.textContent = '⚠️ Backend déconnecté';
    }
  }
  
  // Toggle extension
  const toggle = document.getElementById('extensionToggle');
  toggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    
    // Envoyer le message à tous les onglets (avec gestion d'erreur)
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        // Ignorer les onglets système (chrome://, edge://, etc.)
        if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://') && !tab.url.startsWith('chrome-extension://')) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'toggleExtension',
            enabled: isEnabled
          }).catch(() => {
            // Ignorer silencieusement les erreurs
          });
        }
      });
    });
    
    // Sauvegarder l'état
    chrome.storage.local.set({ extensionEnabled: isEnabled });
  });
  
  // Charger l'état sauvegardé
  chrome.storage.local.get(['extensionEnabled'], (result) => {
    if (result.extensionEnabled !== undefined) {
      toggle.checked = result.extensionEnabled;
    }
  });
  
  // Vérifier le backend au chargement
  checkBackendStatus();
  setInterval(checkBackendStatus, 5000);