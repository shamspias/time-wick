from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, WebSocket
from starlette.websockets import WebSocketDisconnect
from typing import Dict, Any, List, Optional
import pandas as pd
from ..services.model_service import ModelService
from ..services.data_service import DataService
from ..models.kronos_model import PredictionRequest
from ..config import Settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
settings = Settings()
model_service = ModelService(settings)
data_service = DataService(settings.data_dir)


@router.get("/models")
async def get_available_models():
    """Get list of available models"""
    return {
        "models": model_service.get_available_models(),
        "current": model_service.get_current_model(),
        "loaded": model_service.is_model_loaded()
    }


@router.post("/models/load")
async def load_model(model_key: str, device: Optional[str] = None):
    """Load a specific model"""
    try:
        success = model_service.load_model(model_key, device)
        return {
            "success": success,
            "model": model_key,
            "device": device or settings.default_device
        }
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/data/files")
async def list_data_files():
    """List available data files"""
    return data_service.list_data_files()


@router.post("/data/upload")
async def upload_data(file: UploadFile = File(...)):
    """Upload a data file"""
    try:
        # Save uploaded file
        file_path = settings.data_dir / file.filename
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Load and process data
        df = data_service.load_data(str(file_path))
        info = data_service.get_data_info(df)

        return {
            "success": True,
            "filename": file.filename,
            "info": info
        }
    except Exception as e:
        logger.error(f"Failed to upload data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/data/load")
async def load_data(file_path: str):
    """Load data from existing file"""
    try:
        df = data_service.load_data(file_path)
        info = data_service.get_data_info(df)
        return {
            "success": True,
            "info": info
        }
    except Exception as e:
        logger.error(f"Failed to load data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict")
async def predict(request: PredictionRequest):
    """Generate predictions"""
    try:
        if not model_service.is_model_loaded():
            raise HTTPException(status_code=400, detail="Model not loaded")

        if data_service.current_data is None:
            raise HTTPException(status_code=400, detail="Data not loaded")

        # Generate predictions
        result = model_service.model_wrapper.predict(
            data_service.current_data,
            request
        )

        return {
            "success": True,
            "predictions": result.predictions.to_dict('records'),
            "metrics": result.metrics,
            "chart_data": result.chart_data,
            "metadata": result.metadata
        }
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Process WebSocket messages
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.exception(f"WebSocket error: {e}")
    finally:
        await websocket.close()
