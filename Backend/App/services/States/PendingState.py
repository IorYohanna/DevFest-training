from services.Document_service import set_document_failed,set_chunked_document
from services.States.BaseStatesClasse import DocumentBaseStates
from services.States.ChunkedState import ChunkedState
from services.States.FailedState import FailedState

class PendingState(DocumentBaseStates) :
    def __init__(self,main):
        self.main = main

    async def involve(self,main) :
        main.prevstate = self
        main.state =  ChunkedState(main)
        await set_chunked_document(main.id)

    async def fail(self,main) :
        main.prevstate = self
        main.state = FailedState(main)
        await set_document_failed(main.id)

    def retry(self,main) :
        pass

