from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..models.database import get_db, Conversation, Message, User
from ..models.schemas import (
    ConversationCreate, ConversationUpdate, ConversationResponse,
    ConversationDetailResponse, MessageCreate, MessageResponse
)
from ..models.auth import get_current_user

router = APIRouter(prefix="/conversations", tags=["对话管理"])


# ============ 对话管理 ============
@router.post("", response_model=ConversationResponse)
def create_conversation(
    conversation: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新对话"""
    db_conv = Conversation(
        user_id=current_user.id,
        title=conversation.title,
        provider=conversation.provider,
        model=conversation.model
    )
    db.add(db_conv)
    db.commit()
    db.refresh(db_conv)
    
    return db_conv


@router.get("", response_model=List[ConversationResponse])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户的所有对话"""
    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).all()
    
    result = []
    for conv in conversations:
        result.append(ConversationResponse(
            id=conv.id,
            title=conv.title,
            provider=conv.provider,
            model=conv.model,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            messages_count=len(conv.messages)
        ))
    
    return result


@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取对话详情（包含消息）"""
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")
    
    return ConversationDetailResponse(
        id=conv.id,
        title=conv.title,
        provider=conv.provider,
        model=conv.model,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=[
            MessageResponse(
                id=m.id,
                conversation_id=m.conversation_id,
                role=m.role,
                content=m.content,
                created_at=m.created_at
            ) for m in conv.messages
        ],
        messages_count=len(conv.messages)
    )


@router.put("/{conversation_id}", response_model=ConversationResponse)
def update_conversation(
    conversation_id: int,
    conversation_update: ConversationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新对话标题"""
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")
    
    if conversation_update.title:
        conv.title = conversation_update.title
    
    db.commit()
    db.refresh(conv)
    
    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        provider=conv.provider,
        model=conv.model,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages_count=len(conv.messages)
    )


@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除对话"""
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")
    
    db.delete(conv)
    db.commit()
    
    return {"message": "对话已删除"}


# ============ 消息管理 ============
@router.post("/messages", response_model=MessageResponse)
def create_message(
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """添加消息到对话"""
    # 验证对话属于当前用户
    conv = db.query(Conversation).filter(
        Conversation.id == message.conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conv:
        raise HTTPException(status_code=404, detail="对话不存在")
    
    db_msg = Message(
        conversation_id=message.conversation_id,
        role=message.role,
        content=message.content
    )
    db.add(db_msg)
    
    # 更新对话时间
    conv.updated_at = conv.updated_at
    
    db.commit()
    db.refresh(db_msg)
    
    return db_msg


@router.delete("/messages/{message_id}")
def delete_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除消息"""
    msg = db.query(Message).join(Conversation).filter(
        Message.id == message_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not msg:
        raise HTTPException(status_code=404, detail="消息不存在")
    
    db.delete(msg)
    db.commit()
    
    return {"message": "消息已删除"}
