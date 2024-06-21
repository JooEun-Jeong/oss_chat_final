import logging
from fastapi import FastAPI, Request

from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi_login import LoginManager

from apscheduler.schedulers.background import BackgroundScheduler
from pytz import utc

from routes.configs.db_connection import SessionLocal ,engine
from routes.configs.db_models import Base

from routes.page_routers import create_page_router 
from routes.auth_routers import create_auth_router
from routes.chat_routers import create_chat_router
from routes.user_routers import create_user_router

###### PHASE 2: Feat Reserve Message ########
# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
##################    End   #################

app = FastAPI()
# Mount the static files directories
app.mount("/styles", StaticFiles(directory="../frontend/styles"), name="styles") #### PHASE 2: Refactpr architecture
app.mount("/utils", StaticFiles(directory="../frontend/utils"), name="utils") #### PHASE 2: Refactpr architecture
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")  #### PHASE 2: Upload Image

Base.metadata.create_all(bind=engine)

#############################################
###### PHASE 2: Feat Reserve Message ########
### 예약한 시간에 맞게 문자 보내는기능 추가 ####
#############################################
scheduler = BackgroundScheduler(timezone=utc)
scheduler.start()
##################    End   #################
###### PHASE 2: Feat Reserve Message ########
#############################################

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
user_router = create_user_router(manager, get_db, scheduler) ###### PHASE 2: Feat Reserve Message ########

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
