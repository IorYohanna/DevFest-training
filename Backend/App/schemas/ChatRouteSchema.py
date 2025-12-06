from schemas.ChatMessageSchema import MessageOutput
from schemas.ChatMessageSchema import MessageOutput
from schemas.ChatSchema import ChatOutput
from pydantic import BaseModel
from schemas.DocumentSchema import DocumentRead
from typing import List
import uuid

class IngestionOutput(BaseModel):
    status_code: int
    data: List[DocumentRead]
    message: str

class LoadConversationOutput(BaseModel):
    status_code : int
    data : List[MessageOutput]
    message : str

class MessageManagementOutput(BaseModel):
    status_code : int 
    id: uuid.UUID
    response : str|None
    message : str

class QuestionInput(BaseModel):
    message : str