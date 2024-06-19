################################
##### PHASE 2: Refactor API ####
## API 목적에 맞게 라우터로 분리 #
################################
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from routes.configs.schema import UserSchema, FriendSchema
from routes.db_crud import db_add_user, db_add_friend, db_get_friends
from .configs.db_models import User

# User과 관련된 라우터
def create_user_router(manager, get_db):
    router = APIRouter()

    @router.post("/register")
    def register(user: UserSchema, db: Session = Depends(get_db)):
        return db_add_user(db, user)

    @router.get("/users")
    def get_users(db: Session = Depends(get_db)):
        return db.query(User).all()

    @router.get("/current_user")
    def get_current_user(user=Depends(manager)):
        return user.name

    @router.get("/getfriends")
    def get_friends(user: str, db: Session = Depends(get_db)):
        return db_get_friends(db, user)

    @router.post("/addfriend")
    def add_friend(friend: FriendSchema, db: Session = Depends(get_db)):
        return db_add_friend(db, friend.user1, friend.user2)

    return router
