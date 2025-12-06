from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
import spacy
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

# --- 1. CONFIGURATION DE L'APPLICATION ---
app = FastAPI(
    title="Detoxify API",
    description="API de nettoyage de données pour Safe AI",
    version="1.0.0"
)

# Configuration CORS (Indispensable pour React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Autorise tout le monde (React, Postman...)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. CONFIGURATION DU MOTEUR D'IA (PRESIDIO) ---
# On charge les moteurs une seule fois au démarrage
try:
    # Essaie de charger le modèle Large, sinon Fallback sur le Small
    # Assure-toi d'avoir fait: python -m spacy download en_core_web_lg
    analyzer = AnalyzerEngine() 
    anonymizer = AnonymizerEngine()
    print("✅ Moteur IA chargé avec succès.")
except Exception as e:
    print(f"⚠️ Erreur chargement IA: {e}")

# --- 3. FONCTION UTILITAIRE DE NETTOYAGE ---
def anonymiser_texte(texte_brut):
    """
    Fonction centrale qui prend un texte et renvoie le texte propre + stats.
    """
    if not isinstance(texte_brut, str) or len(texte_brut) < 2:
        return texte_brut, []

    # A. Détection
    # On analyse en anglais ('en') car le modèle est plus performant
    results = analyzer.analyze(
        text=texte_brut, 
        language='en',
        entities=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "URL", "CREDIT_CARD", "IBAN"]
    )

    # B. Anonymisation (Remplacement)
    anonymized_result = anonymizer.anonymize(
        text=texte_brut,
        analyzer_results=results,
        operators={
            "PERSON": OperatorConfig("replace", {"new_value": "<PERSON>"}),
            "PHONE_NUMBER": OperatorConfig("replace", {"new_value": "<PHONE>"}),
            "EMAIL_ADDRESS": OperatorConfig("replace", {"new_value": "<EMAIL>"}),
            "DEFAULT": OperatorConfig("replace", {"new_value": "<SENSITIVE>"}),
        }
    )

    # C. Création des statistiques pour le Front
    stats = []
    for item in results:
        stats.append({
            "type": item.entity_type,
            "score": round(item.score, 2),
            "start": item.start,
            "end": item.end
        })

    return anonymized_result.text, stats

# --- 4. MODÈLES DE DONNÉES (PYDANTIC) ---
class TextRequest(BaseModel):
    text: str

# --- 5. ENDPOINTS (ROUTES) ---

@app.get("/")
def root():
    return {"status": "Online", "message": "SafeAI API is running 🚀"}

@app.post("/clean")
def clean_text_endpoint(request: TextRequest):
    """
    Endpoint pour nettoyer du texte brut (Envoyé par React 'Input Zone')
    """
    clean_text, stats = anonymiser_texte(request.text)
    
    return {
        "original": request.text,
        "cleaned": clean_text,
        "detections": stats
    }

@app.post("/clean-file")
async def clean_file_endpoint(file: UploadFile = File(...)):
    """
    Endpoint pour nettoyer un fichier CSV complet
    """
    try:
        # 1. Lire le fichier
        contents = await file.read()
        # Conversion en DataFrame Pandas
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Copie pour "Avant"
        preview_original = df.head(10).fillna("").to_dict(orient='records')

        # 2. Nettoyer (Fonction appliquée sur chaque cellule)
        def clean_cell(cell_value):
            if isinstance(cell_value, str):
                # On récupère juste le texte, pas les stats ici
                clean, _ = anonymiser_texte(cell_value)
                return clean
            return cell_value

        # On applique sur tout le tableau (ça peut prendre quelques secondes)
        df_cleaned = df.applymap(clean_cell)
        
        # Copie pour "Après"
        preview_cleaned = df_cleaned.head(10).fillna("").to_dict(orient='records')

        return {
            "filename": file.filename,
            "total_rows": len(df),
            "columns": list(df.columns),
            "preview_original": preview_original,
            "preview_cleaned": preview_cleaned
        }
    except Exception as e:
        return {"error": str(e)}

# --- 6. LANCEMENT ---
if __name__ == "__main__":
    import uvicorn
    # Lance le serveur sur le port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)