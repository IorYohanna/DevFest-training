from pydantic import BaseModel
from typing import List, Dict

class ToxicityAnalysis(BaseModel):
    text: str
    is_toxic: bool
    scores: Dict[str, float]
    max_toxicity: float
    category: str
    recommendation: str

class BatchAnalysisResponse(BaseModel):
    total_analyzed: int
    toxic_count: int
    safe_count: int
    results: List[ToxicityAnalysis]

class FilterResponse(BaseModel):
    original_text: str
    is_safe: bool
    filtered: bool
    scores: Dict[str, float]
    message: str

class BatchFilterResponse(BaseModel):
    total_submitted: int
    safe_texts_count: int
    blocked_count: int
    safe_texts: List[str]
    detailed_results: List[FilterResponse]

class StatsResponse(BaseModel):
    total_requests: int
    toxic_detected: int
    safe_texts: int
    toxicity_rate: float

class HealthResponse(BaseModel):
    status: str
    model: str