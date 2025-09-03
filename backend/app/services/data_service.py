import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class DataService:
    """Service for data management and processing"""

    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.current_data: Optional[pd.DataFrame] = None

    def list_data_files(self) -> List[Dict[str, Any]]:
        """List available data files"""
        files = []
        for ext in ['.csv', '.feather', '.parquet']:
            for file_path in self.data_dir.glob(f'*{ext}'):
                files.append({
                    'name': file_path.name,
                    'path': str(file_path),
                    'size': file_path.stat().st_size,
                    'modified': file_path.stat().st_mtime
                })
        return sorted(files, key=lambda x: x['modified'], reverse=True)

    def load_data(self, file_path: str) -> pd.DataFrame:
        """Load data from file"""
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        # Load based on extension
        if path.suffix == '.csv':
            df = pd.read_csv(path)
        elif path.suffix == '.feather':
            df = pd.read_feather(path)
        elif path.suffix == '.parquet':
            df = pd.read_parquet(path)
        else:
            raise ValueError(f"Unsupported file format: {path.suffix}")

        # Process and validate data
        df = self._process_data(df)
        self.current_data = df
        return df

    def _process_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Process and validate data"""
        required_cols = ['open', 'high', 'low', 'close']

        # Check required columns
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")

        # Process timestamps
        if 'timestamps' in df.columns:
            df['timestamps'] = pd.to_datetime(df['timestamps'])
        elif 'timestamp' in df.columns:
            df['timestamps'] = pd.to_datetime(df['timestamp'])
        elif 'date' in df.columns:
            df['timestamps'] = pd.to_datetime(df['date'])
        else:
            # Generate timestamps if not present
            df['timestamps'] = pd.date_range(
                start='2024-01-01',
                periods=len(df),
                freq='1H'
            )

        # Ensure numeric types
        for col in required_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')

        # Handle volume
        if 'volume' not in df.columns:
            df['volume'] = 0.0
        else:
            df['volume'] = pd.to_numeric(df['volume'], errors='coerce').fillna(0.0)

        # Handle amount
        if 'amount' not in df.columns:
            df['amount'] = df['volume'] * df[required_cols].mean(axis=1)

        # Remove NaN values
        df = df.dropna()

        return df

    def get_data_info(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Get information about the data"""
        return {
            'rows': len(df),
            'columns': df.columns.tolist(),
            'start_date': df['timestamps'].min().isoformat() if 'timestamps' in df.columns else None,
            'end_date': df['timestamps'].max().isoformat() if 'timestamps' in df.columns else None,
            'price_range': {
                'min': float(df[['open', 'high', 'low', 'close']].min().min()),
                'max': float(df[['open', 'high', 'low', 'close']].max().max())
            },
            'timeframe': self._detect_timeframe(df)
        }

    def _detect_timeframe(self, df: pd.DataFrame) -> str:
        """Detect data timeframe"""
        if 'timestamps' not in df.columns or len(df) < 2:
            return "Unknown"

        time_diffs = df['timestamps'].diff().dropna()[:10]
        avg_diff = time_diffs.mean()

        if avg_diff < pd.Timedelta(minutes=1):
            return f"{int(avg_diff.total_seconds())} seconds"
        elif avg_diff < pd.Timedelta(hours=1):
            return f"{int(avg_diff.total_seconds() / 60)} minutes"
        elif avg_diff < pd.Timedelta(days=1):
            return f"{int(avg_diff.total_seconds() / 3600)} hours"
        else:
            return f"{avg_diff.days} days"
