from typing import Optional, Dict, Any, List
import torch
import pandas as pd
import numpy as np
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class ModelConfig:
    """Model configuration"""
    name: str
    model_id: str
    tokenizer_id: str
    context_length: int
    params: str
    description: str


@dataclass
class PredictionRequest:
    """Prediction request model"""
    lookback: int = 400
    pred_len: int = 120
    temperature: float = 1.0
    top_p: float = 0.9
    sample_count: int = 1
    start_date: Optional[str] = None


@dataclass
class PredictionResult:
    """Prediction result model"""
    predictions: pd.DataFrame
    actual_data: Optional[pd.DataFrame]
    metrics: Dict[str, float]
    chart_data: Dict[str, Any]
    metadata: Dict[str, Any]


class KronosModelWrapper:
    """Wrapper class for Kronos model management"""

    AVAILABLE_MODELS = {
        'kronos-mini': ModelConfig(
            name='Kronos-mini',
            model_id='NeoQuasar/Kronos-mini',
            tokenizer_id='NeoQuasar/Kronos-Tokenizer-2k',
            context_length=2048,
            params='4.1M',
            description='Lightweight model for fast predictions'
        ),
        'kronos-small': ModelConfig(
            name='Kronos-small',
            model_id='NeoQuasar/Kronos-small',
            tokenizer_id='NeoQuasar/Kronos-Tokenizer-base',
            context_length=512,
            params='24.7M',
            description='Balanced performance and speed'
        ),
        'kronos-base': ModelConfig(
            name='Kronos-base',
            model_id='NeoQuasar/Kronos-base',
            tokenizer_id='NeoQuasar/Kronos-Tokenizer-base',
            context_length=512,
            params='102.3M',
            description='High quality predictions'
        )
    }

    def __init__(self, device: str = "cpu"):
        self.device = torch.device(device)
        self.model = None
        self.tokenizer = None
        self.predictor = None
        self.current_model_key = None
        self._check_availability()

    def _check_availability(self):
        """Check if Kronos model is available"""
        try:
            from model import Kronos, KronosTokenizer, KronosPredictor
            self.model_available = True
            logger.info("✅ Kronos model library available")
        except ImportError:
            self.model_available = False
            logger.warning("⚠️ Kronos model library not available")

    def load_model(self, model_key: str) -> bool:
        """Load a specific Kronos model"""
        if not self.model_available:
            raise ImportError("Kronos model library not available")

        if model_key not in self.AVAILABLE_MODELS:
            raise ValueError(f"Unknown model: {model_key}")

        try:
            from model import Kronos, KronosTokenizer, KronosPredictor

            config = self.AVAILABLE_MODELS[model_key]
            logger.info(f"Loading model: {config.name}")

            # Load tokenizer and model
            self.tokenizer = KronosTokenizer.from_pretrained(config.tokenizer_id)
            self.model = Kronos.from_pretrained(config.model_id)

            # Create predictor
            self.predictor = KronosPredictor(
                self.model,
                self.tokenizer,
                device=str(self.device),
                max_context=config.context_length
            )

            self.current_model_key = model_key
            logger.info(f"✅ Model loaded: {config.name} on {self.device}")
            return True

        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    def predict(
            self,
            df: pd.DataFrame,
            request: PredictionRequest
    ) -> PredictionResult:
        """Generate predictions"""
        if not self.predictor:
            raise RuntimeError("Model not loaded")

        # Prepare timestamps
        x_timestamp = df.iloc[:request.lookback]['timestamps']
        y_timestamp = df.iloc[request.lookback:request.lookback + request.pred_len]['timestamps']

        # Prepare data
        x_df = df.iloc[:request.lookback][['open', 'high', 'low', 'close', 'volume']]

        # Generate predictions
        pred_df = self.predictor.predict(
            df=x_df,
            x_timestamp=x_timestamp,
            y_timestamp=y_timestamp,
            pred_len=request.pred_len,
            T=request.temperature,
            top_p=request.top_p,
            sample_count=request.sample_count
        )

        # Calculate metrics
        metrics = self._calculate_metrics(pred_df, df.iloc[request.lookback:request.lookback + request.pred_len])

        # Create chart data
        chart_data = self._create_chart_data(df, pred_df, request)

        return PredictionResult(
            predictions=pred_df,
            actual_data=df.iloc[request.lookback:request.lookback + request.pred_len] if len(
                df) > request.lookback + request.pred_len else None,
            metrics=metrics,
            chart_data=chart_data,
            metadata={
                'model': self.current_model_key,
                'device': str(self.device),
                'parameters': {
                    'temperature': request.temperature,
                    'top_p': request.top_p,
                    'sample_count': request.sample_count
                }
            }
        )

    def _calculate_metrics(self, predictions: pd.DataFrame, actual: pd.DataFrame) -> Dict[str, float]:
        """Calculate prediction metrics"""
        if actual is None or len(actual) == 0:
            return {}

        mae = np.mean(np.abs(predictions['close'] - actual['close']))
        rmse = np.sqrt(np.mean((predictions['close'] - actual['close']) ** 2))
        mape = np.mean(np.abs((predictions['close'] - actual['close']) / actual['close'])) * 100

        return {
            'mae': float(mae),
            'rmse': float(rmse),
            'mape': float(mape)
        }

    def _create_chart_data(self, historical: pd.DataFrame, predictions: pd.DataFrame, request: PredictionRequest) -> \
            Dict[str, Any]:
        """Create chart data for visualization"""
        return {
            'historical': historical.iloc[:request.lookback].to_dict('records'),
            'predictions': predictions.to_dict('records'),
            'actual': historical.iloc[request.lookback:request.lookback + request.pred_len].to_dict('records') if len(
                historical) > request.lookback + request.pred_len else []
        }

    def cleanup(self):
        """Cleanup resources"""
        self.model = None
        self.tokenizer = None
        self.predictor = None
        torch.cuda.empty_cache()
