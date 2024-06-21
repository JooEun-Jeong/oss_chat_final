################################
##### PHASE 2: Refactor API ####
## API 목적에 맞게 라우터로 분리 #
################################
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import os
import shutil

from routes.db_crud import db_add_user, db_add_friend, db_get_friends, db_get_room
from .configs.db_connection import SessionLocal
from .configs.schema import ReserveMessageSchema, UserSchema, FriendSchema
from .configs.db_models import Chat, User

import logging

# Setup logging
logger = logging.getLogger(__name__)

UPLOAD_DIR = "uploads" ###### PHASE 2: Upload Image ################

# User과 관련된 라우터
def create_user_router(manager, get_db, scheduler):
    router = APIRouter()

    ###### PHASE 2: Upload Image ################
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
    ####### END #################################

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

    #############################################
    ###### PHASE 2: Upload Image ################
    ### 채팅으로 이미지 업로드 가능 ##########
    #############################################
    @router.post("/upload_image")
    async def upload_image(current_user_id: str = Form(...), target_user_id: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
        try:
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            logger.error(f"Error uploading file: {e}")
            raise HTTPException(status_code=500, detail="Error uploading file")

        file_url = f"/uploads/{file.filename}"
        send_message(current_user_id, target_user_id, f"![image]({file_url})")
        return {"status": "Image uploaded successfully", "file_url": file_url}

    #############################################
    ###### END PHASE 2: Upload Image ############
    #############################################



    
    #############################################
    ###### PHASE 2: Feat Reserve Message ########
    ### 예약한 시간에 맞게 문자 보내는기능 추가 ####
    #############################################
    @router.post("/reservemessage")
    def reserve_message(reserve_message: ReserveMessageSchema, db: Session = Depends(get_db)):
        # Ensure the received send_time is in UTC
        send_time = datetime.fromisoformat(reserve_message.send_time.isoformat())
        if send_time.tzinfo is None:
            send_time = send_time.replace(tzinfo=timezone.utc)

        logger.info(f"Scheduling message: {reserve_message.message} at {send_time.isoformat()}")
        scheduler.add_job(send_message, 'date', run_date=send_time, args=[reserve_message.current_user_id, reserve_message.target_user_id, reserve_message.message])
        return {"status": "Message scheduled successfully"}

    def send_message(current_user_id: str, target_user_id: str, message: str):
        db = SessionLocal()
        try:
            logger.info(f"Attempting to send message from {current_user_id} to {target_user_id}")
            user = db.query(User).filter(User.name == current_user_id).first()
            if user:
                logger.info(f"User found: {user.name}")
                room = db_get_room(db, current_user_id, target_user_id)
                header_id = room.id if room else create_header(db, current_user_id, target_user_id, message)

                chat = Chat(
                    sender_id=current_user_id,
                    receiver_id=target_user_id,
                    header_id=header_id,
                    content=message,
                    sent_at=datetime.now(timezone.utc).isoformat()  # Ensure sent_at is in UTC
                )
                db.add(chat)
                db.commit()
                logger.info(f"Message sent to {user.name}: {message}")
            else:
                logger.error(f"User with id {current_user_id} not found")
        except Exception as e:
            logger.error(f"Error sending message: {e}")
        finally:
            db.close()

    def create_header(db: Session, from_id: str, to_id: str, last_chat: str):
        from .configs.db_models import Header
        header = Header(from_id=from_id, to_id=to_id, last_chat=last_chat)
        db.add(header)
        db.commit()
        db.refresh(header)
        return header.id
    ##################    End   #################
    ###### PHASE 2: Feat Reserve Message ########
    #############################################


    return router
