from fastapi import APIRouter
from schemas.nlp_schema import TextRequest
from controllers.nlp_controller import NLPController
from core.model_loader import ModelLoader

nlp_router = APIRouter(prefix="/nlp", tags=["🧠 NLP - Complexité"])

# Charger les modèles au démarrage
ModelLoader.load_models()

@nlp_router.post("/classify")
def classify_text(req: TextRequest):
    return NLPController.classify_text(req.text)
