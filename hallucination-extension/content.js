// =======================================================
// 🎨 CONTENT SCRIPT - Hallucination Detector (FINAL FIXED)
// =======================================================

if (window.hallucinationDetectorLoaded) {
    console.log("Content script déjà chargé");
} else {
    window.hallucinationDetectorLoaded = true;
    console.log("🔍 Hallucination Detector - Loaded");

    let isActive = true;
    let currentModal = null;

    // --- 1. INJECTION DES STYLES (SANS POLICE EXTERNE POUR ÉVITER LE CSP) ---
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
    /* Variables */
    :root {
        --hd-bg-overlay: rgba(0, 0, 0, 0.6);
        --hd-card-bg: #ffffff;
        --hd-header-bg: #13151f;
        --hd-primary-black: #000000;
        --hd-text-main: #111111;
        --hd-text-secondary: #6b7280;
        --hd-border-light: #e5e7eb;
        --hd-accent-orange: #ff8c66;
        --hd-accent-purple: #665df5;
        --hd-success: #10b981;
        --hd-error: #ef4444;
        --hd-warning: #f59e0b;
        --hd-radius: 24px;
        /* Police système sécurisée pour éviter les erreurs CSP */
        --hd-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        --hd-z-index: 2147483647;
    }

    /* Reset & Base */
    .hd-wrapper { all: initial; font-family: var(--hd-font); }
    .hd-wrapper * { box-sizing: border-box; font-family: var(--hd-font); }

    /* Container Plein Écran */
    .hd-fullscreen {
        position: fixed !important;
        top: 0 !important; left: 0 !important;
        width: 100vw !important; height: 100vh !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important; justify-content: center !important;
        pointer-events: none; /* Laisse passer les clics autour */
    }

    .hd-backdrop-blur {
        position: absolute; inset: 0;
        background: var(--hd-bg-overlay);
        backdrop-filter: blur(4px);
        pointer-events: auto; /* Capture les clics sur le fond */
        animation: hdFadeIn 0.3s forwards;
        z-index : -1
    }

    /* Carte Principale */
    .hd-card {
        position: relative;
        width: 440px; max-width: 90%;
        background: var(--hd-card-bg);
        border-radius: var(--hd-radius);
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        overflow: hidden;
        pointer-events: auto; /* Capture les clics sur la carte */
        display: flex; flex-direction: column;
        animation: hdSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    /* Header (Illustration) */
    .hd-card-header {
        height: 180px; background-color: var(--hd-header-bg);
        position: relative; overflow: hidden;
        display: flex; align-items: center; justify-content: center;
    }
    .hd-deco-block { position: absolute; border-radius: 12px; }
    .hd-block-orange {
        width: 120px; height: 140px; left: -20px; top: 20px;
        background: var(--hd-accent-orange); opacity: 0.9; transform: rotate(-5deg);
    }
    .hd-block-purple {
        width: 120px; height: 140px; right: -20px; top: 30px;
        background: var(--hd-accent-purple); opacity: 0.9; transform: rotate(5deg);
    }

    /* Body */
    .hd-card-body { padding: 24px 28px; background: #fff; display: flex; flex-direction: column; }
    
    .hd-title { font-size: 20px; font-weight: 700; color: var(--hd-text-main); margin: 0 0 8px 0; }
    .hd-description { font-size: 14px; color: var(--hd-text-secondary); margin: 0 0 24px 0; line-height: 1.5; }

    /* Status Box */
    .hd-status-box {
        border: 1px solid var(--hd-border-light); border-radius: 12px;
        padding: 12px 16px; margin-bottom: 20px;
        display: flex; align-items: center; justify-content: space-between;
        background: #F9FAFB;
    }

    /* Tabs */
    .hd-tabs { display: flex; gap: 16px; margin-bottom: 16px; border-bottom: 1px solid var(--hd-border-light); }
    .hd-tab-btn {
        background: none; border: none; padding: 0 0 8px 0;
        font-size: 13px; font-weight: 600; color: var(--hd-text-secondary);
        cursor: pointer; position: relative; transition: color 0.2s;
    }
    .hd-tab-btn.active { color: var(--hd-text-main); }
    .hd-tab-btn.active::after {
        content: ''; position: absolute; bottom: -1px; left: 0;
        width: 100%; height: 2px; background: var(--hd-primary-black);
    }

    /* Content Scroll */
    .hd-scroll-content {
        background: #f9fafb; border-radius: 8px; padding: 12px;
        max-height: 150px; overflow-y: auto;
        font-size: 13px; color: #374151; line-height: 1.6;
        white-space: pre-wrap; margin-bottom: 24px;
        border: 1px solid #f3f4f6;
    }

    /* Buttons */
    .hd-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .hd-btn {
        height: 44px; border-radius: 99px;
        font-size: 14px; font-weight: 600; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: opacity 0.2s; border: none;
    }
    .hd-btn-secondary { background: #fff; border: 1px solid var(--hd-border-light); color: var(--hd-text-main); }
    .hd-btn-secondary:hover { background: #f9fafb; }
    .hd-btn-primary { background: var(--hd-primary-black); color: #fff; }
    .hd-btn-primary:hover { opacity: 0.9; }

    /* Loader */
    .hd-loader-spinner {
        width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.3);
        border-top-color: white; border-radius: 50%;
        animation: hdSpin 1s linear infinite; margin: 0 auto;
    }

    @keyframes hdFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes hdSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes hdSpin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(styleSheet);


    // --- 2. LOGIQUE MESSAGING SÉCURISÉE ---
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
            if (request.action === "ping") {
                sendResponse({ success: true, ready: true });
            } 
            else if (request.action === "showLoader") {
                showModernLoader();
                sendResponse({ success: true });
            } 
            else if (request.action === "toggleExtension") {
                isActive = request.enabled;
                sendResponse({ success: true });
            } 
            else if (request.action === "showResult") {
                // SÉCURITÉ : Vérification stricte des données avant affichage
                if (!request.data || !request.data.ai_analysis) {
                    throw new Error("Données d'analyse reçues incomplètes.");
                }
                hideLoader();
                showModernResult(request.data, request.originalText);
                sendResponse({ success: true });
            } 
            else if (request.action === "showError") {
                hideLoader();
                showModernError(request.error);
                sendResponse({ success: true });
            }
        } catch (error) {
            console.error("Content Script Crash:", error);
            // EN CAS DE CRASH : On force l'affichage de l'erreur
            hideLoader();
            showModernError(error.message || "Erreur inconnue lors de l'affichage");
            sendResponse({ success: false, error: error.message });
        }
        return true;
    });


    // --- 3. COMPOSANTS UI ---

    function getHeaderIllustration() {
        return `
        <div class="hd-card-header">
            <div class="hd-deco-block hd-block-orange"></div>
            <div class="hd-deco-block hd-block-purple"></div>
            <svg width="100%" height="100%" style="position:absolute; top:0; left:0; z-index:2;" viewBox="0 0 320 160">
                <path d="M60 160 C 60 100, 260 100, 260 0" stroke="white" stroke-width="2" stroke-dasharray="6 4" fill="none" opacity="0.4"></path>
                <circle cx="160" cy="80" r="20" fill="rgba(255,255,255,0.1)"></circle>
                <circle cx="160" cy="80" r="8" fill="white"></circle>
            </svg>
        </div>
        `;
    }

    // --- LOADER ---
    function showModernLoader() {
        hideLoader(); // Nettoyer si existant
        const loader = document.createElement("div");
        loader.id = "hd-modern-container";
        loader.className = "hd-fullscreen hd-wrapper";
        
        loader.innerHTML = `
            <div class="hd-backdrop-blur"></div>
            <div class="hd-card" style="width: 320px; text-align: center;">
                <div class="hd-card-header" style="height: 120px;">
                    <div class="hd-loader-spinner"></div>
                </div>
                <div class="hd-card-body">
                    <h2 class="hd-title">Analyse en cours</h2>
                    <p class="hd-description" style="margin-bottom:0;">Vérification de la véracité...</p>
                </div>
            </div>
        `;
        document.body.appendChild(loader);
    }

    function hideLoader() {
        const el = document.getElementById("hd-modern-container");
        if (el) el.remove();
    }

    // --- RESULTAT ---
    function showModernResult(data, originalText) {
        if (currentModal) currentModal.remove();

        // 1. Préparation des données (avec valeurs par défaut pour éviter le crash)
        const analysis = data.ai_analysis || {};
        const isHallucination = analysis.is_hallucination || false;
        const confidence = typeof analysis.confidence_score === 'number' 
            ? (analysis.confidence_score * 100).toFixed(0) 
            : "0";
        const correctedText = analysis.corrected_text || "Aucune correction proposée.";
        
        let statusText = "Vérifié";
        let statusColor = "var(--hd-success)";
        
        if (isHallucination || parseInt(confidence) < 50) {
            statusText = "Hallucination";
            statusColor = "var(--hd-error)";
        } else if (parseInt(confidence) < 85) {
            statusText = "Douteux";
            statusColor = "var(--hd-warning)";
        }

        // 2. Création de la modale
        const modal = document.createElement("div");
        modal.id = "hd-modern-container";
        modal.className = "hd-fullscreen hd-wrapper";
        
        modal.innerHTML = `
            <div class="hd-backdrop-blur"></div>
            <div class="hd-card">
                ${getHeaderIllustration()}
                
                <div class="hd-card-body">
                    <h2 class="hd-title">Rapport d'Analyse</h2>
                    <p class="hd-description">Résultat de la vérification factuelle.</p>

                    <div class="hd-status-box" style="border-left: 4px solid ${statusColor};">
                        <span style="font-weight:600; font-size:14px; color:#374151;">Confiance IA</span>
                        <span style="font-weight:700; color:${statusColor};">${confidence}% • ${statusText}</span>
                    </div>

                    <div class="hd-tabs">
                        <button class="hd-tab-btn active" data-target="corrected">Correction</button>
                        <button class="hd-tab-btn" data-target="original">Original</button>
                    </div>

                    <div class="hd-scroll-content" id="hd-content-text">${escapeHtml(correctedText)}</div>

                    <div class="hd-actions">
                        <button class="hd-btn hd-btn-secondary" id="hd-close-btn">Fermer</button>
                        <button class="hd-btn hd-btn-primary" id="hd-copy-btn">Copier</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        currentModal = modal;

        // 3. Gestionnaires d'événements
        const closeBtn = modal.querySelector("#hd-close-btn");
        const backdrop = modal.querySelector(".hd-backdrop-blur");
        const copyBtn = modal.querySelector("#hd-copy-btn");
        const contentText = modal.querySelector("#hd-content-text");
        const tabs = modal.querySelectorAll(".hd-tab-btn");

        const closeAction = () => {
            if(currentModal) {
                currentModal.remove();
                currentModal = null;
            }
        };

        closeBtn.addEventListener("click", closeAction);
        backdrop.addEventListener("click", closeAction);

        // Copier
        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(contentText.innerText).then(() => {
                const oldText = copyBtn.innerText;
                copyBtn.innerText = "Copié !";
                copyBtn.style.backgroundColor = statusColor;
                setTimeout(() => {
                    copyBtn.innerText = oldText;
                    copyBtn.style.backgroundColor = "var(--hd-primary-black)";
                }, 2000);
            });
        });

        // Tabs
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                tabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                
                if (tab.dataset.target === "original") {
                    contentText.innerText = originalText || "Texte original non disponible";
                } else {
                    contentText.innerText = correctedText;
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
                <div class="hd-card-header" style="background:#FEF2F2; height:100px;">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <div class="hd-card-body">
                    <h2 class="hd-title" style="color:#EF4444">Erreur</h2>
                    <p class="hd-description">Une erreur est survenue lors de l'analyse.</p>
                    <div class="hd-scroll-content" style="background:#FFF1F2; color:#991B1B; border-color:#FECACA;">
                        ${escapeHtml(errorMessage)}
                    </div>
                    <div class="hd-actions">
                        <button class="hd-btn hd-btn-primary" style="background:#EF4444; width:100%; grid-column: span 2;" onclick="document.getElementById('hd-modern-container').remove()">Fermer</button>
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