import pytest
from pathlib import Path
import tempfile
import shutil


@pytest.fixture
def temp_dir():
    """Create a temporary directory for testing"""
    temp_path = Path(tempfile.mkdtemp())
    yield temp_path
    shutil.rmtree(temp_path)


@pytest.fixture
def sample_data():
    """Create sample financial data"""
    import pandas as pd
    import numpy as np

    return pd.DataFrame({
        'timestamps': pd.date_range('2024-01-01', periods=1000, freq='5min'),
        'open': np.random.randn(1000) * 100 + 1000,
        'high': np.random.randn(1000) * 100 + 1100,
        'low': np.random.randn(1000) * 100 + 900,
        'close': np.random.randn(1000) * 100 + 1000,
        'volume': np.abs(np.random.randn(1000) * 1000 + 10000)
    })
