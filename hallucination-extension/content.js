// =======================================================
// 🎨 CONTENT SCRIPT - Style "Integration Component"
// =======================================================

if (window.hallucinationDetectorLoaded) {
  console.log("Content script déjà chargé");
} else {
  window.hallucinationDetectorLoaded = true;
  console.log("🔍 Hallucination Detector - Style Loaded");

  let isActive = true;
  let currentModal = null;

  // --- 1. INJECTION DES STYLES (Conversion du Tailwind en CSS natif) ---
  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);

  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    /* Reset & Variables basés sur le design fourni */
    .hd-wrapper { all: initial; font-family: 'Inter', sans-serif; }
    .hd-fullscreen {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        z-index: 2147483647; /* Max Z-index */
        display: flex; align-items: center; justify-content: center;
        padding: 1rem; box-sizing: border-box;
    }
    .hd-backdrop-blur {
        position: absolute; inset: 0;
        background: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(4px);
    }
    .hd-card {
        position: relative;
        width: 100%; max-width: 450px;
        background: white;
        border-radius: 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(229, 231, 235, 0.5);
        overflow: hidden;
        display: flex; flex-direction: column;
        animation: hd-slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    /* Header Area (L'illustration sombre) */
    .hd-card-header {
        position: relative;
        height: 190px;
        width: 100%;
        background: #0B0F19;
        overflow: hidden;
        display: flex; align-items: center; justify-content: center;
    }
    .hd-gradient-left {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: radial-gradient(circle at 30% 50%, rgba(251,146,60,0.1), transparent 50%);
        opacity: 0.6;
    }
    .hd-gradient-right {
        position: absolute; top: 0; right: 0; width: 100%; height: 100%;
        background: radial-gradient(circle at 70% 50%, rgba(139,92,246,0.1), transparent 50%);
        opacity: 0.6;
    }
    
    /* Content Area */
    .hd-card-body { padding: 24px 32px; display: flex; flex-direction: column; gap: 20px; }
    
    .hd-title {
        font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 600;
        color: #111827; margin: 0; letter-spacing: -0.025em;
    }
    .hd-description {
        font-family: 'Inter', sans-serif; font-size: 15px; color: #6B7280;
        margin: 4px 0 0 0; line-height: 1.5; font-weight: 400;
    }

    /* Status Box (Style Input Readonly) */
    .hd-status-box {
        position: relative;
        width: 100%;
        background: white;
        border: 1px solid #E5E7EB;
        border-radius: 12px;
        padding: 12px 16px;
        display: flex; align-items: center; justify-content: space-between;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        box-sizing: border-box;
    }
    .hd-status-text { font-size: 14px; color: #4B5563; font-weight: 500; }
    
    /* Scrollable Content */
    .hd-scroll-content {
        background: #F9FAFB;
        border: 1px solid #F3F4F6;
        border-radius: 12px;
        padding: 16px;
        max-height: 200px;
        overflow-y: auto;
        font-size: 14px;
        line-height: 1.6;
        color: #374151;
        white-space: pre-wrap;
    }

    /* Tabs (Style Toggle Custom) */
    .hd-tabs {
        display: flex; gap: 12px; padding-bottom: 8px; border-bottom: 1px solid #F3F4F6;
    }
    .hd-tab-btn {
        background: none; border: none; cursor: pointer;
        padding: 8px 12px; border-radius: 8px;
        font-size: 14px; font-weight: 500; color: #6B7280;
        transition: all 0.2s; font-family: 'Inter', sans-serif;
    }
    .hd-tab-btn:hover { background: #F3F4F6; color: #111827; }
    .hd-tab-btn.active { background: #EEF2FF; color: #4F46E5; }

    /* Actions Buttons */
    .hd-actions {
        display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        margin-top: 8px; padding-top: 8px;
    }
    .hd-btn {
        display: flex; align-items: center; justify-content: center;
        padding: 12px 20px; border-radius: 9999px;
        font-size: 15px; font-weight: 500; cursor: pointer;
        transition: all 0.2s; font-family: 'Inter', sans-serif;
    }
    .hd-btn-secondary {
        background: white; border: 1px solid #E5E7EB; color: #4B5563;
    }
    .hd-btn-secondary:hover { background: #F9FAFB; color: #111827; }
    
    .hd-btn-primary {
        background: #000000; border: 1px solid #000000; color: white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .hd-btn-primary:hover { background: #1f2937; }

    /* Loading Pulse */
    .hd-loader-spinner {
        width: 40px; height: 40px; border: 3px solid #E5E7EB;
        border-top-color: #4F46E5; border-radius: 50%;
        animation: hd-spin 1s linear infinite;
        margin: 0 auto;
    }

    @keyframes hd-slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes hd-spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(styleSheet);

  // --- 2. LOGIQUE MESSAGING ---
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

  // --- 3. COMPOSANTS UI ---

  // L'illustration SVG exacte de votre image HTML
  const getHeaderIllustration = () => `
    <div class="hd-card-header">
        <div class="hd-gradient-left"></div>
        <div class="hd-gradient-right"></div>
        <svg width="320" height="160" viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; object-fit:contain;">
            <path d="M70 160 C 70 130, 110 130, 110 100 C 110 90, 125 90, 135 90" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"></path>
            <path d="M250 0 C 250 40, 210 50, 210 90 C 210 90, 195 90, 185 90" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"></path>
            <g transform="translate(135, 82)">
                <rect width="24" height="16" rx="4" fill="#94A3B8"></rect>
                <rect x="24" y="4" width="6" height="3" fill="#94A3B8" rx="1"></rect>
                <rect x="24" y="9" width="6" height="3" fill="#94A3B8" rx="1"></rect>
                <rect x="4" y="3" width="16" height="6" rx="2" fill="white" fill-opacity="0.2"></rect>
            </g>
            <g transform="translate(165, 81)">
                <path d="M0 4 C0 1.79086 1.79086 0 4 0 H14 C17.3137 0 20 2.68629 20 6 V12 C20 15.3137 17.3137 18 14 18 H4 C1.79086 18 0 16.2091 0 14 V4Z" fill="#CBD5E1"></path>
                <rect x="6" y="3" width="10" height="6" rx="2" fill="white" fill-opacity="0.3"></rect>
            </g>
            <g transform="translate(-10, 40)">
                <rect width="90" height="140" rx="12" fill="#F97316"></rect>
                <rect x="10" y="10" width="70" height="40" rx="6" fill="#FB923C"></rect>
                <rect x="10" y="60" width="30" height="40" rx="6" fill="#FB923C"></rect>
                <rect x="50" y="60" width="30" height="40" rx="6" fill="#FB923C"></rect>
                <rect x="10" y="110" width="70" height="20" rx="6" fill="#FB923C"></rect>
            </g>
            <g transform="translate(240, 20)">
                <rect width="90" height="150" rx="12" fill="#8B5CF6"></rect>
                <circle cx="15" cy="15" r="3" fill="#A78BFA"></circle>
                <circle cx="25" cy="15" r="3" fill="#A78BFA"></circle>
                <circle cx="35" cy="15" r="3" fill="#A78BFA"></circle>
                <rect x="10" y="30" width="70" height="50" rx="6" fill="#A78BFA"></rect>
                <rect x="10" y="90" width="30" height="30" rx="6" fill="#A78BFA"></rect>
                <rect x="50" y="90" width="30" height="30" rx="6" fill="#A78BFA"></rect>
                <rect x="10" y="130" width="70" height="10" rx="4" fill="#A78BFA"></rect>
            </g>
        </svg>
    </div>
  `;

  // --- LOADER ---
  function showModernLoader() {
    const old = document.getElementById("hd-modern-container");
    if (old) old.remove();

    const loader = document.createElement("div");
    loader.id = "hd-modern-container";
    loader.className = "hd-fullscreen hd-wrapper";
    
    loader.innerHTML = `
      <div class="hd-backdrop-blur"></div>
      <div class="hd-card">
        ${getHeaderIllustration()}
        <div class="hd-card-body" style="align-items: center; text-align: center; padding-bottom: 40px;">
          <div class="hd-loader-spinner"></div>
          <div>
            <h2 class="hd-title">Analyse en cours</h2>
            <p class="hd-description">Connexion à la base de connaissances...</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(loader);
  }

  function hideLoader() {
    const loader = document.getElementById("hd-modern-container");
    if (loader) loader.remove();
  }

  // --- RESULT MODAL ---
  function showModernResult(data, originalText) {
    if (currentModal) currentModal.remove();

    const isHallucination = data.ai_analysis.is_hallucination;
    const confidence = (data.ai_analysis.confidence_score * 100).toFixed(0);
    const correctedText = data.ai_analysis.corrected_text;

    // Configuration des couleurs selon le résultat
    let statusText = "Information Vérifiée";
    let statusColor = "#10B981"; // Emerald Green
    let icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

    if (confidence < 50 || isHallucination) {
        statusText = "Hallucination Détectée";
        statusColor = "#EF4444"; // Red
        icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (confidence < 85) {
        statusText = "Vérification Partielle";
        statusColor = "#F59E0B"; // Amber
        icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    }

    const modal = document.createElement("div");
    modal.id = "hd-modern-container";
    modal.className = "hd-fullscreen hd-wrapper";
    
    modal.innerHTML = `
      <div class="hd-backdrop-blur"></div>
      
      <div class="hd-card">
        ${getHeaderIllustration()}
        
        <div class="hd-card-body">
            <div>
                <h2 class="hd-title">Rapport d'Analyse</h2>
                <p class="hd-description">Comparaison entre le texte sélectionné et la base factuelle.</p>
            </div>

            <div class="hd-status-box" style="border-color: ${statusColor}40;">
                <span class="hd-status-text">Score de Confiance</span>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-weight:600; color:${statusColor}">${confidence}% - ${statusText}</span>
                    ${icon}
                </div>
            </div>

            <div class="hd-tabs">
                <button class="hd-tab-btn active" data-target="corrected">Correction</button>
                <button class="hd-tab-btn" data-target="original">Original</button>
            </div>

            <div class="hd-scroll-content" id="hd-content-text">${escapeHtml(correctedText)}</div>

            <div class="hd-actions">
                <button class="hd-btn hd-btn-secondary" id="hd-close-btn">
                    Fermer
                </button>
                <button class="hd-btn hd-btn-primary" id="hd-copy-btn">
                    Copier le texte
                </button>
            </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    currentModal = modal;

    // Events
    const closeBtn = modal.querySelector("#hd-close-btn");
    const backdrop = modal.querySelector(".hd-backdrop-blur");
    const copyBtn = modal.querySelector("#hd-copy-btn");
    const contentText = modal.querySelector("#hd-content-text");
    const tabs = modal.querySelectorAll(".hd-tab-btn");

    const closeAction = () => {
        modal.querySelector('.hd-card').style.transform = 'translateY(20px)';
        modal.querySelector('.hd-card').style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
        currentModal = null;
    };

    closeBtn.addEventListener("click", closeAction);
    backdrop.addEventListener("click", closeAction);

    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(contentText.innerText).then(() => {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = "Copié !";
            copyBtn.style.background = "#10B981";
            copyBtn.style.borderColor = "#10B981";
            setTimeout(() => {
                copyBtn.innerText = originalText;
                copyBtn.style.background = "#000000";
                copyBtn.style.borderColor = "#000000";
            }, 2000);
        });
    });

    // Tab Logic
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            if (tab.dataset.target === "original") {
                contentText.innerText = originalText;
                contentText.style.color = "#6B7280";
            } else {
                contentText.innerText = correctedText;
                contentText.style.color = "#374151";
            }
        });
    });
  }

  // --- ERROR MODAL ---
  function showModernError(errorMessage) {
    if (currentModal) currentModal.remove();
    const modal = document.createElement("div");
    modal.id = "hd-modern-container";
    modal.className = "hd-fullscreen hd-wrapper";
    
    modal.innerHTML = `
      <div class="hd-backdrop-blur"></div>
      <div class="hd-card">
        ${getHeaderIllustration()}
        <div class="hd-card-body">
            <div>
                <h2 class="hd-title" style="color:#EF4444">Erreur de Connexion</h2>
                <p class="hd-description">Impossible de joindre le serveur d'analyse.</p>
            </div>
            <div class="hd-scroll-content" style="background:#FEF2F2; color:#B91C1C; border-color:#FECACA;">
                ${escapeHtml(errorMessage)}
            </div>
            <div class="hd-actions">
                <button class="hd-btn hd-btn-secondary" onclick="document.getElementById('hd-modern-container').remove()">Fermer</button>
                <button class="hd-btn hd-btn-primary" onclick="window.location.reload()">Réessayer</button>
            </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    currentModal = modal;
  }

  function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}