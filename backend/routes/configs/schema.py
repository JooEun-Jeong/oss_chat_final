from pydantic import BaseModel
from typing import Optional

class UserSchema(BaseModel):
    username: Optional[str]
    password: Optional[str]

    class Config:
        from_attributes = True

class FriendSchema(BaseModel):
    user1: Optional[str]
    user2: Optional[str]

    class Config:
        from_attributes = True

class LastchatSchema(BaseModel):
    header_id: Optional[int]
    last_chat: Optional[str]

    class Config:
        from_attributes = True

class HeaderSchema(BaseModel):
    from_id: Optional[str]
    to_id: Optional[str]
    last_chat: Optional[str]

    class Config:
        from_attributes = True

class ChatSchema(BaseModel):
    sender_name: Optional[str]
    receiver_name: Optional[str]
    header_id: Optional[int]
    content: Optional[str]
    sent_at: Optional[str]

    class Config:
        from_attributes = True