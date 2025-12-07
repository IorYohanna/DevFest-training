// =======================================================
// 🎨 CONTENT SCRIPT - Interface Exacte comme React App
// =======================================================

if (window.hallucinationDetectorLoaded) {
  console.log("Content script déjà chargé");
} else {
  window.hallucinationDetectorLoaded = true;
  console.log("🔍 Hallucination Detector - Chargement...");

  let isActive = true;
  let currentModal = null;

  // Écouter les messages du background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      if (request.action === "ping") {
        sendResponse({ success: true, ready: true });
      } else if (request.action === "showLoader") {
        showModernLoader();
        sendResponse({ success: true });
      } else if (request.action === "toggleExtension") {
        isActive = request.enabled;
        sendResponse({ success: true });
      } else if (request.action === "showResult") {
        hideLoader();
        showModernResult(request.data, request.originalText);
        sendResponse({ success: true });
      } else if (request.action === "showError") {
        hideLoader();
        showModernError(request.error);
        sendResponse({ success: true });
      }
    } catch (error) {
      console.error("Erreur:", error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  });

  // ========================================
  // 🎬 LOADER MODERNE (Style React)
  // ========================================
  function showModernLoader() {
    const oldLoader = document.getElementById("hd-modern-loader");
    if (oldLoader) oldLoader.remove();

    const loader = document.createElement("div");
    loader.id = "hd-modern-loader";
    loader.className = "hd-fullscreen";
    loader.innerHTML = `
      <div class="hd-backdrop-blur"></div>
      <div class="hd-loader-container">
        <div class="hd-aurora-effect"></div>
        
        <div class="hd-loader-content">
          <div class="hd-loader-icon">
            <div class="hd-pulse-ring"></div>
            <div class="hd-pulse-ring hd-delay-1"></div>
          </div>
          
          <h3 class="hd-loader-title">Analyse en cours...</h3>
          <p class="hd-loader-desc">Vérification factuelle via RAG</p>
          
          <div class="hd-steps-indicator">
            <div class="hd-step hd-active">
              <div class="hd-step-dot"></div>
              <span>Scanning</span>
            </div>
            <div class="hd-step-divider"></div>
            <div class="hd-step" id="step-2">
              <div class="hd-step-dot"></div>
              <span>RAG Verify</span>
            </div>
            <div class="hd-step-divider"></div>
            <div class="hd-step" id="step-3">
              <div class="hd-step-dot"></div>
              <span>Synthesis</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(loader);

    // Animation progressive des étapes
    setTimeout(() => {
      const step2 = loader.querySelector("#step-2");
      step2?.classList.add("hd-active");
    }, 1500);

    setTimeout(() => {
      const step3 = loader.querySelector("#step-3");
      step3?.classList.add("hd-active");
    }, 3000);
  }

  function hideLoader() {
    const loader = document.getElementById("hd-modern-loader");
    if (loader) {
      loader.classList.add("hd-fade-out");
      setTimeout(() => loader.remove(), 300);
    }
  }

  // ========================================
  // 🎨 RÉSULTAT COMPLET (Style React identique)
  // ========================================
  function showModernResult(data, originalText) {
    if (currentModal) currentModal.remove();

    const isHallucination = data.ai_analysis.is_hallucination;
    const confidence = (data.ai_analysis.confidence_score * 100).toFixed(0);
    const correctedText = data.ai_analysis.corrected_text;
    const sources = data.ai_analysis.rag_sources || [];

    // Déterminer le thème (success/warning/error)
    let theme = "success";
    if (confidence >= 80) theme = "success";
    else if (confidence > 0) theme = "warning";
    else theme = "error";

    const modal = document.createElement("div");
    modal.id = "hd-modern-result";
    modal.className = "hd-fullscreen";
    modal.innerHTML = `
      <div class="hd-backdrop-blur"></div>
      
      <div class="hd-result-wrapper">
        <div class="hd-aurora-effect"></div>
        
        <button class="hd-close-button" id="hd-close-modal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <!-- Cards Grid -->
        <div class="hd-cards-grid">
          
          <!-- Status Card (2 colonnes) -->
          <div class="hd-status-card hd-theme-${theme}">
            <div class="hd-status-icon">
              ${
                theme === "success"
                  ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                     <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                     <path d="m9 12 2 2 4-4"/>
                   </svg>`
                  : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                     <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                     <path d="M12 8v4"/><path d="M12 16h.01"/>
                   </svg>`
              }
            </div>
            <div class="hd-status-content">
              <h3 class="hd-status-title">
                ${
                  theme === "success"
                    ? "CONTENU VÉRIFIÉ"
                    : theme === "warning"
                    ? "VÉRIFICATION PARTIELLE"
                    : "HALLUCINATION DÉTECTÉE"
                }
              </h3>
              <p class="hd-status-desc">
                ${
                  theme === "success"
                    ? "L'analyse confirme la cohérence factuelle avec la base de connaissance"
                    : theme === "warning"
                    ? "Des divergences mineures ont été identifiées et corrigées"
                    : "L'affirmation est entièrement incorrecte selon les sources disponibles"
                }
              </p>
            </div>
          </div>
          
          <!-- Confidence Card -->
          <div class="hd-confidence-card">
            <div class="hd-confidence-header">
              <span class="hd-confidence-label">CONFIANCE</span>
              <span class="hd-confidence-value">${confidence}%</span>
            </div>
            <div class="hd-progress-track">
              <div class="hd-progress-bar hd-theme-${theme}" style="width: ${Math.max(
      confidence,
      5
    )}%"></div>
            </div>
          </div>
          
        </div>
        
        <!-- Tabs Panel -->
        <div class="hd-tabs-container">
          <div class="hd-tabs-header">
            <button class="hd-tab hd-tab-active" data-tab="synthesis">
              Synthèse & Correction
            </button>
            <button class="hd-tab" data-tab="diff">
              Différentiel
            </button>
          </div>
          
          <div class="hd-tabs-content">
            
            <!-- TAB: Synthesis -->
            <div class="hd-tab-panel hd-active" data-panel="synthesis">
              
              <div class="hd-section">
                <div class="hd-section-header">
                  <h4 class="hd-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                    RÉSULTAT CORRIGÉ
                  </h4>
                  <button class="hd-copy-button" id="hd-copy-text">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    <span>Copier</span>
                  </button>
                </div>
                <div class="hd-corrected-text">${escapeHtml(
                  correctedText
                )}</div>
              </div>
              
              ${
                sources.length > 0
                  ? `
              <div class="hd-section">
                <h4 class="hd-section-title hd-small">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.3-4.3"/>
                  </svg>
                  SOURCES CONSULTÉES
                </h4>
                <div class="hd-sources-grid">
                  ${sources
                    .map(
                      (s, i) => `
                    <div class="hd-source-card">
                      <div class="hd-source-header">
                        <span class="hd-source-name">Source #${i + 1}</span>
                        <span class="hd-source-badge hd-${
                          s.validity === "correct" ? "valid" : "invalid"
                        }">
                          ${s.validity}
                        </span>
                      </div>
                      <p class="hd-source-snippet">"${escapeHtml(
                        s.snippet
                      )}"</p>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
              `
                  : ""
              }
              
            </div>
            
            <!-- TAB: Différentiel -->
            <div class="hd-tab-panel" data-panel="diff">
              <div class="hd-diff-grid">
                
                <div class="hd-diff-column">
                  <span class="hd-diff-label hd-original">ORIGINAL</span>
                  <div class="hd-diff-box hd-original">
                    <p>${escapeHtml(originalText)}</p>
                  </div>
                </div>
                
                <div class="hd-diff-column">
                  <span class="hd-diff-label hd-corrected">CORRECTION SÉMANTIQUE</span>
                  <div class="hd-diff-box hd-corrected">
                    <p>${escapeHtml(correctedText)}</p>
                  </div>
                </div>
                
              </div>
            </div>
            
          </div>
        </div>
        
      </div>
    `;

    document.body.appendChild(modal);
    currentModal = modal;

    // ========== EVENT LISTENERS ==========

    // Close button
    modal
      .querySelector("#hd-close-modal")
      ?.addEventListener("click", closeModal);
    modal
      .querySelector(".hd-backdrop-blur")
      ?.addEventListener("click", closeModal);

    // Copy button
    const copyBtn = modal.querySelector("#hd-copy-text");
    copyBtn?.addEventListener("click", () => {
      navigator.clipboard.writeText(correctedText).then(() => {
        const span = copyBtn.querySelector("span");
        const svg = copyBtn.querySelector("svg");
        if (span) span.textContent = "Copié !";
        if (svg) {
          svg.innerHTML = `<path d="M20 6 9 17l-5-5"/>`;
        }
        setTimeout(() => {
          if (span) span.textContent = "Copier";
          if (svg) {
            svg.innerHTML = `<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                             <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>`;
          }
        }, 2000);
      });
    });

    // Tab switching
    const tabs = modal.querySelectorAll(".hd-tab");
    const panels = modal.querySelectorAll(".hd-tab-panel");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetPanel = tab.dataset.tab;

        tabs.forEach((t) => t.classList.remove("hd-tab-active"));
        panels.forEach((p) => p.classList.remove("hd-active"));

        tab.classList.add("hd-tab-active");
        const panel = modal.querySelector(`[data-panel="${targetPanel}"]`);
        panel?.classList.add("hd-active");
      });
    });

    console.log("✅ Interface moderne affichée (style React)");
  }

  // ========================================
  // ⚠️ MODAL D'ERREUR
  // ========================================
  function showModernError(errorMessage) {
    if (currentModal) currentModal.remove();

    const modal = document.createElement("div");
    modal.id = "hd-modern-result";
    modal.className = "hd-fullscreen";
    modal.innerHTML = `
      <div class="hd-backdrop-blur"></div>
      
      <div class="hd-error-wrapper">
        <div class="hd-aurora-effect"></div>
        
        <button class="hd-close-button" id="hd-close-modal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div class="hd-error-content">
          <div class="hd-error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
              <path d="M12 8v4"/><path d="M12 16h.01"/>
            </svg>
          </div>
          
          <h2 class="hd-error-title">Erreur de connexion</h2>
          <p class="hd-error-message">${escapeHtml(errorMessage)}</p>
          
          <div class="hd-error-help">
            <p>💡 Assurez-vous que le backend est en cours d'exécution :</p>
            <code>uvicorn main:app --reload</code>
            <p>Backend attendu : <code>http://localhost:8000</code></p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    currentModal = modal;

    modal
      .querySelector("#hd-close-modal")
      ?.addEventListener("click", closeModal);
    modal
      .querySelector(".hd-backdrop-blur")
      ?.addEventListener("click", closeModal);
  }

  function closeModal() {
    if (currentModal) {
      currentModal.classList.add("hd-fade-out");
      setTimeout(() => {
        currentModal.remove();
        currentModal = null;
      }, 300);
    }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  console.log("✅ Content script moderne prêt");
}
