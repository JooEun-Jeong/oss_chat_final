################################
##### PHASE 2: Refactor API ####
## API 목적에 맞게 라우터로 분리 #
################################
from fastapi import APIRouter, Depends, Response, Request
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_login.exceptions import InvalidCredentialsException
from .configs.db_connection import SessionLocal
from routes.configs.db_models import User
from sqlalchemy.orm import Session

# Auth와 관련된 라우터
def create_auth_router(manager):
    router = APIRouter()

    @router.post('/token')
    def login(response: Response, data: OAuth2PasswordRequestForm = Depends()):
        username = data.username
        password = data.password

        user = get_user(username)
        if not user:
            raise InvalidCredentialsException
        if user.password != password:
            raise InvalidCredentialsException
        access_token = manager.create_access_token(
            data={'sub': username}
        )
        manager.set_cookie(response, access_token)
        return {'access_token': access_token}

    @manager.user_loader()
    def get_user(username: str, db: Session = None):
        if not db:
            with SessionLocal() as db:
                return db.query(User).filter(User.name == username).first()
        return db.query(User).filter(User.name == username).first()

    @router.get("/logout")
    def logout(response: Response):
        response = RedirectResponse("/login", status_code=302)
        response.delete_cookie(key="access-token")
        return response

    return router
