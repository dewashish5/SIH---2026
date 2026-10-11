"""
Recommendation Engine for Training Seat Allocation
"""
import math
from typing import Dict, Any

def generate_recommendation(
    trade_name_en: str,
    trade_name_hi: str,
    gap: float,
    gap_ratio: float,
    current_capacity: int,
    completion_rate: float = 0.85,
    placement_rate: float = 0.70
) -> Dict[str, Any]:
    effective_throughput = max(0.20, completion_rate * placement_rate)
    raw_seat_change = gap / effective_throughput

    if gap_ratio > 0.10: # Shortage
        recommended_add = int(math.ceil(max(50.0, min(raw_seat_change, current_capacity * 1.5 if current_capacity > 0 else 500.0))))
        return {
            "action": "add_seats",
            "recommendedSeatChange": recommended_add,
            "currentCapacity": current_capacity,
            "rationaleEn": f"Acute shortage detected (Gap: {int(gap):,} jobs). Sanction +{recommended_add:,} additional seats across government and private ITIs to meet industry demand.",
            "rationaleHi": f"गंभीर कमी दर्ज (अंतर: {int(gap):,} पद)। उद्योग की मांग को पूरा करने के लिए सरकारी एवं निजी आईटीआई में +{recommended_add:,} अतिरिक्त सीटों की स्वीकृति दें।"
        }
    elif gap_ratio < -0.10: # Oversupply / Saturation
        recommended_cut = int(math.floor(min(abs(raw_seat_change), current_capacity * 0.60)))
        return {
            "action": "reallocate",
            "recommendedSeatChange": -recommended_cut,
            "currentCapacity": current_capacity,
            "rationaleEn": f"Oversupply flagged (Surplus: {int(abs(gap)):,} candidates). Reallocate -{recommended_cut:,} seats to emerging high-growth shortage trades in this district.",
            "rationaleHi": f"अतिरिक्त आपूर्ति चिह्नित (अधिशेष: {int(abs(gap)):,} अभ्यर्थी)। इस जिले में उभरते उच्च-मांग वाले व्यवसायों में -{recommended_cut:,} सीटें पुनर्वितरित करें।"
        }
    else: # Balanced
        return {
            "action": "maintain",
            "recommendedSeatChange": 0,
            "currentCapacity": current_capacity,
            "rationaleEn": "Demand and supply are currently balanced within ±10% tolerance band. Maintain current sanctioned seat capacity.",
            "rationaleHi": "मांग और आपूर्ति वर्तमान में ±10% सहिष्णुता सीमा के भीतर संतुलित है। वर्तमान स्वीकृत सीट क्षमता बनाए रखें।"
        }
