# Backend/App/routes.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException,UploadFile,File
from controllers.detoxify_controller import DetoxifyController
from schemas.requests import TextAnalysisRequest, BatchAnalysisRequest
from schemas.responses import (
    ToxicityAnalysis,
    BatchAnalysisResponse,
    FilterResponse,
    BatchFilterResponse,
    StatsResponse,
    HealthResponse
)

# Import conditionnel pour Detoxify (si disponible)
try:
    from controllers.detoxify_controller import DetoxifyController
    from schemas.requests import TextAnalysisRequest, BatchAnalysisRequest
    from schemas.responses import (
        ToxicityAnalysis,
        BatchAnalysisResponse,
        FilterResponse,
        BatchFilterResponse,
        StatsResponse,
        HealthResponse as DetoxifyHealthResponse
    )
    DETOXIFY_AVAILABLE = True
except ImportError:
    DETOXIFY_AVAILABLE = False
    print("⚠️ Module Detoxify non disponible (normal si pas installé)")

# Import du service Hallucination (TOUJOURS disponible)
from services.hallucination_service import analyze_hallucination, detector

# ============================================
# ROUTER 1: HALLUCINATION DETECTION
# ============================================

hallucination_router = APIRouter(prefix="/api/v1", tags=["Hallucination Detection"])

# --- MODÈLES PYDANTIC ---
class HallucinationRequest(BaseModel):
    """Modèle pour la requête d'analyse d'hallucination"""
    prompt: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "La pénicilline a été découverte par Alexander Fleming en 1899."
            }
        }

class HallucinationHealthResponse(BaseModel):
    """Réponse du health check hallucination"""
    status: str
    service: str
    version: str

# --- ENDPOINTS HALLUCINATION ---

@hallucination_router.post("/detect-hallucination")
async def detect_hallucination_endpoint(request: HallucinationRequest):
    """
    🔍 Détecte les hallucinations dans un prompt
    
    Args:
        request: Contient le texte à analyser
        
    Returns:
        Analyse complète avec détection, correction et sources
    """
    try:
        if not request.prompt or len(request.prompt.strip()) < 10:
            raise HTTPException(
                status_code=400, 
                detail="Le prompt doit contenir au moins 10 caractères"
            )
        
        result = await analyze_hallucination(request.prompt)
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur endpoint hallucination: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Erreur lors de l'analyse: {str(e)}"
        )

@hallucination_router.get("/hallucination/stats")
async def get_hallucination_statistics():
    """
    📊 Obtient les statistiques d'utilisation du service de détection d'hallucinations
    
    Returns:
        Statistiques d'utilisation
    """
    try:
        stats = detector.get_statistics()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur de récupération des stats: {str(e)}"
        )

@hallucination_router.get("/hallucination/health", response_model=HallucinationHealthResponse)
async def hallucination_health_check():
    """
    ❤️ Vérifie que le service de détection d'hallucinations fonctionne
    
    Returns:
        Status du service
    """
    try:
        return {
            "status": "healthy",
            "service": "Hallucination Detection",
            "version": "2.0.0"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Service non disponible: {str(e)}"
        )

# ============================================
# ROUTER 2: DETOXIFY (Si disponible)
# ============================================

if DETOXIFY_AVAILABLE:
    router = APIRouter(prefix="/api/v1", tags=["Detoxify"])
    controller = DetoxifyController()

    @router.post("/analyze", response_model=ToxicityAnalysis)
    async def analyze_text(request: TextAnalysisRequest):
        """Analyse un texte pour détecter la toxicité"""
        try:
            return controller.analyze_text(request.text, request.threshold)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur d'analyse: {str(e)}")

    @router.post("/analyze/batch", response_model=BatchAnalysisResponse)
    async def analyze_batch(request: BatchAnalysisRequest):
        """Analyse plusieurs textes en batch"""
        try:
            return controller.analyze_batch(request.texts, request.threshold)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur d'analyse batch: {str(e)}")

    @router.post("/filter", response_model=FilterResponse)
    async def filter_text(request: TextAnalysisRequest):
        """Filtre un texte si toxique, sinon le retourne"""
        try:
            return controller.filter_text(request.text, request.threshold)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur de filtrage: {str(e)}")

    @router.post("/filter/batch", response_model=BatchFilterResponse)
    async def filter_batch(request: BatchAnalysisRequest):
        """Filtre une liste de textes"""
        try:
            return controller.filter_batch(request.texts, request.threshold)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur de filtrage batch: {str(e)}")

    @router.get("/stats", response_model=StatsResponse)
    async def get_stats():
        """Obtient les statistiques d'utilisation"""
        try:
            return controller.get_statistics()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur de récupération des stats: {str(e)}")

    @router.get("/health", response_model=DetoxifyHealthResponse)
    async def health_check():
        """Vérifie que le service fonctionne"""
        try:
            return controller.health_check()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Service non disponible: {str(e)}")
else:
    # Router vide si Detoxify n'est pas disponible
    router = APIRouter(prefix="/api/v1", tags=["Detoxify (Unavailable)"])
    
    @router.get("/detoxify/unavailable")
    async def detoxify_unavailable():
        """Informe que le service Detoxify n'est pas disponible"""
        return {
            "status": "unavailable",
            "message": "Le service Detoxify n'est pas installé. Installez les dépendances nécessaires."
        }
