from transformers import AlbertTokenizer, AlbertForSequenceClassification
import torch

MODEL_NAME = r"D:\RANJA\ENI\DEVFEST\DevFest-training\Backend\App\AIModel\albert_complexity_model"

class ModelLoader:
    tokenizer = None
    classification_model = None

    @staticmethod
    def load_models():
        print("🔄 Chargement du tokenizer local...")
        ModelLoader.tokenizer = AlbertTokenizer.from_pretrained(MODEL_NAME)

        print("🔄 Chargement du modèle ALBERT local fine-tuné...")
        ModelLoader.classification_model = AlbertForSequenceClassification.from_pretrained(MODEL_NAME)

        print("✅ Modèle ALBERT local chargé !")

    @staticmethod
    def get_tokenizer():
        return ModelLoader.tokenizer

    @staticmethod
    def get_model():
        return ModelLoader.classification_model
