from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel # <--- NOUVEAU : Nécessaire pour recevoir du texte JSON
import pandas as pd
import io
import spacy
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

# --- 1. CONFIGURATION DE L'APP & CORS ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. CONFIGURATION DU MOTEUR NLP ---
try:
    import en_core_web_lg
    nlp_engine = en_core_web_lg.load()
    print("✅ Modèle Large (en_core_web_lg) chargé avec succès.")
except ImportError:
    print("⚠️ Modèle Large non trouvé, utilisation du modèle standard.")

analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()

# --- 3. MODELE DE DONNÉES POUR LE TEXTE (### NOUVEAU ###) ---
class TextInput(BaseModel):
    text: str

# --- 4. FONCTION D'ANONYMISATION ---
def anonymiser_texte(texte_brut):
    if not isinstance(texte_brut, str) or len(texte_brut) < 2:
        return texte_brut

    # A. DÉTECTION
    resultats_analyse = analyzer.analyze(
        text=texte_brut,
        language='en',
        entities=[
            "PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "URL",
            "CREDIT_CARD", "IBAN", "LOCATION", "DATE_TIME", "NRP"
        ]
    )

    # B. REMPLACEMENT VISUEL
    operators_config = {
        "PERSON": OperatorConfig("replace", {"new_value": " [👤 NOM] "}),
        "PHONE_NUMBER": OperatorConfig("replace", {"new_value": " [📞 TÉL] "}),
        "EMAIL_ADDRESS": OperatorConfig("replace", {"new_value": " [📧 EMAIL] "}),
        "URL": OperatorConfig("replace", {"new_value": " [🔗 LIEN] "}),
        "CREDIT_CARD": OperatorConfig("replace", {"new_value": " [💳 CB] "}),
        "IBAN": OperatorConfig("replace", {"new_value": " [🏦 IBAN] "}),
        "LOCATION": OperatorConfig("replace", {"new_value": " [📍 LIEU] "}),
        "DATE_TIME": OperatorConfig("replace", {"new_value": " [📅 DATE] "}),
        "NRP": OperatorConfig("replace", {"new_value": " [⚖️ SENSIBLE] "}),
        "DEFAULT": OperatorConfig("replace", {"new_value": " [🔒 DONNÉE] "}),
    }

    resultat_anonymise = anonymizer.anonymize(
        text=texte_brut,
        analyzer_results=resultats_analyse,
        operators=operators_config
    )

    return resultat_anonymise.text

