from services.Embedding_service import read_embedding
from services.Chunk_service import read_chunk
from services.ChatService import update_title_chat, read_chat
from Exception.ChatException import CreateTitleError, UpdateTiltleChatError, ReadChatError
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os
import uuid
from typing import List, Dict, Any, Tuple

# --- Configuration et Clients ---
load_dotenv()

# Assurez-vous que cette ligne est correcte pour votre configuration
client = AsyncOpenAI(api_key=os.getenv("API_KEY"))

# --- Prompts et Instructions (Inchangés) ---
prompt = """
You are an expert assistant.
Respond to all the question using all and only the data given bellow.
Strictly follow the instructions below when answering questions.
"""

instruction = """
Instruction for using the provided documents and metadata

1. Data usage (RAG)
- Only use the data explicitly provided in the input (Datas RAG). Do not consult or invent any external information.
- Use more information from items with higher contextual relevance and less from lower-ranked items.

2. Data presence check
- If the topic of the question does not match the content of the provided data, respond in the same language as the question:
  "The submitted documents do not contain information about (the topic) mentioned in the question."Say it the way in the following exemples.
  Ex: The submitted documnets do not contain information about Batman.
- Do not fabricate, guess, or infer answers when the needed information is absent.


3. Input structure
- Each input item contains: { content, meta_data }
- Use `content` to answer the question.
- Use `meta_data` for source identification (document name and page/chunk index).
- Only include relevant content and sources.

4. References and source listing
- List all sources used at the bottom of the response.
- Don’t repeat sources and provide only the document name.
- Mention only the documents and concerned pages if given.
- Use the format: Document: [document name]
- Include only pages/paragraphs actually relevant to your answer.
- If no sources are relevant, do not add a "Sources" section.

5. Structure of the output
5.1 Tables
- Use Markdown table format if a table is needed:
    ```
    | Column 1 | Column 2 | Column 3 |
    |----------|----------|----------|
    | Value1   | Value2   | Value3   |
    ```
- Include only relevant rows and columns.

6. Response format and quality
- Structure answers professionally, like a short technical document.
- Provide step-by-step explanations when helpful.
- Avoid raw, unstructured text dumps.

7. Behavior and tone
- Answer only the question asked.
- Respond in the same language as the question.
- Use a professional tone; avoid emojis and personal comments.

8. Safety and accuracy
- If the provided data is ambiguous or incomplete, state it and cite only relevant parts.
- Never invent facts or attribute unsupported claims to the sources.

"""

# --- NOUVELLES INSTRUCTIONS POUR LA FUSION HYBRIDE ET L'ANTI-HALLUCINATION ---

hybrid_instruction = """
Instruction pour la Fusion (RAG + Connaissance Interne LLM) et le Contrôle des Risques :

1. Base de Vérité (RAG): Utilisez en priorité les "Datas RAG" pour les faits centraux et les définitions.
2. **Stratégie Anti-Hallucination (Optimale) :**
    * **Si les "Datas RAG" sont VIDES :** La réponse doit être générée UNIQUEMENT par la "Connaissance Interne du LLM". Dans ce cas, vous devez doubler la vérification des faits : répondez de manière concise, factuelle, et **limitez-vous aux informations les plus consensuelles** pour minimiser le risque d'erreur ou d'hallucination.
    * **Si les "Datas RAG" sont PRÉSENTES :** L'algorithme standard s'applique.
3. Enrichissement (LLM): Utilisez le "Contenu Connaissance Interne" pour ajouter des détails ou un contexte plus large qui ne contredisent PAS les "Datas RAG".
4. Contrôle des Conflits: Si le Contenu Connaissance Interne contredit les Datas RAG, ignorez le Contenu Connaissance Interne.
5. Sources: Si la Connaissance Interne du LLM est utilisée, ajoutez 'Connaissance Générale du LLM' dans la liste des sources en plus des sources RAG.
"""

# --- FONCTIONS DE BASE ---

async def chunk_embedding(question: str) -> list[float]:
    """
    Generate an embedding vector for a given question using OpenAI's embeddings API.
    """
    try:
        json_response = await client.embeddings.create(model="text-embedding-3-small", input=question)
        vector = json_response.data[0].embedding
        return vector
    except Exception:
        raise


async def llm_general_knowledge_search(question: str) -> str:
    """
    Utilise les connaissances internes du LLM comme source d'enrichissement général.
    """
    llm_prompt = f"Répondez de manière factuelle et courte à la question '{question}', en utilisant uniquement vos connaissances générales."
    
    try:
        response = await client.responses.create(
            model="gpt-5",
            input=llm_prompt            
        )
        return response.output_text
    
    except Exception as e:
        print(f"Erreur lors de l'appel LLM pour la connaissance générale : {e}")
        return "Échec de l'accès à la connaissance générale du LLM."

# --- FONCTION DE GÉNÉRATION HYBRIDE (Anciennement generating_response) ---

async def generating_response_hybrid(question: str, chat_id: uuid.UUID) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Generate a response using RAG as the base truth, or falling back to LLM knowledge 
    with anti-hallucination control if no chunks are retrieved.
    """
    try:
        rag_data = []
        rag_sources_list = []

        # --- Étape 1 : Recherche RAG (Base de Vérité) ---
        
        # Le premier appel au LLM pour le sujet a été retiré, nous utilisons la question directement.
        question_vector = await chunk_embedding(question)
        
        embedding_list = await read_embedding(question_vector, chat_id)
        embedding_ids = [embedding.document_chunk_id for embedding in embedding_list]
        chunks = await read_chunk(embedding_ids)

        for chunk in chunks:
            rag_data.append({
                "content": chunk.chunk_content,
                "meta_data": chunk.meta_data
            })
            
            file_name = chunk.meta_data.get("file_name")

            source_entry = {"sources": file_name, "content": chunk.chunk_content}
            if file_name and source_entry not in rag_sources_list:
                rag_sources_list.append(source_entry)

        # --- Étape 2 : Connaissance Interne LLM (Enrichissement/Fallback) ---

        llm_knowledge_results = await llm_general_knowledge_search(question)

        llm_knowledge_data = {
            "source": "Connaissance Interne LLM",
            "content": llm_knowledge_results
        }
        
        # --- Étape 3 : Synthèse Augmentée par le LLM (Fusion et Contrôle) ---

        # Détermination du statut RAG pour l'instruction de l'algorithme anti-hallucination
        rag_status_message = "Chunks récupérés (Base de Vérité RAG disponible)."
        if not rag_data:
            # Condition de FALLBACK
            rag_status_message = "AUCUN CHUNK RAG RÉCUPÉRÉ. UTILISEZ UNIQUEMENT LA CONNAISSANCE INTERNE DU LLM AVEC L'ALGORITHME ANTI-HALLUCINATION."


        input_text = (
            prompt + "\n"
            + f"Datas RAG (Base de Vérité) : {rag_data}\n"
            + f"Contenu Connaissance Interne (Détails Contextuels) : {llm_knowledge_data}\n"
            + f"Statut RAG : {rag_status_message}\n"
            + f"Instructions : {instruction}\n"
            + f"Instructions Fusion : {hybrid_instruction}\n"
            + f"Question : {question}"
        )

        # Appel du LLM pour la fusion
        response = await client.responses.create(
            model="gpt-5",
            input=input_text
        )

        return response.output_text, rag_sources_list

    except Exception as e:
        raise Exception(f"Error during the hybrid response generation process: {e}")

# --- FONCTIONS ANNEXES (Inchangées) ---

async def create_title_chat(question: str, chat_id: uuid.UUID):
    input_text = f"Create a clear title for a chat from the message between brackets: ({question})"
    try:
        chat = await read_chat(chat_id)
        if (chat.num_messages == 0):
            response = await client.responses.create(
                model="gpt-5",
                input=input_text
            )
            await update_title_chat(chat_id, response.output_text)

    except ReadChatError:
        raise

    except UpdateTiltleChatError:
        raise

    except Exception as e:
        raise CreateTitleError(f"Error during the generating title process/Original error:", e)