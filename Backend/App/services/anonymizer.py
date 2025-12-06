from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import spacy
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

# --- 1. CONFIGURATION DE L'APP & CORS ---
app = FastAPI()

# IMPORTANT : Autoriser React à parler au Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. CONFIGURATION DU MOTEUR NLP (Ton code) ---
try:
    # Essaye de charger le modèle Large (plus précis)
    import en_core_web_lg
    nlp_engine = en_core_web_lg.load()
    print("✅ Modèle Large (en_core_web_lg) chargé avec succès.")
except ImportError:
    print("⚠️ Modèle Large non trouvé, utilisation du modèle standard.")

# Initialisation des moteurs Presidio
analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()

# --- 3. TA FONCTION D'ANONYMISATION OPTIMISÉE ---
def anonymiser_texte(texte_brut):
    """
    Nettoie le texte en remplaçant les données sensibles par des TAGS VISUELS clairs.
    """
    if not isinstance(texte_brut, str) or len(texte_brut) < 2:
        return texte_brut, []

    # A. DÉTECTION
    resultats_analyse = analyzer.analyze(
        text=texte_brut,
        language='en',
        entities=[
            "PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "URL",
            "CREDIT_CARD", "IBAN", "LOCATION", "DATE_TIME", "NRP"
        ]
    )

    # B. REMPLACEMENT VISUEL (C'est ici que la magie opère pour le Front)
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

# --- 4. ENDPOINT POUR FICHIER CSV (Celui appelé par React) ---
@app.post("/clean-file")
async def clean_file_endpoint(file: UploadFile = File(...)):
    try:
        # 1. Lire le fichier CSV
        contents = await file.read()
        
        # --- CORRECTION ICI ---
        # On décode en ignorant les erreurs ou en essayant de forcer l'utf-8 proprement
        try:
            string_content = contents.decode('utf-8')
        except UnicodeDecodeError:
            # Si ça plante (ex: fichier venant d'un vieux Windows), on tente latin-1
            string_content = contents.decode('latin-1')

        df = pd.read_csv(io.StringIO(string_content)) 
        
        # Copie pour "Avant" (remplacer les vides par "")
        preview_original = df.head(10).fillna("").to_dict(orient='records')

        # 2. Appliquer TA fonction sur chaque cellule
        def clean_cell(cell_value):
            if isinstance(cell_value, str):
                # On appelle ta fonction optimisée
                return anonymiser_texte(cell_value)
            return cell_value

        # On applique sur tout le tableau
        df_cleaned = df.applymap(clean_cell)
        
        # Copie pour "Après"
        preview_cleaned = df_cleaned.head(10).fillna("").to_dict(orient='records')

        # 3. Renvoyer au React
        return {
            "filename": file.filename,
            "total_rows": len(df),
            "columns": list(df.columns),
            "preview_original": preview_original,
            "preview_cleaned": preview_cleaned # C'est ça qui contient les [👤 NOM]
        }
    except Exception as e:
        print(f"Erreur: {str(e)}")
        return {"error": str(e)}

# --- 5. LANCEMENT ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)