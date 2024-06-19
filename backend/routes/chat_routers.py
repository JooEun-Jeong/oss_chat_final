################################
##### PHASE 2: Refactor API ####
## API 목적에 맞게 라우터로 분리 #
################################
from fastapi import APIRouter, Depends, WebSocket
from sqlalchemy import or_
from sqlalchemy.orm import Session
from .configs.schema import HeaderSchema, ChatSchema, LastchatSchema
from .configs.db_models import Header
from .configs.socket_connection import ConnectionManager
from routes.db_crud import db_get_room, db_get_chatlist, db_add_chat

# Chat과 관련된 라우터
def create_chat_router(get_db):
    router = APIRouter()
    wsManager = ConnectionManager()

    @router.get("/getroom")
    def get_room(user1: str, user2: str, db: Session = Depends(get_db)):
        return db_get_room(db, user1, user2)

    @router.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket):
        await wsManager.connect(websocket)
        try:
            while True:
                data = await websocket.receive_text()
                await wsManager.broadcast(f"{data}")
        except Exception as e:
            pass
        finally:
            await wsManager.disconnect(websocket)

    @router.post("/makeroom")
    async def make_room(header: HeaderSchema, db: Session = Depends(get_db)):
        db_item = Header(from_id=header.from_id, to_id=header.to_id, last_chat=header.last_chat)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        print(db_item.id)
        return db_item.id

    @router.post("/updatelastchat")
    def update_room(header: LastchatSchema, db: Session = Depends(get_db)):
        db_item = db.query(Header).filter(Header.id == header.header_id).first()
        db_item.last_chat = header.last_chat
        db.commit()
        db.refresh(db_item)
        return True

    @router.get("/chat")
    def get_chat(header_id: int, db: Session = Depends(get_db)):
        return db_get_chatlist(db, header_id)

    @router.post("/chat")
    async def add_chat(chat: ChatSchema, db: Session = Depends(get_db)):
        return db_add_chat(db, chat)

    @router.get("/chatlists")
    def get_chatlists(user: str, db: Session = Depends(get_db)):
        return db.query(Header).filter(or_(Header.from_id == user, Header.to_id == user)).all()

    return router
