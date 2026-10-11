"""
Flow-based Gap & Severity Calculation Engine
"""
from typing import Tuple
from engine.thresholds import classify_gap_ratio

CAP_NORM = 5000.0

def compute_gap(demand: float, supply: float) -> Tuple[float, float, str, float]:
    """
    Computes:
    - gap = demand - supply (flow vs flow)
    - gap_ratio = (demand - supply) / demand
    - risk_label = key from classify_gap_ratio
    - severity_score = normalized ranking score
    """
    gap = demand - supply
    if demand <= 0.0:
        gap_ratio = 0.0
    else:
        gap_ratio = gap / demand

    risk_label = classify_gap_ratio(gap_ratio)
    
    # Volume-weighted severity score (0 to 100 scale)
    volume_factor = min(max(demand, 100.0), CAP_NORM) / CAP_NORM
    severity_score = round(abs(gap_ratio) * volume_factor * 100.0, 2)

    return round(gap, 1), round(gap_ratio, 4), risk_label, severity_score
