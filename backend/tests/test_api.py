import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import Settings

client = TestClient(app)


class TestAPI:
    """Test suite for API endpoints"""

    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["name"] == "Kronos Financial Prediction Platform"

    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        assert "status" in response.json()

    def test_get_available_models(self):
        """Test getting available models"""
        response = client.get("/api/models")
        assert response.status_code == 200
        assert "models" in response.json()
        assert "current" in response.json()
        assert "loaded" in response.json()

    def test_list_data_files(self):
        """Test listing data files"""
        response = client.get("/api/data/files")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_load_model_invalid(self):
        """Test loading invalid model"""
        response = client.post("/api/models/load", json={"model_key": "invalid"})
        assert response.status_code == 500

    def test_predict_without_model(self):
        """Test prediction without loaded model"""
        response = client.post("/api/predict", json={
            "lookback": 400,
            "pred_len": 120,
            "temperature": 1.0,
            "top_p": 0.9,
            "sample_count": 1
        })
        assert response.status_code == 400
        assert "Model not loaded" in response.json()["detail"]
