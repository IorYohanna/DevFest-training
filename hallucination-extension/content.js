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
        // Répondre immédiatement pour confirmer que le script est prêt
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

    return true; // Réponse asynchrone
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
    
    // Afficher le loader
    showLoader();
    
    try {
      // Envoyer au background script qui fera l'appel API
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
    // Supprimer l'ancien loader s'il existe
    const oldLoader = document.getElementById('hallucination-loader');
    if (oldLoader) oldLoader.remove();

    const loader = document.createElement('div');
    loader.id = 'hallucination-loader';
    loader.innerHTML = `
      <div class="hd-loader-content">
        <div class="hd-spinner"></div>
        <p>Analyse en cours...</p>
        <p style="font-size: 12px; margin-top: 10px; opacity: 0.7;">✅ Loader affiché avec succès</p>
      </div>
    `;
    
    // S'assurer qu'il est ajouté au body
    if (document.body) {
      document.body.appendChild(loader);
      console.log('⏳ Loader affiché avec succès');
      console.log('🔍 Loader element:', loader);
    } else {
      console.error('❌ document.body n\'existe pas encore');
    }
  }

  function hideLoader() {
    const loader = document.getElementById('hallucination-loader');
    if (loader) {
      loader.remove();
      console.log('✅ Loader masqué');
    }
  }

  // Afficher le modal de résultat
  function showResultModal(data, originalText) {
    console.log('📊 Affichage du résultat modal');
    console.log('📦 Data reçue:', data);
    console.log('📝 Original text:', originalText);
    
    // Supprimer l'ancien modal s'il existe
    if (currentModal) {
      console.log('🗑️ Suppression ancien modal');
      currentModal.remove();
    }
    
    if (!document.body) {
      console.error('❌ document.body n\'existe pas !');
      return;
    }
    
    const isHallucination = data.ai_analysis.is_hallucination;
    const confidence = (data.ai_analysis.confidence_score * 100).toFixed(1);
    
    console.log(`🎯 Hallucination: ${isHallucination}, Confiance: ${confidence}%`);
    
    const modal = document.createElement('div');
    modal.id = 'hallucination-modal';
    modal.className = 'hd-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 2147483647;';
    
    modal.innerHTML = `
      <div class="hd-modal-overlay"></div>
      <div class="hd-modal-content">
        <button class="hd-modal-close" id="hd-close-btn">×</button>
        
        <div class="hd-modal-header ${isHallucination ? 'hd-error' : 'hd-success'}">
          <div class="hd-icon">
            ${isHallucination ? '⚠️' : '✓'}
          </div>
          <h2>${isHallucination ? 'HALLUCINATION DÉTECTÉE' : 'INFORMATION VÉRIFIÉE'}</h2>
          <p class="hd-confidence">Confiance: ${confidence}%</p>
        </div>
        
        <div class="hd-modal-body">
          <div class="hd-section">
            <h3>📝 Texte Original</h3>
            <div class="hd-text-box hd-original">
              ${escapeHtml(originalText)}
            </div>
          </div>
          
          <div class="hd-section">
            <h3>✅ Version Corrigée</h3>
            <div class="hd-text-box hd-corrected">
              ${escapeHtml(data.ai_analysis.corrected_text)}
            </div>
            <button class="hd-copy-btn" id="hd-copy-btn">
              📋 Copier le texte corrigé
            </button>
          </div>
          
          <div class="hd-section">
            <h3>📚 Sources RAG (${data.ai_analysis.rag_sources.length})</h3>
            <div class="hd-sources">
              ${data.ai_analysis.rag_sources.map(source => `
                <div class="hd-source">
                  <span class="hd-source-title">${escapeHtml(source.title)}</span>
                  <span class="hd-source-badge ${source.validity === 'correct' ? 'hd-valid' : 'hd-invalid'}">
                    ${source.validity === 'correct' ? '✓' : '✗'}
                  </span>
                  <p class="hd-source-snippet">"${escapeHtml(source.snippet)}"</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    
    try {
      document.body.appendChild(modal);
      currentModal = modal;
      console.log('✅ Modal ajouté au DOM');
      console.log('🔍 Modal element:', modal);
      console.log('🔍 Modal visible?', modal.offsetParent !== null);
      
      // Vérifier que le modal est bien dans le DOM
      const checkModal = document.getElementById('hallucination-modal');
      console.log('🔍 Modal retrouvé dans le DOM?', checkModal !== null);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du modal:', error);
      // Notification de fallback
      alert(`✅ Analyse terminée!\n\nHallucination: ${isHallucination ? 'OUI' : 'NON'}\nConfiance: ${confidence}%\n\nTexte corrigé:\n${data.ai_analysis.corrected_text}`);
      return;
    }
    
    // Événements
    const closeBtn = document.getElementById('hd-close-btn');
    if (closeBtn) {
      console.log('✅ Bouton fermer trouvé');
      closeBtn.addEventListener('click', () => {
        console.log('🔴 Fermeture du modal');
        modal.remove();
        currentModal = null;
      });
    } else {
      console.error('❌ Bouton fermer non trouvé');
    }
    
    const copyBtn = document.getElementById('hd-copy-btn');
    if (copyBtn) {
      console.log('✅ Bouton copier trouvé');
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(data.ai_analysis.corrected_text).then(() => {
          copyBtn.textContent = '✅ Copié !';
          setTimeout(() => {
            copyBtn.textContent = '📋 Copier le texte corrigé';
          }, 2000);
        }).catch(err => {
          console.error('Erreur copie:', err);
        });
      });
    }
    
    // Fermer en cliquant sur l'overlay
    const overlay = modal.querySelector('.hd-modal-overlay');
    if (overlay) {
      console.log('✅ Overlay trouvé');
      overlay.addEventListener('click', () => {
        console.log('🔴 Fermeture via overlay');
        modal.remove();
        currentModal = null;
      });
    }
    
    console.log('✅✅✅ Modal complètement configuré et affiché ✅✅✅');
  }

  // Afficher modal d'erreur
  function showErrorModal(errorMessage) {
    console.log('❌ Affichage erreur:', errorMessage);
    
    if (currentModal) currentModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'hallucination-modal';
    modal.className = 'hd-modal';
    
    modal.innerHTML = `
      <div class="hd-modal-overlay"></div>
      <div class="hd-modal-content hd-modal-small">
        <button class="hd-modal-close" id="hd-close-btn">×</button>
        <div class="hd-modal-header hd-error">
          <div class="hd-icon">⚠️</div>
          <h2>Erreur</h2>
        </div>
        <div class="hd-modal-body">
          <p>${escapeHtml(errorMessage)}</p>
          <p class="hd-error-hint">
            💡 Assurez-vous que le backend tourne sur <code>http://localhost:8000</code>
          </p>
          <p class="hd-error-hint">
            🔧 Commande: <code>uvicorn main:app --reload</code>
          </p>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    currentModal = modal;
    
    const closeBtn = document.getElementById('hd-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.remove();
        currentModal = null;
      });
    }

    const overlay = modal.querySelector('.hd-modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        modal.remove();
        currentModal = null;
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