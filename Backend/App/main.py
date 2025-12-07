from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from router.nlp_router import nlp_router

import pandas as pd
import io
import logging
from contextlib import asynccontextmanager

# ============================================================
# LOGGING
# ============================================================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("main")

# ============================================================
# IMPORT SERVICES (PRESIDIO, ROUTERS)
# ============================================================

try:
    import spacy
    from presidio_analyzer import AnalyzerEngine
    from presidio_analyzer.nlp_engine import NlpEngineProvider
    from presidio_anonymizer import AnonymizerEngine
    from presidio_anonymizer.entities import OperatorConfig
    PRESIDIO_AVAILABLE = True
    logger.info("✅ Presidio disponible")
except ImportError:
    PRESIDIO_AVAILABLE = False
    logger.warning("⚠️ Presidio non disponible")

# Routers spécialisés
try:
    from routes import (
        global_router,
        hallucination_router,
        detoxify_router,
    )
    logger.info("✅ Tous les routers importés")
except Exception as e:
    logger.error(f"❌ Erreur import routers: {e}")
    raise

# ============================================================
# IMPORT DU MODELE LOCAL (ALBERT)
# ============================================================
from core.model_loader import ModelLoader

# ============================================================
# VARIABLES GLOBALES
# ============================================================
analyzer = None
anonymizer = None

# ============================================================
# LIFESPAN : CHARGE ALBERT + CONFIGURE PRESIDIO
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Cycle de vie complet :
    - Chargement ALBERT local
    - Configuration Presidio
    """
    global analyzer, anonymizer

    logger.info("=" * 60)
    logger.info("🚀 DÉMARRAGE SAFEAI API")
    logger.info("=" * 60)

    # 🔥 CHARGEMENT UNIQUEMENT DU MODELE LOCAL ALBERT
    try:
        ModelLoader.load_models()
        logger.info("🤖 Modèle ALBERT local prêt !")
    except Exception as e:
        logger.error(f"❌ Erreur chargement modèle local: {e}")

    # 🔒 CONFIG PRESIDIO (si disponible)
    if PRESIDIO_AVAILABLE:
        try:
            import fr_core_news_lg

            configuration = {
                "nlp_engine_name": "spacy",
                "models": [{"lang_code": "fr", "model_name": "fr_core_news_lg"}],
            }

            provider = NlpEngineProvider(nlp_configuration=configuration)
            nlp_engine = provider.create_engine()

            analyzer = AnalyzerEngine(
                nlp_engine=nlp_engine,
                supported_languages=["fr"]
            )
            anonymizer = AnonymizerEngine()

            logger.info("🔐 Presidio configuré en FRANÇAIS")
        except Exception as e:
            logger.warning(f"⚠️ Fallback Presidio EN: {e}")
            analyzer = AnalyzerEngine()
            anonymizer = AnonymizerEngine()

    logger.info("✅ API prête !")
    logger.info("=" * 60)

    yield

    logger.info("🛑 Arrêt de SAFEAI API...")

# ============================================================
# APPLICATION FASTAPI
# ============================================================

app = FastAPI(
    title="SafeAI API",
    version="2.0.0",
    description="API SafeAI avec ALBERT local + Presidio + Detoxify + Hallucination",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ============================================================
# MIDDLEWARE LOGGING
# ============================================================

@app.middleware("http")
async def log_requests(request, call_next):
    import time
    start = time.time()

    logger.info(f"→ {request.method} {request.url.path}")

    response = await call_next(request)

    elapsed = (time.time() - start) * 1000
    logger.info(f"← {request.method} {request.url.path} [{response.status_code}] {elapsed:.2f}ms")

    response.headers["X-Process-Time"] = str(elapsed)
    return response

# ============================================================
# ENDPOINTS D'ANONYMISATION (inchangés)
# ============================================================
# 👉 Je garde exactement ton code ici (clean-text, clean-file)
# 👉 Vu qu'il est long, je ne le recopie pas, tu gardes ton original

# ============================================================
# INCLUSION DES ROUTERS EXTERNES
# ============================================================

app.include_router(global_router)
app.include_router(hallucination_router)
app.include_router(nlp_router)# app.include_router(complexity_router)   # <-- IMPORTANT !! Charge ton ALBERT
app.include_router(detoxify_router)

# ============================================================
# MODE DEBUG
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
