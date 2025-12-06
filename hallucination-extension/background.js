// =======================================================
// 🧠 BACKGROUND SCRIPT - Hallucination Detector Core
// =======================================================

const API_CONFIG = {
  baseUrl: "http://localhost:8000",
  endpoint: "/api/v1/detect-hallucination",
  timeout: 15000 // 15 secondes max avant timeout
};

// Gestion de l'état
let extensionEnabled = true;

// 🚀 Initialisation
chrome.runtime.onInstalled.addListener(() => {
  console.log("✨ Extension Hallucination Detector : Ready");
  chrome.storage.local.set({ extensionEnabled: true });
  createContextMenu();
});

function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "check-hallucination",
      title: "✨ Vérifier la véracité (AI)",
      contexts: ["selection"]
    });
  });
}

// 🖱️ Interaction Menu Contextuel
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "check-hallucination") return;

  const storage = await chrome.storage.local.get(["extensionEnabled"]);
  if (!storage.extensionEnabled) return;

  const selectedText = info.selectionText?.trim();
  if (!selectedText) return;

  // Injection préventive si le content script n'est pas là
  await ensureContentScript(tab.id);
  
  // Lancement du flow
  handleAnalysisFlow(selectedText, tab.id);
});

// 🔄 Logique Principale
async function handleAnalysisFlow(text, tabId) {
  try {
    // 1. Afficher le loader UI via le content script
    await sendToContent(tabId, { action: "showLoader" });

    // 2. Appel API avec Timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erreur serveur (${response.status})`);
    }

    const data = await response.json();

    // 3. Envoyer les résultats au UI
    await sendToContent(tabId, {
      action: "showResult",
      data,
      originalText: text
    });

  } catch (error) {
    console.error("❌ Erreur Flow:", error);
    
    let userMessage = "Impossible de contacter l'IA.";
    if (error.name === 'AbortError') userMessage = "Le serveur met trop de temps à répondre.";
    else if (error.message.includes('Failed to fetch')) userMessage = "Serveur déconnecté (Vérifiez localhost:8000).";

    await sendToContent(tabId, {
      action: "showError",
      error: userMessage
    });
  }
}

// 🛠️ Utilitaires
async function ensureContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });
  } catch (e) {
    // Ignorer si déjà injecté ou impossible d'injecter (ex: chrome:// pages)
  }
}

function sendToContent(tabId, payload) {
  return chrome.tabs.sendMessage(tabId, payload).catch(err => {
    console.warn("⚠️ Impossible d'envoyer au content script (onglet fermé ?)", err);
  });
}

// 📨 Écouteurs de messages génériques (pour future expansion popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkBackendStatus") {
    fetch(API_CONFIG.baseUrl).then(r => sendResponse({ online: true })).catch(() => sendResponse({ online: false }));
    return true; // Async response
  }
});