"""
Service de classification de complexité avec ALBERT
"""

import torch
import torch.nn as nn
from transformers import AlbertModel, AlbertTokenizer
from typing import Dict, List, Tuple
import time
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# ============================================================
# MODÈLE ALBERT
# ============================================================

class AlbertForComplexity(nn.Module):
    """Modèle ALBERT pour classification de complexité"""
    
    def __init__(self, model_name: str = "albert-base-v2", num_classes: int = 3):
        super().__init__()
        self.albert = AlbertModel.from_pretrained(model_name)
        self.classifier = nn.Linear(768, num_classes)
        
    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        outputs = self.albert(input_ids=input_ids, attention_mask=attention_mask)
        cls_token = outputs.last_hidden_state[:, 0]
        return self.classifier(cls_token)

# ============================================================
# GESTIONNAIRE DE MODÈLE (SINGLETON)
# ============================================================

class ModelManager:
    """Gestionnaire singleton du modèle ALBERT"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        self.model = None
        self.tokenizer = None
        self.device = None
        self.label_map = {0: "simple", 1: "medium", 2: "complex"}
        self.model_dir = "./albert_complexity_model"
        self._initialized = True
        
        # Charger automatiquement le modèle
        self._load_model()
        
    def _load_model(self):
        """Charge le modèle et le tokenizer"""
        try:
            logger.info(f"🔄 Chargement du modèle depuis {self.model_dir}")
            
            # Vérifier que le dossier existe
            if not Path(self.model_dir).exists():
                logger.warning(f"⚠️ Dossier {self.model_dir} introuvable")
                logger.warning("Le service de complexité sera indisponible")
                return
            
            # Device
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            logger.info(f"📱 Device: {self.device}")
            
            # Tokenizer
            self.tokenizer = AlbertTokenizer.from_pretrained(self.model_dir)
            
            # Modèle
            self.model = AlbertForComplexity()
            self.model.albert = AlbertModel.from_pretrained(self.model_dir)
            
            # Charger les poids du classifier si disponible
            classifier_path = Path(self.model_dir) / "classifier.pth"
            if classifier_path.exists():
                self.model.classifier.load_state_dict(
                    torch.load(classifier_path, map_location=self.device)
                )
                logger.info("✅ Poids du classifier chargés")
            else:
                logger.warning("⚠️ classifier.pth non trouvé, utilisation des poids par défaut")
            
            self.model.to(self.device)
            self.model.eval()
            
            logger.info("✅ Modèle ALBERT chargé avec succès")
            
        except Exception as e:
            logger.error(f"❌ Erreur lors du chargement du modèle: {e}")
            self.model = None
            self.tokenizer = None
    
    def is_loaded(self) -> bool:
        """Vérifie si le modèle est chargé"""
        return self.model is not None and self.tokenizer is not None
    
    def get_device_name(self) -> str:
        """Retourne le nom du device"""
        if self.device is None:
            return "unknown"
        return str(self.device)
    
    def predict(
        self, 
        text: str, 
        max_length: int = 64
    ) -> Tuple[str, torch.Tensor, torch.Tensor]:
        """
        Prédit la complexité d'un texte
        
        Returns:
            (predicted_class, logits, probabilities)
        """
        if not self.is_loaded():
            raise RuntimeError("Modèle non chargé. Vérifiez que le dossier albert_complexity_model existe.")
        
        # Tokenization
        encoding = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            padding="max_length",
            max_length=max_length
        )
        
        input_ids = encoding["input_ids"].to(self.device)
        attention_mask = encoding["attention_mask"].to(self.device)
        
        # Prédiction
        with torch.no_grad():
            logits = self.model(input_ids, attention_mask)
            probabilities = torch.softmax(logits, dim=1)
            pred_class_idx = torch.argmax(probabilities, dim=1).item()
        
        predicted_class = self.label_map[pred_class_idx]
        
        return predicted_class, logits[0], probabilities[0]

# ============================================================
# SERVICE DE PRÉDICTION
# ============================================================

class ComplexityService:
    """Service pour les prédictions de complexité"""
    
    def __init__(self, max_length: int = 64):
        self.model_manager = ModelManager()
        self.max_length = max_length
        self.label_map = {0: "simple", 1: "medium", 2: "complex"}
    
    def is_model_loaded(self) -> bool:
        """Vérifie si le modèle est chargé"""
        return self.model_manager.is_loaded()
    
    def get_device_name(self) -> str:
        """Retourne le nom du device"""
        return self.model_manager.get_device_name()
    
    def get_model_info(self) -> Dict:
        """Retourne les informations sur le modèle"""
        return {
            "model_loaded": self.is_model_loaded(),
            "device": self.get_device_name(),
            "model_dir": self.model_manager.model_dir,
            "max_length": self.max_length,
            "classes": list(self.label_map.values())
        }
    
    def predict_single(
        self, 
        text: str, 
        show_probabilities: bool = False,
        show_logits: bool = False
    ) -> Dict:
        """Prédit la complexité d'un seul texte"""
        
        start_time = time.time()
        
        try:
            # Prédiction
            predicted_class, logits, probabilities = self.model_manager.predict(
                text, self.max_length
            )
            
            processing_time = (time.time() - start_time) * 1000  # en ms
            
            # Résultat de base
            result = {
                "text": text,
                "predicted_class": predicted_class,
                "confidence": float(probabilities.max()),
                "processing_time_ms": round(processing_time, 2)
            }
            
            # Probabilités optionnelles
            if show_probabilities:
                result["probabilities"] = {
                    label: float(probabilities[i])
                    for i, label in self.label_map.items()
                }
            
            # Logits optionnels
            if show_logits:
                result["logits"] = {
                    label: float(logits[i])
                    for i, label in self.label_map.items()
                }
            
            logger.info(f"✅ Prédiction: {predicted_class} pour '{text[:50]}...'")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de la prédiction: {e}")
            raise
    
    def predict_batch(
        self, 
        texts: List[str],
        show_probabilities: bool = False
    ) -> Dict:
        """Prédit la complexité de plusieurs textes"""
        
        start_time = time.time()
        
        try:
            predictions = []
            
            for text in texts:
                pred = self.predict_single(text, show_probabilities, False)
                predictions.append(pred)
            
            total_time = (time.time() - start_time) * 1000
            
            result = {
                "predictions": predictions,
                "total_count": len(predictions),
                "total_processing_time_ms": round(total_time, 2)
            }
            
            logger.info(f"✅ Batch: {len(texts)} textes traités en {total_time:.2f}ms")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de la prédiction batch: {e}")
            raise
    
    def get_statistics(self, texts: List[str]) -> Dict:
        """Retourne des statistiques sur un batch de textes"""
        
        predictions = self.predict_batch(texts, show_probabilities=True)
        
        # Compter les classes
        class_counts = {"simple": 0, "medium": 0, "complex": 0}
        avg_confidence = 0
        
        for pred in predictions["predictions"]:
            class_counts[pred["predicted_class"]] += 1
            avg_confidence += pred["confidence"]
        
        avg_confidence /= len(texts) if texts else 1
        
        return {
            "total_texts": len(texts),
            "class_distribution": class_counts,
            "average_confidence": round(avg_confidence, 4),
            "processing_time_ms": predictions["total_processing_time_ms"]
        }

# ============================================================
# FONCTION UTILITAIRE POUR LE MAIN
# ============================================================

def get_model_status() -> str:
    """Retourne le statut du modèle pour le health check"""
    try:
        service = ComplexityService()
        if service.is_model_loaded():
            return "✅ Loaded"
        else:
            return "⚠️ Not loaded"
    except Exception as e:
        return f"❌ Error: {str(e)}"