"""
What-If Simulator with Pipeline Delay Lag
"""
from typing import Any

from engine.thresholds import classify_gap_ratio


def simulate_seat_change(
    demand_p50: float,
    baseline_supply: float,
    course_duration_months: int,
    months: list[str],
    seat_change_pct: float | None = None,
    seat_change_abs: float | None = None,
    completion_rate: float = 0.88,
    placement_rate: float = 0.74
) -> dict[str, Any]:
    """
    Pure simulation function.
    Models pipeline lag: trainees enrolled at t=0 graduate at t=course_duration_months.
    """
    if seat_change_abs is not None:
        delta_seats = float(seat_change_abs)
    elif seat_change_pct is not None:
        delta_seats = baseline_supply * (seat_change_pct / 100.0)
    else:
        delta_seats = 0.0

    annual_delta_graduates = delta_seats * completion_rate * placement_rate

    # Baseline metrics
    base_gap = demand_p50 - baseline_supply
    base_gap_ratio = base_gap / demand_p50 if demand_p50 > 0 else 0.0
    base_label = classify_gap_ratio(base_gap_ratio)

    series = []
    lag_months = min(max(1, course_duration_months), len(months))

    for idx, m in enumerate(months):
        # Pipeline delay: gradual ramp-up after lag_months
        if idx < lag_months:
            ramp_factor = 0.0 # Trainees still undergoing training!
        else:
            ramp_factor = min(1.0, (idx - lag_months + 1) / 3.0)

        sim_supply_m = baseline_supply + (annual_delta_graduates * ramp_factor)
        m_gap = demand_p50 - sim_supply_m

        series.append({
            "month": m,
            "baselineSupply": round(baseline_supply, 1),
            "simulatedSupply": round(sim_supply_m, 1),
            "demandP50": round(demand_p50, 1),
            "gap": round(m_gap, 1)
        })

    # Terminal simulated metrics (at end of horizon when pipeline matures)
    sim_final_supply = series[-1]["simulatedSupply"]
    sim_gap = demand_p50 - sim_final_supply
    sim_gap_ratio = sim_gap / demand_p50 if demand_p50 > 0 else 0.0
    sim_label = classify_gap_ratio(sim_gap_ratio)

    gap_reduction_pct = 0.0
    if abs(base_gap) > 0.001:
        gap_reduction_pct = round(((abs(base_gap) - abs(sim_gap)) / abs(base_gap)) * 100.0, 1)

    return {
        "courseDurationMonths": course_duration_months,
        "baselineGap": round(base_gap, 1),
        "baselineGapRatio": round(base_gap_ratio, 4),
        "baselineRiskLabel": base_label,
        "simulatedGap": round(sim_gap, 1),
        "simulatedGapRatio": round(sim_gap_ratio, 4),
        "simulatedRiskLabel": sim_label,
        "gapReductionPct": gap_reduction_pct,
        "series": series
    }
