from fastapi import Request
import time
import logging

logger = logging.getLogger(__name__)

async def logging_middleware(request: Request, call_next):
    """Middleware pour logger les requêtes"""
    
    start_time = time.time()
    
    # Log de la requête
    logger.info(f"→ {request.method} {request.url.path}")
    
    # Traiter la requête
    response = await call_next(request)
    
    # Log de la réponse
    process_time = (time.time() - start_time) * 1000
    logger.info(
        f"← {request.method} {request.url.path} "
        f"[{response.status_code}] {process_time:.2f}ms"
    )
    
    response.headers["X-Process-Time"] = str(process_time)
    
    return response
