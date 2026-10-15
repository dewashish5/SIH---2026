import pandas as pd

from adapters.dummy_adapter import DummyDatasetAdapter


def test_dummy_adapter_successful_mapping():
    adapter = DummyDatasetAdapter()
    data = {
        "Period": ["2026-10", "2026-11"],
        "District_LGD": ["091", "093"],
        "QP_Code": ["trade_solar_pv", "trade_electrician"],
        "Job_Demand": [5200, 1800],
        "Training_Supply": [2900, 3200],
        "Training_Seats": [3500, 3800]
    }
    df = pd.DataFrame(data)
    records, report = adapter.transform(df)

    assert report["valid_rows"] == 2
    assert report["invalid_rows"] == 0
    assert len(records) == 2
    assert records[0]["month"] == "2026-10"
    assert records[0]["district_code"] == "091"
    assert records[0]["trade_id"] == "trade_solar_pv"
    assert records[0]["demand"] == 5200.0
    assert records[0]["source_flag"] == "official"

def test_dummy_adapter_missing_required_column():
    adapter = DummyDatasetAdapter()
    data = {
        "Period": ["2026-10"],
        "Unknown_Column": [123]
    }
    df = pd.DataFrame(data)
    records, report = adapter.transform(df)

    assert len(records) == 0
    assert "district_code" in report["missing_required_fields"]
    assert len(report["errors"]) > 0

def test_dummy_adapter_invalid_month_format():
    adapter = DummyDatasetAdapter()
    data = {
        "Period": ["invalid-date"],
        "District_LGD": ["091"],
        "QP_Code": ["trade_solar_pv"]
    }
    df = pd.DataFrame(data)
    _records, report = adapter.transform(df)

    assert report["valid_rows"] == 0
    assert report["invalid_rows"] == 1
    assert "Invalid month format" in report["errors"][0]
