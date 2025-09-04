# TimeWick - Financial Prediction Platform

AI-powered K-line (candlestick) forecasting with a FastAPI backend and a modern React + Vite frontend—integrated with
the **Kronos** time-series foundation models from NeoQuasar.

> Kronos is a family of decoder-only foundation models trained on 12B+ K-lines across 45 exchanges, using a specialized
> tokenizer that discretizes OHLCV into hierarchical tokens for robust autoregressive forecasting.

---

## ✨ Features

* **FastAPI backend**

    * Health & status endpoints
    * Model lifecycle management (load model + choose device)
    * Dataset upload (CSV/Feather/Parquet) & quick profiling
    * Prediction endpoint with metrics (MAE/RMSE/MAPE)
    * WebSocket endpoint (ready for live notifications)
* **React frontend**

    * Clean dashboard with dark mode
    * Model selector, device picker
    * Data uploader + existing file loader
    * Prediction controls and Plotly candlestick visualization
* **Tooling**

    * Dockerized dev/prod (Nginx serving frontend)
    * Makefile for common workflows
    * Tests (pytest + vitest)
    * Tailwind styling, Axios service, reusable hooks

---

## 🧠 Kronos Models (NeoQuasar)

**Model Zoo**

| Model        | Tokenizer             | Context length | Params | HF ID                    |
|--------------|-----------------------|----------------|--------|--------------------------|
| Kronos-mini  | Kronos-Tokenizer-2k   | 2048           | 4.1M   | `NeoQuasar/Kronos-mini`  |
| Kronos-small | Kronos-Tokenizer-base | 512            | 24.7M  | `NeoQuasar/Kronos-small` |
| Kronos-base  | Kronos-Tokenizer-base | 512            | 102.3M | `NeoQuasar/Kronos-base`  |
| Kronos-large | Kronos-Tokenizer-base | 512            | 499.2M | Not yet public           |

**Key guidance**

* `max_context` for **Kronos-small**/**Kronos-base** is **512** → keep **lookback ≤ 512** (longer inputs will be
  truncated by the predictor).
* Required input columns: `open, high, low, close`. `volume`/`amount` optional.
* Backend expects a library providing:

  ```py
  from model import Kronos, KronosTokenizer, KronosPredictor
  ```

  and loads from the Hugging Face Hub via `.from_pretrained()`.

**Standalone example with KronosPredictor**

```python
from model import Kronos, KronosTokenizer, KronosPredictor
import pandas as pd

tokenizer = KronosTokenizer.from_pretrained("NeoQuasar/Kronos-Tokenizer-base")
model = Kronos.from_pretrained("NeoQuasar/Kronos-small")
predictor = KronosPredictor(model, tokenizer, device="cuda:0", max_context=512)

df = pd.read_csv("./data/XSHG_5min_600977.csv")
df['timestamps'] = pd.to_datetime(df['timestamps'])
lookback, pred_len = 400, 120

x_df = df.loc[:lookback - 1, ['open', 'high', 'low', 'close', 'volume', 'amount']]
x_timestamp = df.loc[:lookback - 1, 'timestamps']
y_timestamp = df.loc[lookback:lookback + pred_len - 1, 'timestamps']

pred_df = predictor.predict(
    df=x_df, x_timestamp=x_timestamp, y_timestamp=y_timestamp,
    pred_len=pred_len, T=1.0, top_p=0.9, sample_count=1
)
print(pred_df.head())
```

---

## 🚀 Quickstart

### 1) Configure environment

```bash
cp .env.example .env
# In Docker, use the service host for Redis:
# REDIS_URL=redis://redis:6379
```

### 2) Run with Docker (recommended)

```bash
docker-compose up -d --build
```

* Backend: [http://localhost:8000](http://localhost:8000) (Docs: `/docs`)
* Frontend: [http://localhost](http://localhost)

### 3) Local development

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
# Vite dev server at http://localhost:5173 (proxies /api and /ws)
```

---

## 🔌 API Overview

Base path: **`/api`**

### Models

* `GET /api/models` — list available models and current/loaded status
* `POST /api/models/load`

  ```json
  { "model_key": "kronos-small", "device": "cpu" }
  ```

### Data

* `GET /api/data/files` — list files in the data directory
* `POST /api/data/upload` — multipart form field `file`
* `POST /api/data/load`

  ```json
  { "file_path": "./data/BTC_USDT_5min.csv" }
  ```

### Predictions

* `POST /api/predict`

  ```json
  {
    "lookback": 400,
    "pred_len": 120,
    "temperature": 1.0,
    "top_p": 0.9,
    "sample_count": 1
  }
  ```

### WebSocket

* `ws://localhost:8000/ws` — echo server placeholder (extend with events/progress)

---

## 🖥️ Frontend Notes

* `src/services/api.js`: Axios client (auth token interceptor) + API endpoints
* `src/services/websocket.js`: WebSocket client with auto-reconnect and event bus
* `src/hooks/useKronos.js`: Loads models/files, runs predictions, handles ws events
* `src/components/*`: UI (Dashboard, ModelSelector, DataUploader, ControlPanel, PredictionChart)
* `src/utils/chartConfig.js`: Plotly layout and candlestick trace helpers

> Heads-up: the client has placeholders like `/api/models/status`, `/api/predictions/history`, `/api/analytics*` that
> aren’t implemented server-side yet.

---

## 🧪 Testing

**Backend**

```bash
cd backend
pytest -v --cov=app
```

**Frontend**

```bash
cd frontend
npm test
```

---

## 🐳 Docker Notes

* Frontend is built with Node and served by Nginx.
* Nginx proxies:

    * `/api` → `http://backend:8000`
    * `/ws` → `http://backend:8000` (WebSocket upgrade headers included)
* Backend mounts:

    * `./backend/data` → `/app/data`
    * `./backend/models` → `/app/models`

---

## 🛠️ Makefile

```bash
make install    # backend pip + frontend npm
make dev        # uvicorn + vite dev server
make build      # docker build
make up         # docker-compose up -d
make down       # docker-compose down
make test       # backend pytest + frontend vitest
make clean      # remove caches, dist, node_modules
```

---

## ⚙️ Configuration

Backend settings (see `backend/app/config.py` and `.env`):

| Key               | Default                       | Notes                              |
|-------------------|-------------------------------|------------------------------------|
| `API_PORT`        | `8000`                        | Backend port                       |
| `CORS_ORIGINS`    | `http://localhost:5173,...`   | Comma-separated                    |
| `DEFAULT_DEVICE`  | `cpu`                         | `cpu`, `cuda`, `mps`               |
| `MODEL_CACHE_DIR` | `./models`                    | Mounted in Docker                  |
| `DATA_DIR`        | `./data`                      | Mounted in Docker                  |
| `SECRET_KEY`      | `your-secret-key-change-this` | Change in prod                     |
| `DATABASE_URL`    | `sqlite:///./kronos.db`       | Optional                           |
| `REDIS_URL`       | `redis://localhost:6379`      | Use `redis://redis:6379` in Docker |
| `HF_TOKEN`        | —                             | If HF auth is required             |

Frontend (optional):

```
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

---

## 🔒 Security & Production

* Replace `SECRET_KEY` in `.env` before deployment.
* Restrict `CORS_ORIGINS` to trusted domains.
* Consider an external DB instead of SQLite for multi-user workloads.
* Limit upload size/types at Nginx and application levels.
* Store tokens/keys (e.g., `HF_TOKEN`) as environment secrets.

---

## 🧩 Troubleshooting

* **Model not loaded**: ensure the Kronos model library is installed/available. `/health` should
  show `model_loaded: false` otherwise.
* **Redis in Docker**: use `redis://redis:6379` (service name), not localhost.
* **CORS errors**: keep `CORS_ORIGINS` aligned with your Vite dev URL (`http://localhost:5173`).
* **WebSocket upgrade issues**: verify Nginx upgrade headers (already included).
* **Large uploads**: bump Nginx `client_max_body_size` and/or backend `MAX_FILE_SIZE` if needed.

---

## 🤝 Acknowledgements

* **NeoQuasar** for the Kronos models, tokenizer, and predictor.
* The open-source communities behind FastAPI, React, Tailwind, Plotly, and Vite.
