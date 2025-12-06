# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.routes import router
from routes.ChatRoute import chat_route

app = FastAPI(
    title="Detoxify API - Safe AI for Mankind",
    description="API pour détecter et filtrer le contenu toxique avant l'entraînement des modèles IA",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(chat_route)

@app.get("/")
def root():
    return {
        "message": "Detoxify API - Safe AI for Mankind",
        "description": "Protégez l'humanité en filtrant les données toxiques avant l'entraînement des modèles IA"
    }

# Lancement serveur (si exécuté directement)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)