from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from ..models.database import get_db, User
from ..models.schemas import UserCreate, UserLogin, UserResponse, UserUpdate, Token
from ..models.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    require_admin,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    """用户注册"""
    # 检查用户名是否存在
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 检查邮箱是否存在
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="邮箱已被使用")
    
    # 创建用户
    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=get_password_hash(user.password),
        role="user"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # 返回字典而不是 ORM 对象，避免类型转换问题
    return {
        "id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
        "role": db_user.role,
        "is_active": db_user.is_active,
        "created_at": db_user.created_at.isoformat() if db_user.created_at else None
    }


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """用户登录"""
    user = db.query(User).filter(User.username == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="用户已被禁用")
    
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }


@router.get("/users", response_model=list[UserResponse])
def get_all_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """获取所有用户（仅管理员）"""
    return db.query(User).all()


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """更新用户（仅管理员）"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    if user_update.email:
        user.email = user_update.email
    if user_update.role:
        user.role = user_update.role
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """删除用户（仅管理员）"""
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="不能删除自己")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    db.delete(user)
    db.commit()
    return {"message": "用户已删除"}
