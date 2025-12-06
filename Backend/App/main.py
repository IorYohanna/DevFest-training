from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io

# Import des routes AVANT la création de l'app
from routes import hallucination_router, router

# --- 1. CONFIGURATION DE L'APPLICATION ---
app = FastAPI(
    title="Safe AI API",
    description="API de nettoyage de données et détection d'hallucinations",
    version="2.0.0"
)

# Configuration CORS (Indispensable pour React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Autorise tout le monde (React, Postman...)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. INCLUSION DES ROUTERS ---
app.include_router(hallucination_router)  # Routes hallucination
app.include_router(router)  # Routes detoxify

# --- 3. CONFIGURATION DU MOTEUR D'IA (PRESIDIO) - Optionnel ---
try:
    from presidio_analyzer import AnalyzerEngine
    from presidio_anonymizer import AnonymizerEngine
    from presidio_anonymizer.entities import OperatorConfig
    
    analyzer = AnalyzerEngine() 
    anonymizer = AnonymizerEngine()
    print("✅ Moteur Presidio chargé avec succès.")
except ImportError:
    print("⚠️ Presidio non installé (normal si pas utilisé)")
    analyzer = None
    anonymizer = None
except Exception as e:
    print(f"⚠️ Erreur chargement Presidio: {e}")
    analyzer = None
    anonymizer = None

# --- 4. FONCTION UTILITAIRE DE NETTOYAGE ---
def anonymiser_texte(texte_brut):
    """
    Fonction centrale qui prend un texte et renvoie le texte propre + stats.
    """
    if analyzer is None or anonymizer is None:
        return texte_brut, []
    
    if not isinstance(texte_brut, str) or len(texte_brut) < 2:
        return texte_brut, []

    # A. Détection
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

# --- 5. MODÈLES DE DONNÉES (PYDANTIC) ---
class TextRequest(BaseModel):
    text: str

# --- 6. ENDPOINTS PRINCIPAUX ---

@app.get("/")
def root():
    """Route principale"""
    return {
        "status": "Online", 
        "message": "Safe AI API is running 🚀",
        "services": {
            "hallucination_detection": "✅ Active",
            "detoxify": "✅ Active",
            "anonymization": "✅ Active" if analyzer else "❌ Inactive"
        },
        "docs": "/docs"
    }

@app.post("/clean")
def clean_text_endpoint(request: TextRequest):
    """
    Endpoint pour nettoyer du texte brut (Envoyé par React 'Input Zone')
    """
    if analyzer is None:
        return {
            "error": "Service d'anonymisation non disponible. Installez presidio."
        }
    
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
    if analyzer is None:
        return {
            "error": "Service d'anonymisation non disponible. Installez presidio."
        }
    
    try:
        # 1. Lire le fichier
        contents = await file.read()
        
        # Gérer différents encodages
        try:
            text_content = contents.decode('utf-8')
        except UnicodeDecodeError:
            text_content = contents.decode('latin-1')
        
        df = pd.read_csv(io.StringIO(text_content))
        
        # Copie pour "Avant"
        preview_original = df.head(10).fillna("").to_dict(orient='records')

        # 2. Nettoyer (Fonction appliquée sur chaque cellule)
        def clean_cell(cell_value):
            if isinstance(cell_value, str):
                clean, _ = anonymiser_texte(cell_value)
                return clean
            return cell_value

        # On applique sur tout le tableau
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

# --- 7. LANCEMENT ---
if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Démarrage du serveur Safe AI...")
    print("📡 Swagger UI: http://localhost:8000/docs")
    print("🔍 Hallucination Detection: http://localhost:8000/api/v1/detect-hallucination")
    print("\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)