from typing import Optional, Dict, List
import logging
from ..models.kronos_model import KronosModelWrapper, ModelConfig
from ..config import Settings

logger = logging.getLogger(__name__)


class ModelService:
    """Service for model management"""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.model_wrapper: Optional[KronosModelWrapper] = None
        self.current_model: Optional[str] = None

    def initialize(self):
        """Initialize the service"""
        logger.info("Initializing ModelService...")
        self.model_wrapper = KronosModelWrapper(device=self.settings.default_device)

    def get_available_models(self) -> Dict[str, ModelConfig]:
        """Get list of available models"""
        if self.model_wrapper:
            return self.model_wrapper.AVAILABLE_MODELS
        return {}

    def load_model(self, model_key: str, device: Optional[str] = None) -> bool:
        """Load a specific model"""
        if not self.model_wrapper:
            self.initialize()

        if device:
            self.model_wrapper.device = device

        success = self.model_wrapper.load_model(model_key)
        if success:
            self.current_model = model_key
        return success

    def is_model_loaded(self) -> bool:
        """Check if a model is loaded"""
        return self.model_wrapper and self.model_wrapper.predictor is not None

    def get_current_model(self) -> Optional[str]:
        """Get current loaded model"""
        return self.current_model

    def cleanup(self):
        """Cleanup resources"""
        if self.model_wrapper:
            self.model_wrapper.cleanup()
