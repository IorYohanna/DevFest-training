from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
import io
import logging
from contextlib import asynccontextmanager

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================
# IMPORT CONDITIONNEL DES SERVICES
# ============================================================

# Presidio pour l'anonymisation
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

# Import des routers
try:
    from routes import (
        global_router,
        hallucination_router,
        complexity_router,
        detoxify_router
    )
    logger.info("✅ Tous les routers importés")
except ImportError as e:
    logger.error(f"❌ Erreur import routers: {e}")
    raise

# ============================================================
# VARIABLES GLOBALES
# ============================================================

analyzer = None
anonymizer = None

# ============================================================
# CYCLE DE VIE DE L'APPLICATION
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application"""
    global analyzer, anonymizer
    
    # Startup
    logger.info("="*60)
    logger.info("🚀 DÉMARRAGE DE L'APPLICATION SAFEAI API")
    logger.info("="*60)
    
    # Configuration Presidio
    if PRESIDIO_AVAILABLE:
        try:
            import fr_core_news_lg
            logger.info("📦 Modèle Spacy Français détecté")
            
            configuration = {
                "nlp_engine_name": "spacy",
                "models": [{"lang_code": "fr", "model_name": "fr_core_news_lg"}]
            }
            
            provider = NlpEngineProvider(nlp_configuration=configuration)
            nlp_engine_with_french = provider.create_engine()
            
            analyzer = AnalyzerEngine(
                nlp_engine=nlp_engine_with_french,
                supported_languages=["fr"]
            )
            anonymizer = AnonymizerEngine()
            
            logger.info("✅ Presidio configuré en FRANÇAIS")
            
        except ImportError:
            logger.warning("⚠️ Modèle 'fr_core_news_lg' introuvable")
            logger.warning("👉 Installation: python -m spacy download fr_core_news_lg")
            if PRESIDIO_AVAILABLE:
                analyzer = AnalyzerEngine()
                anonymizer = AnonymizerEngine()
                logger.info("⚠️ Presidio configuré en ANGLAIS (fallback)")
    
    logger.info("="*60)
    logger.info("✅ APPLICATION PRÊTE!")
    logger.info("📚 Documentation: http://localhost:8000/docs")
    logger.info("❤️  Health Check: http://localhost:8000/health")
    logger.info("="*60)
    
    yield
    
    # Shutdown
    logger.info("🛑 Arrêt de l'application...")

# ============================================================
# CRÉATION DE L'APPLICATION
# ============================================================

app = FastAPI(
    title="SafeAI API",
    description="""
    ## API Unifiée pour le Nettoyage et l'Analyse de Données
    
    ### 🎯 Fonctionnalités
    
    - **🛡️ Détection de Toxicité** - Analyse et filtre les contenus toxiques
    - **🔍 Détection d'Hallucinations** - Vérifie la véracité des affirmations
    - **🧠 Classification de Complexité** - Évalue la complexité des textes avec ALBERT
    - **🔒 Anonymisation** - Protège les données sensibles avec Presidio
    
    ### 📊 Services Disponibles
    
    Consultez le `/health` endpoint pour voir l'état de chaque service.
    """,
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# ============================================================
# MIDDLEWARE
# ============================================================

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware de logging personnalisé
@app.middleware("http")
async def log_requests(request, call_next):
    """Log toutes les requêtes"""
    import time
    
    start_time = time.time()
    
    # Log la requête
    logger.info(f"→ {request.method} {request.url.path}")
    
    # Traiter la requête
    response = await call_next(request)
    
    # Log la réponse
    process_time = (time.time() - start_time) * 1000
    logger.info(
        f"← {request.method} {request.url.path} "
        f"[{response.status_code}] {process_time:.2f}ms"
    )
    
    # Ajouter le temps de traitement dans les headers
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

# ============================================================
# HANDLER D'ERREURS GLOBAL
# ============================================================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handler global pour toutes les exceptions non gérées"""
    logger.error(f"❌ Erreur non gérée: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Erreur interne du serveur",
            "detail": str(exc),
            "path": str(request.url)
        }
    )

# ============================================================
# MODÈLES PYDANTIC POUR ANONYMISATION
# ============================================================

class TextRequest(BaseModel):
    """Requête pour anonymiser un texte"""
    text: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Je m'appelle Jean Dupont, mon email est jean@example.com"
            }
        }

class AnonymizationResponse(BaseModel):
    """Réponse d'anonymisation"""
    original: str
    cleaned: str
    entities_found: int
    processing_time_ms: float

# ============================================================
# FONCTIONS UTILITAIRES
# ============================================================

def anonymiser_texte(texte_brut: str) -> str:
    """
    Anonymise un texte en remplaçant les données sensibles par des emojis
    
    Args:
        texte_brut: Texte à anonymiser
        
    Returns:
        Texte anonymisé
    """
    if not PRESIDIO_AVAILABLE or not analyzer:
        return texte_brut
    
    if not isinstance(texte_brut, str) or len(texte_brut) < 2:
        return texte_brut

    try:
        # Analyse en Français
        resultats_analyse = analyzer.analyze(
            text=texte_brut,
            language='fr',
            entities=[
                "PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "URL",
                "CREDIT_CARD", "IBAN", "LOCATION", "NRP"
            ]
        )

        # Configuration des remplacements avec emojis
        operators_config = {
            "PERSON": OperatorConfig("replace", {"new_value": " [👤 NOM] "}),
            "PHONE_NUMBER": OperatorConfig("replace", {"new_value": " [📞 TÉL] "}),
            "EMAIL_ADDRESS": OperatorConfig("replace", {"new_value": " [📧 EMAIL] "}),
            "URL": OperatorConfig("replace", {"new_value": " [🔗 LIEN] "}),
            "CREDIT_CARD": OperatorConfig("replace", {"new_value": " [💳 CB] "}),
            "IBAN": OperatorConfig("replace", {"new_value": " [🏦 IBAN] "}),
            "LOCATION": OperatorConfig("replace", {"new_value": " [📍 LIEU] "}),
            "NRP": OperatorConfig("replace", {"new_value": " [⚖️ SENSIBLE] "}),
            "DEFAULT": OperatorConfig("replace", {"new_value": " [🔒 DONNÉE] "}),
        }

        resultat_anonymise = anonymizer.anonymize(
            text=texte_brut,
            analyzer_results=resultats_analyse,
            operators=operators_config
        )

        return resultat_anonymise.text
    
    except Exception as e:
        logger.error(f"❌ Erreur anonymisation: {e}")
        return texte_brut

# ============================================================
# ENDPOINTS D'ANONYMISATION
# ============================================================

@app.post(
    "/clean-text",
    response_model=AnonymizationResponse,
    tags=["🔒 Anonymization"],
    summary="Anonymiser un texte",
    description="Nettoie un texte en anonymisant les données sensibles"
)
async def clean_text_endpoint(input_data: TextRequest):
    """
    🔒 Anonymise les données sensibles dans un texte
    
    - **text**: Texte à nettoyer
    
    Returns:
        Texte original et texte nettoyé avec statistiques
    """
    try:
        import time
        start = time.time()
        
        if not PRESIDIO_AVAILABLE:
            return JSONResponse(
                status_code=503,
                content={
                    "error": "Service d'anonymisation non disponible",
                    "detail": "Presidio n'est pas installé"
                }
            )
        
        cleaned_text = anonymiser_texte(input_data.text)
        processing_time = (time.time() - start) * 1000
        
        # Compter les entités trouvées
        entities_found = cleaned_text.count("[")
        
        return {
            "original": input_data.text,
            "cleaned": cleaned_text,
            "entities_found": entities_found,
            "processing_time_ms": round(processing_time, 2)
        }
    
    except Exception as e:
        logger.error(f"❌ Erreur clean-text: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post(
    "/clean-file",
    tags=["🔒 Anonymization"],
    summary="Anonymiser un fichier CSV",
    description="Nettoie toutes les colonnes d'un fichier CSV"
)
async def clean_file_endpoint(file: UploadFile = File(...)):
    """
    📁 Anonymise un fichier CSV complet
    
    - **file**: Fichier CSV à nettoyer
    
    Returns:
        Preview des données originales et nettoyées
    """
    try:
        if not PRESIDIO_AVAILABLE:
            return JSONResponse(
                status_code=503,
                content={
                    "error": "Service d'anonymisation non disponible",
                    "detail": "Presidio n'est pas installé"
                }
            )
        
        contents = await file.read()
        
        # Décodage avec fallback
        try:
            string_content = contents.decode('utf-8')
        except UnicodeDecodeError:
            string_content = contents.decode('latin-1')

        df = pd.read_csv(io.StringIO(string_content))
        preview_original = df.head(10).fillna("").to_dict(orient='records')

        # Fonction pour nettoyer chaque cellule
        def clean_cell(cell_value):
            if isinstance(cell_value, str):
                return anonymiser_texte(cell_value)
            return cell_value

        # Appliquer sur tout le DataFrame
        df_cleaned = df.applymap(clean_cell)
        preview_cleaned = df_cleaned.head(10).fillna("").to_dict(orient='records')

        return {
            "filename": file.filename,
            "total_rows": len(df),
            "columns": list(df.columns),
            "preview_original": preview_original,
            "preview_cleaned": preview_cleaned,
            "message": "✅ Fichier nettoyé avec succès"
        }
    
    except Exception as e:
        logger.error(f"❌ Erreur clean-file: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

# ============================================================
# INCLUSION DES ROUTERS
# ============================================================

# Router global (root + health)
app.include_router(global_router)

# Services spécialisés
app.include_router(hallucination_router)
app.include_router(complexity_router)
app.include_router(detoxify_router)

# ============================================================
# LANCEMENT
# ============================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )