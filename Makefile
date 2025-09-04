.PHONY: help install dev build test clean

help:
	@echo "Available commands:"
	@echo "  make install    - Install all dependencies"
	@echo "  make dev        - Run development servers"
	@echo "  make build      - Build Docker containers"
	@echo "  make test       - Run tests"
	@echo "  make clean      - Clean up generated files"

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

dev:
	@echo "Starting backend..."
	cd backend && uvicorn app.main:app --reload --port 8000 &
	@echo "Starting frontend..."
	cd frontend && npm run dev

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

test:
	cd backend && pytest tests/
	cd frontend && npm test

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name "node_modules" -exec rm -rf {} +
	find . -type d -name "dist" -exec rm -rf {} +
	rm -rf backend/.pytest_cache
	rm -rf frontend/.vite