from fastapi import APIRouter
from .routes import router as chat_router
from .auth_routes import router as auth_router
from .conversation_routes import router as conversation_router

router = APIRouter()

router.include_router(chat_router)
router.include_router(auth_router)
router.include_router(conversation_router)
