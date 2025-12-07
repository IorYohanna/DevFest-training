// Vérifier si le script est déjà chargé
if (window.hallucinationDetectorLoaded) {
  console.log('Content script déjà chargé, on arrête');
} else {
  window.hallucinationDetectorLoaded = true;
  console.log('🔍 Hallucination Detector content script chargé');

  // État global
  let isActive = true;
  let currentModal = null;

  // Écouter les messages du background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Message reçu dans content:', request.action);

    try {
      if (request.action === "ping") {
        sendResponse({ success: true, ready: true });
      } else if (request.action === "showLoader") {
        showLoader();
        sendResponse({ success: true });
      } else if (request.action === "analyzeText") {
        analyzeSelectedText(request.text);
        sendResponse({ success: true });
      } else if (request.action === "toggleExtension") {
        isActive = request.enabled;
        updateExtensionState();
        sendResponse({ success: true });
      } else if (request.action === "showResult") {
        hideLoader();
        showResultModal(request.data, request.originalText);
        sendResponse({ success: true });
      } else if (request.action === "showError") {
        hideLoader();
        showErrorModal(request.error);
        sendResponse({ success: true });
      }
    } catch (error) {
      console.error('Erreur dans message listener:', error);
      sendResponse({ success: false, error: error.message });
    }

    return true;
  });

  // Fonction principale d'analyse
  async function analyzeSelectedText(text) {
    if (!text || text.trim().length === 0) {
      console.log('❌ Texte vide');
      return;
    }
    
    if (!isActive) {
      console.log('⚠️ Extension désactivée');
      return;
    }
    
    console.log('🔄 Analyse du texte:', text);
    showLoader();
    
    try {
      chrome.runtime.sendMessage({
        action: "checkHallucination",
        text: text
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Erreur runtime:', chrome.runtime.lastError);
          hideLoader();
          showErrorModal('Erreur de communication avec l\'extension');
          return;
        }

        hideLoader();
        
        if (response && response.success) {
          console.log('✅ Résultat reçu:', response.data);
          showResultModal(response.data, text);
        } else {
          console.error('❌ Erreur API:', response?.error);
          showErrorModal(response?.error || 'Erreur inconnue');
        }
      });
    } catch (error) {
      console.error('❌ Erreur catch:', error);
      hideLoader();
      showErrorModal(error.message);
    }
  }

  // Afficher le loader
  function showLoader() {
    const oldLoader = document.getElementById('hd-loader-wrapper');
    if (oldLoader) oldLoader.remove();

    const loader = document.createElement('div');
    loader.id = 'hd-loader-wrapper';
    loader.className = 'hd-wrapper';
    
    loader.innerHTML = `
      <div class="hd-backdrop"></div>
      <div class="hd-card hd-loader-card">
        <div class="hd-aurora-bg"></div>
        <div style="position: relative; z-index: 1;">
          <div class="hd-loader-visual">
            <div class="hd-orb"></div>
            <div class="hd-orb hd-delay"></div>
          </div>
          <p class="hd-title-sm">Analyse en cours...</p>
          <p class="hd-desc" style="margin-top: 8px;">Vérification factuelle via RAG</p>
        </div>
      </div>
    `;
    
    if (document.body) {
      document.body.appendChild(loader);
      console.log('⏳ Loader affiché');
    } else {
      console.error('❌ document.body n\'existe pas encore');
    }
  }

  function hideLoader() {
    const loader = document.getElementById('hd-loader-wrapper');
    if (loader) {
      loader.classList.add('hd-exit');
      setTimeout(() => loader.remove(), 200);
      console.log('✅ Loader masqué');
    }
  }

  // Afficher le modal de résultat
  function showResultModal(data, originalText) {
    console.log('📊 Affichage du résultat modal');
    console.log('📦 Data reçue:', data);
    
    if (currentModal) {
      currentModal.remove();
    }
    
    if (!document.body) {
      console.error('❌ document.body n\'existe pas !');
      return;
    }
    
    const isCorrect = data.is_correct === true;
    const confidence = data.confidence ? (data.confidence * 100).toFixed(0) : 0;
    
    console.log(`🎯 Correct: ${isCorrect}, Confiance: ${confidence}%`);
    
    const modal = document.createElement('div');
    modal.id = 'hd-result-wrapper';
    modal.className = `hd-wrapper ${isCorrect ? 'hd-theme-success' : 'hd-theme-warning'}`;
    
    modal.innerHTML = `
      <div class="hd-backdrop"></div>
      <div class="hd-card">
        <button class="hd-close-btn" id="hd-close-modal">×</button>
        
        <div class="hd-header">
          <div class="hd-badge">
            <span>${isCorrect ? '✓' : '⚠️'}</span>
            <span>${isCorrect ? 'CONTENU VÉRIFIÉ' : 'HALLUCINATION DÉTECTÉE'}</span>
          </div>
          <h2 class="hd-title">Analyse Complétée</h2>
          <p class="hd-subtitle">Confiance : ${confidence}%</p>
        </div>
        
        <div class="hd-section">
          <span class="hd-label">📝 Texte Original</span>
          <div class="hd-glass-box" style="background: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.1);">
            <p style="text-decoration: line-through; opacity: 0.6;">${escapeHtml(originalText)}</p>
          </div>
        </div>
        
        <div class="hd-section">
          <span class="hd-label">✅ Version Corrigée</span>
          <div class="hd-glass-box" style="background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.1);">
            <p>${escapeHtml(data.corrected_version || 'Aucune correction disponible')}</p>
          </div>
          <button class="hd-copy-btn" id="hd-copy-text">
            📋 Copier le texte corrigé
          </button>
        </div>
        
        <div class="hd-section">
          <span class="hd-label">💡 Explication</span>
          <div class="hd-glass-box">
            <p style="font-size: 13px; color: #6b7280;">${escapeHtml(data.explanation || 'Aucune explication disponible')}</p>
          </div>
        </div>
      </div>
    `;
    
    try {
      document.body.appendChild(modal);
      currentModal = modal;
      console.log('✅ Modal ajouté au DOM');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du modal:', error);
      alert(`✅ Analyse terminée!\n\nCorrect: ${isCorrect ? 'OUI' : 'NON'}\nConfiance: ${confidence}%\n\nTexte corrigé:\n${data.corrected_version}`);
      return;
    }
    
    // Événements
    const closeBtn = document.getElementById('hd-close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hd-exit');
        setTimeout(() => {
          modal.remove();
          currentModal = null;
        }, 200);
      });
    }
    
    const copyBtn = document.getElementById('hd-copy-text');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const textToCopy = data.corrected_version || '';
        navigator.clipboard.writeText(textToCopy).then(() => {
          copyBtn.textContent = '✅ Copié !';
          setTimeout(() => {
            copyBtn.textContent = '📋 Copier le texte corrigé';
          }, 2000);
        }).catch(err => {
          console.error('Erreur copie:', err);
        });
      });
    }
    
    // Fermer en cliquant sur le backdrop
    const backdrop = modal.querySelector('.hd-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        modal.classList.add('hd-exit');
        setTimeout(() => {
          modal.remove();
          currentModal = null;
        }, 200);
      });
    }
    
    console.log('✅ Modal complètement configuré');
  }

  // Afficher modal d'erreur
  function showErrorModal(errorMessage) {
    console.log('❌ Affichage erreur:', errorMessage);
    
    if (currentModal) currentModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'hd-error-wrapper';
    modal.className = 'hd-wrapper';
    
    modal.innerHTML = `
      <div class="hd-backdrop"></div>
      <div class="hd-card hd-loader-card">
        <button class="hd-close-btn" id="hd-close-error">×</button>
        
        <div class="hd-header" style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
          <h2 class="hd-title">Erreur</h2>
        </div>
        
        <div class="hd-section">
          <div class="hd-glass-box" style="background: rgba(239, 68, 68, 0.05);">
            <p style="color: #dc2626; font-size: 14px;">${escapeHtml(errorMessage)}</p>
          </div>
          
          <div style="margin-top: 16px; padding: 12px; background: rgba(249, 250, 251, 0.8); border-radius: 8px; font-size: 12px; color: #6b7280;">
            <p style="margin-bottom: 8px;">💡 <strong>Assurez-vous que le backend tourne sur:</strong></p>
            <code style="display: block; padding: 8px; background: white; border-radius: 4px; font-family: monospace;">http://localhost:8000</code>
            <p style="margin-top: 8px;">🔧 <strong>Commande:</strong></p>
            <code style="display: block; padding: 8px; background: white; border-radius: 4px; font-family: monospace;">uvicorn main:app --reload</code>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    currentModal = modal;
    
    const closeBtn = document.getElementById('hd-close-error');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hd-exit');
        setTimeout(() => {
          modal.remove();
          currentModal = null;
        }, 200);
      });
    }

    const backdrop = modal.querySelector('.hd-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        modal.classList.add('hd-exit');
        setTimeout(() => {
          modal.remove();
          currentModal = null;
        }, 200);
      });
    }
  }

  // Fonction utilitaire pour échapper le HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Mise à jour de l'état de l'extension
  function updateExtensionState() {
    console.log(`Extension ${isActive ? 'activée ✅' : 'désactivée ⚠️'}`);
  }

  console.log('✅ Content script prêt');
}