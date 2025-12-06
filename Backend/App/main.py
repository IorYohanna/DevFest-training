from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
import spacy
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

from routes import hallucination_router , router

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

try:
    analyzer = AnalyzerEngine() 
    anonymizer = AnonymizerEngine()
    print("✅ Moteur IA chargé avec succès.")
except Exception as e:
    print(f"⚠️ Erreur chargement IA: {e}")

def anonymiser_texte(texte_brut):
    """
    Fonction centrale qui prend un texte et renvoie le texte propre + stats.
    """
    if not isinstance(texte_brut, str) or len(texte_brut) < 2:
        return texte_brut, []
    results = analyzer.analyze(
        text=texte_brut, 
        language='en',
        entities=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "URL", "CREDIT_CARD", "IBAN"]
    )

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

    stats = []
    for item in results:
        stats.append({
            "type": item.entity_type,
            "score": round(item.score, 2),
            "start": item.start,
            "end": item.end
        })

    return anonymized_result.text, stats

class TextRequest(BaseModel):
    text: str


@app.get("/")
def root():
    return {"status": "Online", "message": "SafeAI API is running 🚀"}

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

        def clean_cell(cell_value):
            if isinstance(cell_value, str):
                return anonymiser_texte(cell_value)
            return cell_value

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

@app.post("/clean-text")
async def clean_text_endpoint(input_data: TextRequest):
    """
    Reçoit un JSON { "text": "..." } et renvoie le texte nettoyé.
    """
    try:
        cleaned_text, stats = anonymiser_texte(input_data.text)
        return {
            "original": input_data.text,
            "cleaned": cleaned_text,
            "stats": stats
        }
    except Exception as e:
        return {"error": str(e)}


# --- 7. LANCEMENT ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)