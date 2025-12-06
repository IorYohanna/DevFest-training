from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import uvicorn

app = FastAPI()

html = """ 
<!DOCTYPE html>
<html>
<head>
    <title>Chat Messenger</title>
    <style>
        body { font-family: Arial; background: #f0f2f5; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }
        .chat-container { width:400px; height:600px; border-radius:10px; background:white; display:flex; flex-direction:column; box-shadow:0 2px 10px rgba(0,0,0,0.2); }
        .chat-header { padding:15px; background:#0084ff; color:white; font-weight:bold; border-top-left-radius:10px; border-top-right-radius:10px; }
        .online-count { font-size:14px; margin-top:5px; }
        .chat-messages { flex:1; padding:15px; overflow-y:auto; border-bottom:1px solid #ddd; }
        .message { margin-bottom:10px; padding:10px; border-radius:8px; background:#f1f0f0; }
        .chat-input { display:flex; padding:10px; gap:5px; }
        .chat-input input[type="text"] { flex:1; padding:10px; border-radius:20px; border:1px solid #ccc; outline:none; }
        .chat-input button { padding:10px 20px; border-radius:20px; border:none; background:#0084ff; color:white; cursor:pointer; }
        .chat-input button:hover { background:#005bb5; }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            Messenger Chat
            <p class="online-count" id="onlineCount">Utilisateurs en ligne: 0</p>
        </div>
        <div class="chat-messages" id="messages"></div>
        <div class="chat-input">
            <input type="text" id="messageText" placeholder="Écrire un message..." />
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>

    <script>
        var ws = new WebSocket("ws://localhost:8000/ws");

        ws.onmessage = function(event) {
            const data = JSON.parse(event.data);
            const messages = document.getElementById("messages");

            if(data.type === "message") {
                const message = document.createElement("div");
                message.className = "message";
                message.textContent = data.data;
                messages.appendChild(message);
                messages.scrollTop = messages.scrollHeight;
            } else if(data.type === "status") {
                document.getElementById("onlineCount").textContent = "Utilisateurs en ligne: " + data.data;
            }
        };

        function sendMessage() {
            var input = document.getElementById("messageText");
            if(input.value.trim() === "") return;
            ws.send(input.value);
            input.value = "";
        }
    </script>
</body>
</html>
"""

class WebsocketConnexion:
    """Gestion des connexions WebSocket pour le chat."""
    active_connexion: list[WebSocket] = []

    def __init__(self, websocket: WebSocket):
        self.websocket = websocket

    async def connect(self):
        """Accepte la connexion et ajoute le client à la liste."""
        await self.websocket.accept()
        WebsocketConnexion.active_connexion.append(self.websocket)
        await WebsocketConnexion.broadcast_status()  # Mettre à jour immédiatement le compteur

    def disconnect(self):
        """Supprime le client de la liste des connexions actives."""
        if self.websocket in WebsocketConnexion.active_connexion:
            WebsocketConnexion.active_connexion.remove(self.websocket)

    async def recieve_message(self) -> str:
        """Reçoit un message du client."""
        return await self.websocket.receive_text()

    @classmethod
    async def broadcast_status(cls):
        """Envoie à tous les clients le nombre de connexions actives."""
        data = {"type": "status", "data": len(cls.active_connexion)}
        for ws in cls.active_connexion:
            await ws.send_json(data)

    @classmethod
    async def broadcast_message(cls, message: str):
        """Diffuse un message à tous les clients connectés."""
        data = {"type": "message", "data": message}
        for ws in cls.active_connexion:
            await ws.send_json(data)


@app.get("/")
async def get():
    return HTMLResponse(html)


@app.websocket("/ws")
async def message_managing(websocket: WebSocket):
    connexion = WebsocketConnexion(websocket)
    try:
        await connexion.connect()
        while True:
            data = await connexion.recieve_message()
            await WebsocketConnexion.broadcast_message(data)
    except WebSocketDisconnect:
        connexion.disconnect()
        await WebsocketConnexion.broadcast_status()  # Mettre à jour le compteur après déconnexion


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
