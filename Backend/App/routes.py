"""
Routes unifiées pour SafeAI API
Inclut: Detoxify, Hallucination Detection, Complexity Classification
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# ============================================================
# IMPORT CONDITIONNEL DES SERVICES
# ============================================================

# Detoxify (optionnel)
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
    logger.info("✅ Module Detoxify disponible")
except ImportError:
    DETOXIFY_AVAILABLE = False
    logger.warning("⚠️ Module Detoxify non disponible")

# Hallucination Detection (toujours disponible)
try:
    from services.hallucination_service import analyze_hallucination, detector
    HALLUCINATION_AVAILABLE = True
    logger.info("✅ Service Hallucination disponible")
except ImportError:
    HALLUCINATION_AVAILABLE = False
    logger.error("❌ Service Hallucination non disponible")

# Complexity Classification (optionnel)
try:
    from services.complexity_service import ComplexityService
    COMPLEXITY_AVAILABLE = True
    logger.info("✅ Service Complexity disponible")
except ImportError:
    COMPLEXITY_AVAILABLE = False
    logger.warning("⚠️ Service Complexity non disponible")

# ============================================================
# MODÈLES PYDANTIC COMMUNS
# ============================================================

class ServiceStatus(BaseModel):
    """Status d'un service"""
    available: bool
    status: str
    message: Optional[str] = None

class GlobalHealthResponse(BaseModel):
    """Health check global de tous les services"""
    api_status: str
    timestamp: datetime = Field(default_factory=datetime.now)
    services: Dict[str, ServiceStatus]

# ============================================================
# ROUTER GLOBAL (Root + Health)
# ============================================================

global_router = APIRouter(tags=["Global"])

@global_router.get("/")
async def root():
    """
    🏠 Point d'entrée de l'API
    """
    return {
        "name": "SafeAI API",
        "version": "2.0.0",
        "description": "API unifiée pour le nettoyage et l'analyse de données",
        "features": {
            "detoxify": "✅ Analyse de toxicité" if DETOXIFY_AVAILABLE else "❌ Non disponible",
            "hallucination": "✅ Détection d'hallucinations" if HALLUCINATION_AVAILABLE else "❌ Non disponible",
            "complexity": "✅ Classification de complexité" if COMPLEXITY_AVAILABLE else "❌ Non disponible",
            "anonymization": "✅ Anonymisation de données"
        },
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc"
        },
        "health_check": "/health"
    }

@global_router.get("/health", response_model=GlobalHealthResponse)
async def global_health_check():
    """
    ❤️ Health check complet de tous les services
    """
    services_status = {}
    
    # Check Detoxify
    if DETOXIFY_AVAILABLE:
        try:
            controller = DetoxifyController()
            health = controller.health_check()
            services_status["detoxify"] = ServiceStatus(
                available=True,
                status="healthy",
                message="Service opérationnel"
            )
        except Exception as e:
            services_status["detoxify"] = ServiceStatus(
                available=True,
                status="degraded",
                message=f"Erreur: {str(e)}"
            )
    else:
        services_status["detoxify"] = ServiceStatus(
            available=False,
            status="unavailable",
            message="Module non installé"
        )
    
    # Check Hallucination
    if HALLUCINATION_AVAILABLE:
        try:
            services_status["hallucination"] = ServiceStatus(
                available=True,
                status="healthy",
                message="Service opérationnel"
            )
        except Exception as e:
            services_status["hallucination"] = ServiceStatus(
                available=True,
                status="degraded",
                message=f"Erreur: {str(e)}"
            )
    else:
        services_status["hallucination"] = ServiceStatus(
            available=False,
            status="unavailable",
            message="Service non disponible"
        )
    
    # Check Complexity
    if COMPLEXITY_AVAILABLE:
        try:
            service = ComplexityService()
            is_loaded = service.is_model_loaded()
            services_status["complexity"] = ServiceStatus(
                available=True,
                status="healthy" if is_loaded else "degraded",
                message="Modèle chargé" if is_loaded else "Modèle non chargé"
            )
        except Exception as e:
            services_status["complexity"] = ServiceStatus(
                available=True,
                status="degraded",
                message=f"Erreur: {str(e)}"
            )
    else:
        services_status["complexity"] = ServiceStatus(
            available=False,
            status="unavailable",
            message="Service non installé"
        )
    
    # Status global
    all_healthy = all(
        s.status == "healthy" 
        for s in services_status.values() 
        if s.available
    )
    
    return GlobalHealthResponse(
        api_status="healthy" if all_healthy else "degraded",
        services=services_status
    )

# ============================================================
# ROUTER 1: HALLUCINATION DETECTION
# ============================================================

hallucination_router = APIRouter(
    prefix="/api/v1/hallucination",
    tags=["🔍 Hallucination Detection"]
)

class HallucinationRequest(BaseModel):
    """Requête pour détecter les hallucinations"""
    prompt: str = Field(..., min_length=10, max_length=10000)
    
    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "La pénicilline a été découverte par Alexander Fleming en 1899."
            }
        }

class HallucinationResponse(BaseModel):
    """Réponse de détection d'hallucination"""
    original_prompt: str
    is_hallucination: bool
    confidence_score: float
    corrected_text: Optional[str] = None
    sources: Optional[List[str]] = None
    analysis: Dict[str, Any]
    processing_time_ms: float
    timestamp: datetime = Field(default_factory=datetime.now)

if HALLUCINATION_AVAILABLE:
    
    @hallucination_router.post(
        "/detect",
        response_model=HallucinationResponse,
        summary="Détecter les hallucinations",
        description="Analyse un texte pour détecter les hallucinations factuelles"
    )
    async def detect_hallucination(request: HallucinationRequest):
        """
        🔍 Détecte les hallucinations dans un prompt
        
        - **prompt**: Texte à analyser (10-10000 caractères)
        
        Returns:
            Analyse complète avec détection, correction et sources
        """
        try:
            import time
            start = time.time()
            
            result = await analyze_hallucination(request.prompt)
            processing_time = (time.time() - start) * 1000
            
            return {
                "original_prompt": request.prompt,
                "is_hallucination": result.get("is_hallucination", False),
                "confidence_score": result.get("confidence_score", 0.0),
                "corrected_text": result.get("corrected_text"),
                "sources": result.get("sources", []),
                "analysis": result,
                "processing_time_ms": round(processing_time, 2),
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur détection hallucination: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur lors de l'analyse: {str(e)}"
            )
    
    @hallucination_router.get(
        "/stats",
        summary="Statistiques du service",
        description="Obtient les statistiques d'utilisation"
    )
    async def get_hallucination_stats():
        """📊 Statistiques d'utilisation"""
        try:
            stats = detector.get_statistics()
            return {
                "statistics": stats,
                "timestamp": datetime.now()
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur: {str(e)}"
            )

else:
    @hallucination_router.get("/unavailable")
    async def hallucination_unavailable():
        """Service non disponible"""
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Le service de détection d'hallucinations n'est pas disponible"
        )

# ============================================================
# ROUTER 2: COMPLEXITY CLASSIFICATION
# ============================================================

complexity_router = APIRouter(
    prefix="/api/v1/complexity",
    tags=["🧠 Complexity Classification"]
)

class ComplexityRequest(BaseModel):
    """Requête de classification de complexité"""
    text: str = Field(..., min_length=1, max_length=5000)
    show_probabilities: bool = Field(False, description="Afficher les probabilités")
    show_logits: bool = Field(False, description="Afficher les logits bruts")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Explique comment fonctionne le machine learning",
                "show_probabilities": True
            }
        }

class BatchComplexityRequest(BaseModel):
    """Requête batch"""
    texts: List[str] = Field(..., min_length=1, max_length=100)
    show_probabilities: bool = False
    
    class Config:
        json_schema_extra = {
            "example": {
                "texts": [
                    "Quelle est la capitale de la France?",
                    "Explique le deep learning",
                    "Crée une application complète avec Django"
                ]
            }
        }

class ComplexityResponse(BaseModel):
    """Réponse de classification"""
    text: str
    predicted_class: str = Field(..., description="simple, medium ou complex")
    confidence: float = Field(..., ge=0.0, le=1.0)
    probabilities: Optional[Dict[str, float]] = None
    logits: Optional[Dict[str, float]] = None
    processing_time_ms: float
    timestamp: datetime = Field(default_factory=datetime.now)

class BatchComplexityResponse(BaseModel):
    """Réponse batch"""
    predictions: List[ComplexityResponse]
    total_count: int
    average_confidence: float
    class_distribution: Dict[str, int]
    total_processing_time_ms: float
    timestamp: datetime = Field(default_factory=datetime.now)

if COMPLEXITY_AVAILABLE:
    
    _complexity_service = None
    
    def get_complexity_service() -> ComplexityService:
        """Singleton du service de complexité"""
        global _complexity_service
        if _complexity_service is None:
            _complexity_service = ComplexityService()
        return _complexity_service
    
    @complexity_router.post(
        "/predict",
        response_model=ComplexityResponse,
        summary="Classifier la complexité",
        description="Analyse un texte et retourne sa complexité (simple/medium/complex)"
    )
    async def predict_complexity(request: ComplexityRequest):
        """
        🧠 Classifie la complexité d'un texte
        
        - **text**: Texte à analyser
        - **show_probabilities**: Afficher les probabilités de chaque classe
        - **show_logits**: Afficher les logits du modèle
        
        Returns:
            Classification avec confiance et métriques
        """
        try:
            service = get_complexity_service()
            result = service.predict_single(
                text=request.text,
                show_probabilities=request.show_probabilities,
                show_logits=request.show_logits
            )
            return result
            
        except RuntimeError as e:
            logger.error(f"❌ Erreur modèle: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(e)
            )
        except Exception as e:
            logger.error(f"❌ Erreur prédiction: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur: {str(e)}"
            )
    
    @complexity_router.post(
        "/predict/batch",
        response_model=BatchComplexityResponse,
        summary="Classifier plusieurs textes",
        description="Analyse plusieurs textes (max 100)"
    )
    async def predict_batch_complexity(request: BatchComplexityRequest):
        """
        📊 Classification batch avec statistiques
        
        - **texts**: Liste de textes (max 100)
        - **show_probabilities**: Afficher les probabilités
        """
        try:
            if len(request.texts) > 100:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Maximum 100 textes par requête"
                )
            
            service = get_complexity_service()
            result = service.predict_batch(
                texts=request.texts,
                show_probabilities=request.show_probabilities
            )
            
            # Calculer les statistiques
            predictions = result["predictions"]
            class_counts = {"simple": 0, "medium": 0, "complex": 0}
            total_confidence = 0
            
            for pred in predictions:
                class_counts[pred["predicted_class"]] += 1
                total_confidence += pred["confidence"]
            
            return {
                "predictions": predictions,
                "total_count": result["total_count"],
                "average_confidence": total_confidence / len(predictions),
                "class_distribution": class_counts,
                "total_processing_time_ms": result["total_processing_time_ms"]
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Erreur batch: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur: {str(e)}"
            )
    
    @complexity_router.post(
        "/statistics",
        summary="Statistiques sur un batch",
        description="Analyse statistique d'un ensemble de textes"
    )
    async def get_statistics(request: BatchComplexityRequest):
        """📈 Analyse statistique complète"""
        try:
            service = get_complexity_service()
            stats = service.get_statistics(request.texts)
            return stats
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur: {str(e)}"
            )
    
    @complexity_router.get(
        "/model/info",
        summary="Informations sur le modèle"
    )
    async def get_model_info():
        """ℹ️ Informations sur le modèle ALBERT"""
        try:
            service = get_complexity_service()
            return service.get_model_info()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

else:
    @complexity_router.get("/unavailable")
    async def complexity_unavailable():
        """Service non disponible"""
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Le service de classification de complexité n'est pas disponible. "
                   "Vérifiez que le modèle ALBERT est installé dans ./albert_complexity_model/"
        )

# ============================================================
# ROUTER 3: DETOXIFY
# ============================================================

if DETOXIFY_AVAILABLE:
    detoxify_router = APIRouter(
        prefix="/api/v1/detoxify",
        tags=["🛡️ Detoxify"]
    )
    
    _detoxify_controller = None
    
    def get_detoxify_controller() -> DetoxifyController:
        """Singleton du controller Detoxify"""
        global _detoxify_controller
        if _detoxify_controller is None:
            _detoxify_controller = DetoxifyController()
        return _detoxify_controller
    
    @detoxify_router.post(
        "/analyze",
        response_model=ToxicityAnalysis,
        summary="Analyser la toxicité",
        description="Analyse un texte pour détecter la toxicité"
    )
    async def analyze_text(request: TextAnalysisRequest):
        """🛡️ Analyse de toxicité"""
        try:
            controller = get_detoxify_controller()
            return controller.analyze_text(request.text, request.threshold)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur: {str(e)}"
            )
    
    @detoxify_router.post(
        "/analyze/batch",
        response_model=BatchAnalysisResponse,
        summary="Analyse batch"
    )
    async def analyze_batch(request: BatchAnalysisRequest):
        """📊 Analyse batch de toxicité"""
        try:
            controller = get_detoxify_controller()
            return controller.analyze_batch(request.texts, request.threshold)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur: {str(e)}"
            )
    
    @detoxify_router.post(
        "/filter",
        response_model=FilterResponse,
        summary="Filtrer un texte"
    )
    async def filter_text(request: TextAnalysisRequest):
        """🔒 Filtre les textes toxiques"""
        try:
            controller = get_detoxify_controller()
            return controller.filter_text(request.text, request.threshold)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur: {str(e)}"
            )
    
    @detoxify_router.get(
        "/stats",
        response_model=StatsResponse,
        summary="Statistiques"
    )
    async def get_detoxify_stats():
        """📈 Statistiques d'utilisation"""
        try:
            controller = get_detoxify_controller()
            return controller.get_statistics()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur: {str(e)}"
            )

else:
    detoxify_router = APIRouter(
        prefix="/api/v1/detoxify",
        tags=["🛡️ Detoxify (Unavailable)"]
    )
    
    @detoxify_router.get("/unavailable")
    async def detoxify_unavailable():
        """Service non disponible"""
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Le service Detoxify n'est pas disponible. "
                   "Installez les dépendances: pip install detoxify"
        )

# ============================================================
# EXPORT DES ROUTERS
# ============================================================

# Pour compatibilité avec l'ancien code
router = detoxify_router if DETOXIFY_AVAILABLE else APIRouter()

__all__ = [
    "global_router",
    "hallucination_router",
    "complexity_router",
    "detoxify_router",
    "router"  # Pour rétrocompatibilité
]