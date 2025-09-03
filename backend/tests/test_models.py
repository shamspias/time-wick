import pytest
import pandas as pd
import numpy as np
from app.models.kronos_model import ModelConfig, PredictionRequest, KronosModelWrapper


class TestModelConfig:
    """Test suite for ModelConfig"""

    def test_model_config_creation(self):
        """Test creating model configuration"""
        config = ModelConfig(
            name="Test Model",
            model_id="test/model",
            tokenizer_id="test/tokenizer",
            context_length=512,
            params="10M",
            description="Test description"
        )

        assert config.name == "Test Model"
        assert config.model_id == "test/model"
        assert config.context_length == 512


class TestPredictionRequest:
    """Test suite for PredictionRequest"""

    def test_prediction_request_defaults(self):
        """Test prediction request with default values"""
        request = PredictionRequest()

        assert request.lookback == 400
        assert request.pred_len == 120
        assert request.temperature == 1.0
        assert request.top_p == 0.9
        assert request.sample_count == 1
        assert request.start_date is None

    def test_prediction_request_custom(self):
        """Test prediction request with custom values"""
        request = PredictionRequest(
            lookback=200,
            pred_len=60,
            temperature=1.5,
            top_p=0.95,
            sample_count=3,
            start_date="2024-01-01"
        )

        assert request.lookback == 200
        assert request.pred_len == 60
        assert request.temperature == 1.5
        assert request.sample_count == 3


class TestKronosModelWrapper:
    """Test suite for KronosModelWrapper"""

    def test_available_models(self):
        """Test available models configuration"""
        wrapper = KronosModelWrapper()

        assert 'kronos-mini' in wrapper.AVAILABLE_MODELS
        assert 'kronos-small' in wrapper.AVAILABLE_MODELS
        assert 'kronos-base' in wrapper.AVAILABLE_MODELS

    def test_calculate_metrics(self):
        """Test metrics calculation"""
        wrapper = KronosModelWrapper()

        # Create sample data
        predictions = pd.DataFrame({
            'close': [100, 101, 102, 103, 104]
        })
        actual = pd.DataFrame({
            'close': [100, 100, 101, 102, 103]
        })

        metrics = wrapper._calculate_metrics(predictions, actual)

        assert 'mae' in metrics
        assert 'rmse' in metrics
        assert 'mape' in metrics
        assert metrics['mae'] > 0
