from fastapi import APIRouter, HTTPException, status
from models.schemas import (
    PredictionRequest, 
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    ErrorResponse
)
import logging

logger = logging.getLogger(__name__)

def create_prediction_router(prediction_service: PredictionService) -> APIRouter:
    """Crée le router pour les prédictions"""
    
    router = APIRouter(prefix="/predict", tags=["Predictions"])
    
    @router.post(
        "/",
        response_model=PredictionResponse,
        status_code=status.HTTP_200_OK,
        summary="Prédire la complexité d'un texte",
        description="Analyse un texte et retourne sa complexité (simple, medium, complex)"
    )
    async def predict(request: PredictionRequest):
        """Endpoint pour prédire un seul texte"""
        try:
            result = prediction_service.predict_single(
                text=request.text,
                show_probabilities=request.show_probabilities,
                show_logits=request.show_logits
            )
            return result
            
        except Exception as e:
            logger.error(f"Erreur prediction: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
    
    @router.post(
        "/batch",
        response_model=BatchPredictionResponse,
        status_code=status.HTTP_200_OK,
        summary="Prédire plusieurs textes",
        description="Analyse plusieurs textes en une seule requête"
    )
    async def predict_batch(request: BatchPredictionRequest):
        """Endpoint pour prédire plusieurs textes"""
        try:
            if len(request.texts) > 100:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Maximum 100 textes par requête"
                )
            
            result = prediction_service.predict_batch(
                texts=request.texts,
                show_probabilities=request.show_probabilities
            )
            return result
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur batch prediction: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
    
    @router.post(
        "/statistics",
        summary="Statistiques sur un batch",
        description="Retourne des statistiques sur la distribution des complexités"
    )
    async def get_statistics(request: BatchPredictionRequest):
        """Endpoint pour obtenir des statistiques"""
        try:
            result = prediction_service.get_statistics(request.texts)
            return result
            
        except Exception as e:
            logger.error(f"Erreur statistiques: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
    
    return router