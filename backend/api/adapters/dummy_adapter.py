import json
import re
from pathlib import Path
from typing import Any, Dict, List, Tuple
import pandas as pd

CONFIG_PATH = Path(__file__).resolve().parent / "column_mapping.json"

class DatasetAdapter:
    def __init__(self, mapping_path: Path = CONFIG_PATH):
        with open(mapping_path, "r", encoding="utf-8") as f:
            config = json.load(f)
            self.mappings: Dict[str, List[str]] = config.get("mappings", {})
            self.required_fields: List[str] = config.get("required_fields", [])

    def find_target_field(self, col_name: str) -> str | None:
        col_lower = col_name.strip().lower()
        for target, aliases in self.mappings.items():
            for alias in aliases:
                if alias.lower() == col_lower:
                    return target
        return None

    def transform(self, df: pd.DataFrame) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        report = {
            "total_rows": len(df),
            "valid_rows": 0,
            "invalid_rows": 0,
            "missing_required_fields": [],
            "mapped_columns": {},
            "errors": []
        }

        # Map column names
        rename_map = {}
        for col in df.columns:
            target = self.find_target_field(str(col))
            if target:
                rename_map[col] = target
                report["mapped_columns"][str(col)] = target

        mapped_df = df.rename(columns=rename_map)

        # Check required fields
        for req in self.required_fields:
            if req not in mapped_df.columns:
                report["missing_required_fields"].append(req)

        if report["missing_required_fields"]:
            report["errors"].append(
                f"Missing mandatory fields: {', '.join(report['missing_required_fields'])}"
            )
            return [], report

        valid_records = []
        for idx, row in mapped_df.iterrows():
            row_errors = []
            month = str(row.get("month", "")).strip()
            if not re.match(r"^\d{4}-\d{2}$", month):
                row_errors.append(f"Row {idx}: Invalid month format '{month}', expected YYYY-MM")

            district_code = str(row.get("district_code", "")).strip()
            trade_id = str(row.get("trade_id", "")).strip()

            if not district_code or not trade_id:
                row_errors.append(f"Row {idx}: district_code or trade_id is empty")

            if row_errors:
                report["invalid_rows"] += 1
                report["errors"].extend(row_errors)
            else:
                record = {
                    "month": month,
                    "district_code": district_code,
                    "trade_id": trade_id,
                    "demand": float(row.get("demand", 0.0) or 0.0),
                    "supply": float(row.get("supply", 0.0) or 0.0),
                    "seats": int(row.get("seats", 0) or 0),
                    "enrolled": int(row.get("enrolled", 0) or 0),
                    "certified": int(row.get("certified", 0) or 0),
                    "placed": int(row.get("placed", 0) or 0),
                    "source_flag": "official"
                }
                valid_records.append(record)
                report["valid_rows"] += 1

        return valid_records, report

# Aliases for clean naming and backward compatibility
OfficialDatasetAdapter = DatasetAdapter
DummyDatasetAdapter = DatasetAdapter

