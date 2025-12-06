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

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Vérifie que le service fonctionne"""
    try:
        return controller.health_check()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Service non disponible: {str(e)}")
    
