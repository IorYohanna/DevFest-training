from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
import spacy
from presidio_analyzer import AnalyzerEngine
from presidio_analyzer.nlp_engine import NlpEngineProvider # Important pour le français
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

from routes import hallucination_router , router
from routes.routes import router
from routes.ChatRoute import chat_route

app = FastAPI(
    title="Detoxify API",
    description="API de nettoyage de données pour Safe AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hallucination_router)
app.include_router(router)

# --- 1. CONFIGURATION DU MOTEUR NLP (FRANÇAIS) ---
try:
    import fr_core_news_lg
    print("✅ Modèle Spacy Français détecté.")
    
    # On configure Presidio pour utiliser le modèle Français
    configuration = {
        "nlp_engine_name": "spacy",
        "models": [{"lang_code": "fr", "model_name": "fr_core_news_lg"}]
    }
    
    provider = NlpEngineProvider(nlp_configuration=configuration)
    nlp_engine_with_french = provider.create_engine()
    
    # On force la langue 'fr'
    analyzer = AnalyzerEngine(nlp_engine=nlp_engine_with_french, supported_languages=["fr"])
    print("✅ Presidio configuré en FRANÇAIS (Emojis activés).")

except ImportError:
    print("⚠️ ERREUR : Modèle 'fr_core_news_lg' introuvable.")
    print("👉 Fais: python -m spacy download fr_core_news_lg")
    analyzer = AnalyzerEngine() # Fallback anglais

anonymizer = AnonymizerEngine()

class TextRequest(BaseModel):
    text: str

# --- 2. FONCTION D'ANONYMISATION (VERSION EMOJIS) ---
def anonymiser_texte(texte_brut):
    """
    Prend un texte et renvoie UNIQUEMENT le texte nettoyé (String).
    """
    if not isinstance(texte_brut, str) or len(texte_brut) < 2:
        return texte_brut

    # Analyse en Français
    resultats_analyse = analyzer.analyze(
        text=texte_brut, 
        language='fr',
        entities=[
            "PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "URL", 
            "CREDIT_CARD", "IBAN", "LOCATION", "NRP"
        ]
    )

    # Configuration des Emojis
    operators_config = {
        "PERSON": OperatorConfig("replace", {"new_value": " [👤 NOM] "}),
        "PHONE_NUMBER": OperatorConfig("replace", {"new_value": " [📞 TÉL] "}),
        "EMAIL_ADDRESS": OperatorConfig("replace", {"new_value": " [📧 EMAIL] "}),
        "URL": OperatorConfig("replace", {"new_value": " [🔗 LIEN] "}),
        "CREDIT_CARD": OperatorConfig("replace", {"new_value": " [💳 CB] "}),
        "IBAN": OperatorConfig("replace", {"new_value": " [🏦 IBAN] "}),
        "LOCATION": OperatorConfig("replace", {"new_value": " [📍 LIEU] "}),
        "NRP": OperatorConfig("replace", {"new_value": " [⚖️ SENSIBLE] "}),
        "DEFAULT": OperatorConfig("replace", {"new_value": " [🔒 DONNÉE] "}),
    }

    resultat_anonymise = anonymizer.anonymize(
        text=texte_brut,
        analyzer_results=resultats_analyse,
        operators=operators_config
    )

    # IMPORTANT : On ne renvoie QUE le texte pour simplifier le CSV et le Front
    # Le Front React calcule les stats tout seul en comptant les emojis.
    return resultat_anonymise.text

# --- 3. ENDPOINTS ---
app.include_router(chat_route)

@app.get("/")
def root():
    return {"status": "Online", "message": "SafeAI API is running 🚀"}

@app.post("/clean-text")
async def clean_text_endpoint(input_data: TextRequest):
    try:
        # On récupère juste le texte nettoyé
        cleaned_text = anonymiser_texte(input_data.text)
        
        return {
            "original": input_data.text,
            "cleaned": cleaned_text 
            # Plus besoin de renvoyer 'stats' ici, le Front React s'en charge
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/clean-file")
async def clean_file_endpoint(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        try:
            string_content = contents.decode('utf-8')
        except UnicodeDecodeError:
            string_content = contents.decode('latin-1')

        df = pd.read_csv(io.StringIO(string_content)) 
        preview_original = df.head(10).fillna("").to_dict(orient='records')

        # Fonction wrapper pour appliquer sur chaque cellule
        def clean_cell(cell_value):
            if isinstance(cell_value, str):
                return anonymiser_texte(cell_value)
            return cell_value

        # Appliquer sur tout le tableau
        df_cleaned = df.applymap(clean_cell)
        
        preview_cleaned = df_cleaned.head(10).fillna("").to_dict(orient='records')

        return {
            "filename": file.filename,
            "total_rows": len(df),
            "columns": list(df.columns),
            "preview_original": preview_original,
            "preview_cleaned": preview_cleaned
        }
    except Exception as e:
        print(f"Erreur: {str(e)}")
        return {"error": str(e)}

# --- 4. LANCEMENT ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)