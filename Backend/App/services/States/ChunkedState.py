from services.Document_service import (
    set_document_failed,
    set_ready_document,
    read_document_id
)
from Controller.EmbeddingController import batch_embedding_process
from services.States.BaseStatesClasse import DocumentBaseStates
from services.States.ReadyState import ReadyState
from services.States.FailedState import FailedState

class ChunkedState(DocumentBaseStates) :
    def __init__(self,main) :
        self.main = main

    async def involve(self,main) :
        main.prevstate = self
        main.state =  ReadyState(main)
        await set_ready_document(main.id)

    async def fail(self,main) :
        main.prevstate = self
        main.state = FailedState(main)
        await set_document_failed(main)

    async def retry(self,main) :
        try:
            doc = await read_document_id(main.id)
            await batch_embedding_process(doc.chunks)
        except Exception as e :
            raise e