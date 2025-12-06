from llama_index.core.node_parser import TokenTextSplitter, SentenceSplitter
from llama_index.core import Document
from Models.DocumentChunkModel import DocumentChunkModel
from schemas.DocumentChunkSchema import ChunkCreate, ChunkRead
from schemas.DocumentSchema import DocumentRead
from Exception.IngestionException import ChunkingError, SaveChunkError
from Exception.ChunkException import ReadChunkError
from database import AsyncSessionLocal
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
import uuid
import re

token_splitter = TokenTextSplitter(chunk_size=750, chunk_overlap=75)
sentence_splitter = SentenceSplitter(chunk_size=1000)

#__________CRUD___________ 

async def create_chunk(chunk_input: ChunkCreate) -> ChunkRead :
    """
    Creates and saves a document chunk in the database.

    Args:
        chunk_input (ChunkCreate): The chunk data to save.

    Returns:
        ChunkRead: The saved chunk as a read schema.

    Raises:
        SaveChunkError: If saving the chunk fails.
    """
    try :
        async with AsyncSessionLocal() as session : #start communication with the db
            async with session.begin() : #start the conversation
                new_chunk = DocumentChunkModel(
                    document_id=chunk_input.document_id,
                    chunk_index=chunk_input.chunk_index,
                    chunk_content=chunk_input.chunk_content,
                    meta_data=chunk_input.meta_data
                )
                session.add(new_chunk)
                await session.flush() #save the operation without commit so that we get the id
                chunk_output = ChunkRead.from_orm(new_chunk)
        return chunk_output
    except SQLAlchemyError as e :
        raise SaveChunkError(f"Failed to save the chunk. Original error: {e}") from e
    except ValidationError as e :
        raise SaveChunkError(f"Failed to save the chunk: {e}") from e


async def read_chunk(chunk_ids : list[uuid.UUID]) -> list[ChunkRead] :
    """
    Reads chunks from the database by a list of IDs.

    Args:
        chunk_ids (list[uuid.UUID]): List of chunk IDs to retrieve.

    Returns:
        list[ChunkRead]: List of retrieved chunks.

    Raises:
        ReadChunkError: If reading the chunks fails.
    """
    try:
        async with AsyncSessionLocal() as session : #start communication with the db
            async with session.begin() : #start the conversation
                stmt = select(DocumentChunkModel).where(DocumentChunkModel.id.in_(chunk_ids))
                response = await session.execute(stmt)
                chunk_list = response.scalars().all()
                return [
                    ChunkRead.from_orm(chunk) for chunk in chunk_list #change the chunk_list from the db as a list of ChunkRead
                ]
    except Exception as e :
        raise  ReadChunkError(f"Failed to read chunks : Cause : {e}")


#___________other function_____________

def clean_text(text) :
    """
    Cleans a text string by removing extra whitespace.

    Args:
        text (str): The input text.

    Returns:
        str: The cleaned text.
    """
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def get_page_number(char_position: int, page_map: dict) -> int:
    """
    Determines the page number for a given character position in the text.
    
    Args:
        char_position (int): Character position in the full document text.
        page_map (dict): Dictionary mapping page numbers to (start, end) character positions.
    
    Returns:
        int: Page number where the character position is located.
    """
    for page_num, (start, end) in page_map.items():
        if start <= char_position < end:
            return page_num
    
    # If not found, return last page
    return max(page_map.keys()) if page_map else 1


def get_chunk_page_range(chunk_text: str, full_text: str, page_map: dict) -> tuple[int, int]:
    """
    Finds the page range (start_page, end_page) for a chunk of text.
    Uses a more robust fuzzy matching approach.
    """
    if not page_map:
        return (1, 1)
    
    # Utiliser les 50 premiers et 50 derniers caractères pour identifier le chunk
    chunk_start_sample = ' '.join(chunk_text[:200].split())
    chunk_end_sample = ' '.join(chunk_text[-200:].split())
    
    full_text_normalized = ' '.join(full_text.split())
    
    # Trouver la position de début
    start_idx = full_text_normalized.find(chunk_start_sample[:100])
    
    if start_idx == -1:
        return (1, 1)
    
    # Trouver la position de fin en cherchant depuis le début trouvé
    end_search_start = start_idx + len(chunk_start_sample)
    if len(chunk_text) > 400:  # Si le chunk est long
        end_idx = full_text_normalized.find(chunk_end_sample[-100:], end_search_start)
        if end_idx != -1:
            end_idx += 100  # Ajouter la longueur du sample
        else:
            end_idx = start_idx + len(' '.join(chunk_text.split()))
    else:
        end_idx = start_idx + len(' '.join(chunk_text.split()))
    
    # Convertir les positions dans le texte normalisé en positions dans le texte original
    # Approximation : ratio de positions
    ratio = len(full_text) / max(len(full_text_normalized), 1)
    real_start = int(start_idx * ratio)
    real_end = int(end_idx * ratio)
    
    start_page = get_page_number(real_start, page_map)
    end_page = get_page_number(real_end, page_map)
    
    return (start_page, end_page)


def chunking(document: DocumentRead) -> DocumentRead :
    """
    Splits a document into chunks based on sentences, tokens, and element types.
    Now adds page number metadata to each chunk.

    Args:
        document (DocumentRead): The document to chunk.

    Returns:
        DocumentRead: The document with a 'chunks' attribute containing all generated chunks.

    Raises:
        ChunkingError: If chunking fails due to validation or type errors.
    """
    document.chunks = [] #Extra attribute for the document
    
    # Extract page_map from document metadata
    page_map = document.meta_data.get("page_map", {})
    # Convert string keys to integers if necessary
    if page_map and isinstance(list(page_map.keys())[0], str):
        page_map = {int(k): v for k, v in page_map.items()}
    
    full_text = document.text
    
    doc = Document( #Get the data and change its class from DocumentRead to Document
        text=document.text,
        metadata=document.meta_data
    )
    nodes = sentence_splitter.get_nodes_from_documents([doc]) #Split the doc as a list of (title, table, paragraph, and so on)
    i = 0
    chunk_index = 0 #rank of the nodes in the doc
    
    try :
        while i < len(nodes) :
            node = nodes[i]
            element_type = node.metadata.get('element_type', "").lower() #Get the node's type

            if element_type == "image": #if image, ignore
                i += 1
                continue

            # Prepare chunk content
            chunk_content = ""

            if element_type == "table" : #if table, get the table as a chunk
                chunk_content = clean_text(node.text)

            elif element_type == "title":
                # Check the next node, if it exists
                if i + 1 < len(nodes):
                    next_node = nodes[i + 1]
                    next_type = next_node.metadata.get('element_type', "").lower()

                    # If the next one is another title → skip for now
                    if next_type == "title":
                        i += 1
                        continue

                    # Otherwise, merge the title with the next node's text
                    chunk_content = clean_text(node.text + "\n" + next_node.text)
                    i += 1
                else:
                    # If it's the last element, take the title alone
                    chunk_content = clean_text(node.text)

            else :
                if len(node.text.split()) > 200 : #split the node as a list of subnodes
                    sub_nodes = token_splitter.split_text(node.text)
                    for sub_node in sub_nodes :
                        # Calculate page range for this sub-chunk
                        start_page, end_page = get_chunk_page_range(sub_node, full_text, page_map)
                        
                        chunk_metadata = dict(node.metadata)
                        chunk_metadata["page_start"] = start_page
                        chunk_metadata["page_end"] = end_page
                        
                        chunk = ChunkCreate(
                            document_id=document.id,
                            chunk_index=chunk_index,
                            chunk_content=sub_node, 
                            meta_data=chunk_metadata
                        )
                        chunk_index += 1
                        document.chunks.append(chunk)
                    
                    i += 1
                    continue
                else : #take it as its own chunk
                    chunk_content = clean_text(node.text)

            # Calculate page range for the chunk
            start_page, end_page = get_chunk_page_range(chunk_content, full_text, page_map)
            
            # Add page information to metadata
            chunk_metadata = dict(node.metadata)
            chunk_metadata["page_start"] = start_page
            chunk_metadata["page_end"] = end_page
            
            chunk = ChunkCreate(
                document_id=document.id,
                chunk_index=chunk_index,
                chunk_content=chunk_content,
                meta_data=chunk_metadata
            )
            chunk_index += 1
            document.chunks.append(chunk)
            
            i += 1
            
        return document
        
    except (ValidationError, SyntaxError, TypeError) as e :
        raise ChunkingError(f"Chunking failed for document {document.id}: {e}")