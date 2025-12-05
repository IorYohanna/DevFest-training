from services.detoxify_service import DetoxifyService
from schemas.responses import (
    ToxicityAnalysis,
    BatchAnalysisResponse,
    FilterResponse,
    BatchFilterResponse,
    StatsResponse,
    HealthResponse
)
from typing import List


class DetoxifyController:
    def __init__(self):
        self.service = DetoxifyService()

    def analyze_text(self, text: str, threshold: float = 0.5) -> ToxicityAnalysis:
        """Analyse un texte unique"""
        scores = self.service.predict_toxicity(text)
        max_category, max_score = self.service.get_max_category(scores)
        is_toxic = self.service.is_toxic(scores, threshold)

        self.service.increment_stats(is_toxic)

        return ToxicityAnalysis(
            text=text,
            is_toxic=is_toxic,
            scores={k: float(v) for k, v in scores.items()},
            max_toxicity=float(max_score),
            category=max_category,
            recommendation="BLOCK" if is_toxic else "ALLOW"
        )

    def analyze_batch(self, texts: List[str], threshold: float = 0.5) -> BatchAnalysisResponse:
        """Analyse plusieurs textes"""
        results = []
        for text in texts:
            result = self.analyze_text(text, threshold)
            results.append(result)

        toxic_count = sum(1 for r in results if r.is_toxic)
        safe_count = len(texts) - toxic_count

        return BatchAnalysisResponse(
            total_analyzed=len(texts),
            toxic_count=toxic_count,
            safe_count=safe_count,
            results=results
        )

    def filter_text(self, text: str, threshold: float = 0.5) -> FilterResponse:
        """Filtre un texte basé sur le seuil"""
        scores = self.service.predict_toxicity(text)
        is_toxic = self.service.is_toxic(scores, threshold)
        is_safe = not is_toxic

        message = "✅ Texte sûr pour l'entraînement" if is_safe else "🚫 Texte toxique - BLOQUÉ"

        return FilterResponse(
            original_text=text,
            is_safe=is_safe,
            filtered=is_toxic,
            scores={k: float(v) for k, v in scores.items()},
            message=message
        )

    def filter_batch(self, texts: List[str], threshold: float = 0.5) -> BatchFilterResponse:
        """Filtre plusieurs textes"""
        results = []
        safe_texts = []

        for text in texts:
            result = self.filter_text(text, threshold)
            results.append(result)
            if result.is_safe:
                safe_texts.append(text)

        return BatchFilterResponse(
            total_submitted=len(texts),
            safe_texts_count=len(safe_texts),
            blocked_count=len(texts) - len(safe_texts),
            safe_texts=safe_texts,
            detailed_results=results
        )

    def get_statistics(self) -> StatsResponse:
        """Retourne les statistiques"""
        stats = self.service.get_stats()
        return StatsResponse(**stats)

    def health_check(self) -> HealthResponse:
        """Vérifie la santé du service"""
        return HealthResponse(
            status="healthy",
            model="detoxify-original"
        )