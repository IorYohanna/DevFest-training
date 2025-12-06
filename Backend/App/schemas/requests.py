from pydantic import BaseModel, Field
from typing import List

class TextAnalysisRequest(BaseModel):
    text: str = Field(..., description="Le texte à analyser", min_length=1)
    threshold: float = Field(default=0.5, ge=0.0, le=1.0, description="Seuil de toxicité (0-1)")

class BatchAnalysisRequest(BaseModel):
    texts: List[str] = Field(..., description="Liste de textes à analyser", min_items=1)
    threshold: float = Field(default=0.5, ge=0.0, le=1.0, description="Seuil de toxicité (0-1)")