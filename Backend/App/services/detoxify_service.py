from detoxify import Detoxify
from typing import List, Dict


class DetoxifyService:
    def __init__(self):
        self.model = Detoxify('original')
        self.stats = {
            "total_requests": 0,
            "toxic_detected": 0,
            "safe_texts": 0
        }

    def predict_toxicity(self, text: str) -> Dict[str, float]:
        """Prédit les scores de toxicité pour un texte"""
        return self.model.predict(text)

    def is_toxic(self, scores: Dict[str, float], threshold: float = 0.5) -> bool:
        """Détermine si un texte est toxique basé sur le seuil"""
        max_score = max(scores.values())
        return max_score >= threshold

    def get_max_category(self, scores: Dict[str, float]) -> tuple:
        """Retourne la catégorie avec le score maximum"""
        max_category = max(scores, key=scores.get)
        max_score = scores[max_category]
        return max_category, max_score

    def increment_stats(self, is_toxic: bool):
        """Incrémente les statistiques"""
        self.stats["total_requests"] += 1
        if is_toxic:
            self.stats["toxic_detected"] += 1
        else:
            self.stats["safe_texts"] += 1

    def get_stats(self) -> Dict:
        """Retourne les statistiques"""
        toxicity_rate = 0
        if self.stats["total_requests"] > 0:
            toxicity_rate = (self.stats["toxic_detected"] / self.stats["total_requests"]) * 100

        return {
            **self.stats,
            "toxicity_rate": round(toxicity_rate, 2)
        }