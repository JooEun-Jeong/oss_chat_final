from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from .db_connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    password = Column(String)

class Friends(Base):
    __tablename__ = "friends"

    id = Column(Integer, primary_key=True)
    user1_id = Column(String, ForeignKey("users.name"))
    user2_id = Column(String, ForeignKey("users.name"))

class Header(Base):
    __tablename__ = "headers"

    id = Column(Integer, primary_key=True)
    from_id = Column(String, ForeignKey("users.name"))
    to_id = Column(String, ForeignKey("users.name"))
    last_chat = Column(String)

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True)
    sender_id = Column(String, ForeignKey("users.name"))
    receiver_id = Column(String, ForeignKey("users.name"))
    header_id = Column(Integer, ForeignKey("headers.id"))
    content = Column(String)
    sent_at = Column(String)

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])