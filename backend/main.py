from fastapi import FastAPI, Request

from fastapi.responses import RedirectResponse
from fastapi_login import LoginManager

from routes.configs.db_connection import SessionLocal ,engine
from routes.configs.db_models import Base

from routes.page_routers import create_page_router 
from routes.auth_routers import create_auth_router
from routes.chat_routers import create_chat_router
from routes.user_routers import create_user_router

app = FastAPI()

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class NotAuthenticatedException(Exception):
    pass

SECRET = "oss"

manager = LoginManager(SECRET, '/login', use_cookie=True, not_authenticated_exception=NotAuthenticatedException)

##########################################
###### PHASE 2: Refactor API #############
### API마다 목적에 맞게 라우터로 파일 분리 ##
### API 관리에 용이하게 하기 위함. #########
##########################################

page_router = create_page_router(manager, get_db)
auth_router = create_auth_router(manager)
chat_router = create_chat_router(get_db)
user_router = create_user_router(manager, get_db)

app.include_router(page_router)
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(user_router)

@app.exception_handler(NotAuthenticatedException)
def auth_exception_handler(request: Request, exc: NotAuthenticatedException):
    return RedirectResponse('/login')

##########################################
##########################################


def run():
    import uvicorn
    uvicorn.run(app, host='0.0.0.0')

if __name__ == "__main__":
    run()
