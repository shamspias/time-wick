import pytest
import pandas as pd
import numpy as np
from app.services.data_service import DataService
from app.services.model_service import ModelService
from app.config import Settings


class TestDataService:
    """Test suite for DataService"""

    @pytest.fixture
    def data_service(self, tmp_path):
        """Create DataService instance with temp directory"""
        return DataService(tmp_path)

    def test_process_data(self, data_service):
        """Test data processing"""
        # Create sample data
        df = pd.DataFrame({
            'open': np.random.randn(100) * 100 + 1000,
            'high': np.random.randn(100) * 100 + 1100,
            'low': np.random.randn(100) * 100 + 900,
            'close': np.random.randn(100) * 100 + 1000,
            'volume': np.random.randn(100) * 1000 + 10000
        })

        processed = data_service._process_data(df)

        assert 'timestamps' in processed.columns
        assert 'volume' in processed.columns
        assert 'amount' in processed.columns
        assert len(processed) == len(df)

    def test_detect_timeframe(self, data_service):
        """Test timeframe detection"""
        df = pd.DataFrame({
            'timestamps': pd.date_range('2024-01-01', periods=100, freq='5min')
        })

        timeframe = data_service._detect_timeframe(df)
        assert timeframe == "5 minutes"

    def test_get_data_info(self, data_service):
        """Test getting data information"""
        df = pd.DataFrame({
            'timestamps': pd.date_range('2024-01-01', periods=100, freq='1H'),
            'open': np.random.randn(100) * 100 + 1000,
            'high': np.random.randn(100) * 100 + 1100,
            'low': np.random.randn(100) * 100 + 900,
            'close': np.random.randn(100) * 100 + 1000,
            'volume': np.random.randn(100) * 1000 + 10000
        })

        info = data_service.get_data_info(df)

        assert info['rows'] == 100
        assert 'start_date' in info
        assert 'end_date' in info
        assert 'price_range' in info
        assert 'timeframe' in info


class TestModelService:
    """Test suite for ModelService"""

    @pytest.fixture
    def model_service(self):
        """Create ModelService instance"""
        settings = Settings()
        return ModelService(settings)

    def test_initialize(self, model_service):
        """Test service initialization"""
        model_service.initialize()
        assert model_service.model_wrapper is not None

    def test_get_available_models(self, model_service):
        """Test getting available models"""
        model_service.initialize()
        models = model_service.get_available_models()

        assert isinstance(models, dict)
        assert 'kronos-mini' in models
        assert 'kronos-small' in models
        assert 'kronos-base' in models

    def test_is_model_loaded_false(self, model_service):
        """Test checking if model is loaded when it's not"""
        assert model_service.is_model_loaded() is False

    def test_get_current_model_none(self, model_service):
        """Test getting current model when none is loaded"""
        assert model_service.get_current_model() is None
