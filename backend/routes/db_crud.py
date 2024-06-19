from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from .configs.db_models import User, Friends, Header, Chat
from .configs.schema import UserSchema, ChatSchema

def db_add_user(db: Session, user: UserSchema):
    db_item = User(name=user.username, password=user.password)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return True

def db_add_friend(db: Session, user1: str, user2: str):
    if(db.query(Friends).filter(or_(and_(Friends.user1_id == user1, Friends.user2_id == user2), and_(Friends.user1_id == user2, Friends.user2_id == user1))).first()):
        return False
    db_item = Friends(user1_id=user1, user2_id=user2)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return True

def db_get_friends(db: Session, user: str):
    return db.query(Friends).filter(or_(Friends.user1_id == user,Friends.user2_id == user)).all()

def db_get_room(db: Session, user1: str, user2: str):
    return db.query(Header).filter(or_(and_(Header.from_id == user1,Header.to_id == user2), and_(Header.from_id == user2, Header.to_id==user1))).first()

def db_get_chatlist(db: Session, header_id: int):
    return db.query(Chat).filter(Chat.header_id == header_id).all()

def db_add_chat(db: Session, chat: ChatSchema):
    db_item = Chat(sender_id=chat.sender_name,
                    receiver_id=chat.receiver_name,
                    header_id=chat.header_id,
                    content=chat.content,
                    sent_at=chat.sent_at)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return True