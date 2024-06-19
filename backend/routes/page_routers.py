################################
##### PHASE 2: Refactor API ####
## API 목적에 맞게 라우터로 분리 #
################################
from fastapi import APIRouter, Depends, Response
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
from routes.configs.db_connection import SessionLocal
from .configs.db_models import User

frontend_path = "../../frontend/pages/"  # Path to HTML files

# html pages로 redirect하는 라우터
def create_page_router(manager, get_db):
    router = APIRouter()

    # 로그인 상태 시 친구 목록 창으로 redirect
    @router.get("/")
    def get_root():
        return RedirectResponse(url='/friends')

    frontend_path = "../frontend/pages/" ## PHASE 2

    @router.get("/friends")
    def get_friends(user=Depends(manager), db: Session = Depends(get_db)):
        if db.query(User).filter(User.name == user.name).first() is None:
            response = RedirectResponse("/login", status_code = 302)
            response.delete_cookie(key = "access-token")
            return response
        return FileResponse(frontend_path + "friends.html") # PHASE 2

    @router.get("/login")
    def get_login():
        return FileResponse(frontend_path + "login.html") # PHASE 2

    # 채팅방 목록으로 이동
    @router.get("/chatlist")
    def get_chatlist():
        return FileResponse(frontend_path + "chatlist.html") # PHASE 2

    @router.get("/chatting/{friend}")
    def chat_start(friend: str, db: Session = Depends(get_db)):
        return FileResponse(frontend_path + "chatting.html") # PHASE 2
    
    return router