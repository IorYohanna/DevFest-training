import torch
import torch.nn as nn
from transformers import AlbertModel, AlbertTokenizer
from typing import Tuple
import logging

logger = logging.getLogger(__name__)

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

class ModelManager:
    """Gestionnaire du modèle ALBERT"""
    
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
        self._initialized = True
        
    def load_model(self, model_dir: str, device_name: str = "cuda"):
        """Charge le modèle et le tokenizer"""
        try:
            logger.info(f"Chargement du modèle depuis {model_dir}")
            
            # Device
            self.device = torch.device(device_name if torch.cuda.is_available() else "cpu")
            logger.info(f"Device utilisé: {self.device}")
            
            # Tokenizer
            self.tokenizer = AlbertTokenizer.from_pretrained(model_dir)
            
            # Modèle
            self.model = AlbertForComplexity()
            self.model.albert = AlbertModel.from_pretrained(model_dir)
            
            # Charger les poids du classifier si disponible
            try:
                self.model.classifier.load_state_dict(
                    torch.load(f"{model_dir}/classifier.pth", map_location=self.device)
                )
            except FileNotFoundError:
                logger.warning("classifier.pth non trouvé, utilisation des poids par défaut")
            
            self.model.to(self.device)
            self.model.eval()
            
            logger.info("✓ Modèle chargé avec succès")
            
        except Exception as e:
            logger.error(f"Erreur lors du chargement du modèle: {e}")
            raise
    
    def is_loaded(self) -> bool:
        """Vérifie si le modèle est chargé"""
        return self.model is not None and self.tokenizer is not None
    
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
            raise RuntimeError("Modèle non chargé")
        
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
