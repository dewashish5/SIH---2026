"""
Risk Thresholds Configuration
Calibrated with MSDE Planners & NCVET Standards.
Gap Ratio = (Demand - Supply) / Demand
"""

RISK_THRESHOLDS = [
    {
        "key": "critical_shortage",
        "label_en": "Critical Shortage",
        "label_hi": "गंभीर कमी",
        "min_ratio": 0.30,
        "max_ratio": float("inf"),
        "severity_weight": 2.0
    },
    {
        "key": "shortage",
        "label_en": "Shortage",
        "label_hi": "कमी",
        "min_ratio": 0.10,
        "max_ratio": 0.30,
        "severity_weight": 1.2
    },
    {
        "key": "balanced",
        "label_en": "Balanced",
        "label_hi": "संतुलित",
        "min_ratio": -0.10,
        "max_ratio": 0.10,
        "severity_weight": 0.1
    },
    {
        "key": "oversupply",
        "label_en": "Oversupply",
        "label_hi": "अतिरिक्त आपूर्ति",
        "min_ratio": -0.30,
        "max_ratio": -0.10,
        "severity_weight": 1.2
    },
    {
        "key": "saturation",
        "label_en": "Saturation",
        "label_hi": "अति-संतृप्ति",
        "min_ratio": float("-inf"),
        "max_ratio": -0.30,
        "severity_weight": 2.0
    }
]

def classify_gap_ratio(gap_ratio: float) -> str:
    """Classify gap ratio into standard risk band key."""
    if gap_ratio > 0.30:
        return "critical_shortage"
    elif gap_ratio >= 0.10:
        return "shortage"
    elif gap_ratio >= -0.10:
        return "balanced"
    elif gap_ratio >= -0.30:
        return "oversupply"
    else:
        return "saturation"
