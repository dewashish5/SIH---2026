from auth import CurrentUser
from engine.gap import compute_gap
from engine.recommend import generate_recommendation
from engine.thresholds import classify_gap_ratio
from engine.whatif import simulate_seat_change


def test_threshold_boundary_cases():
    assert classify_gap_ratio(0.35) == "critical_shortage"
    assert classify_gap_ratio(0.301) == "critical_shortage"
    assert classify_gap_ratio(0.30) == "shortage"
    assert classify_gap_ratio(0.15) == "shortage"
    assert classify_gap_ratio(0.10) == "shortage"
    assert classify_gap_ratio(0.09) == "balanced"
    assert classify_gap_ratio(0.00) == "balanced"
    assert classify_gap_ratio(-0.10) == "balanced"
    assert classify_gap_ratio(-0.11) == "oversupply"
    assert classify_gap_ratio(-0.30) == "oversupply"
    assert classify_gap_ratio(-0.31) == "saturation"
    assert classify_gap_ratio(-0.50) == "saturation"

def test_gap_sign_and_severity():
    # Shortage case (demand > supply)
    gap, ratio, label, sev = compute_gap(demand=5200.0, supply=2900.0)
    assert gap == 2300.0
    assert ratio > 0.44
    assert label == "critical_shortage"
    assert sev > 40.0

    # Oversupply case (demand < supply)
    gap_neg, ratio_neg, label_neg, sev_neg = compute_gap(demand=1800.0, supply=3200.0)
    assert gap_neg == -1400.0
    assert ratio_neg < -0.70
    assert label_neg == "saturation"
    assert sev_neg > 20.0

def test_recommendation_logic():
    # Shortage should recommend adding seats
    rec_short = generate_recommendation(
        trade_name_en="Solar PV Technician",
        trade_name_hi="सौर पीवी",
        gap=2300.0,
        gap_ratio=0.44,
        current_capacity=3000
    )
    assert rec_short["action"] == "add_seats"
    assert rec_short["recommendedSeatChange"] > 0
    assert "Sanction" in rec_short["rationaleEn"]

    # Oversupply should recommend reallocation
    rec_over = generate_recommendation(
        trade_name_en="Electrician",
        trade_name_hi="इलेक्ट्रीशियन",
        gap=-1400.0,
        gap_ratio=-0.77,
        current_capacity=3500
    )
    assert rec_over["action"] == "reallocate"
    assert rec_over["recommendedSeatChange"] < 0
    assert "Reallocate" in rec_over["rationaleEn"]

def test_whatif_pipeline_delay():
    months = ["2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05"]
    res = simulate_seat_change(
        demand_p50=5000.0,
        baseline_supply=2500.0,
        course_duration_months=3,
        months=months,
        seat_change_pct=40.0
    )
    series = res["series"]
    # Check that first 3 months have baseline supply (no graduates yet)
    assert series[0]["simulatedSupply"] == 2500.0
    assert series[1]["simulatedSupply"] == 2500.0
    assert series[2]["simulatedSupply"] == 2500.0
    # Later months have increased supply
    assert series[-1]["simulatedSupply"] > 2500.0
    assert res["gapReductionPct"] > 0.0

def test_auth_scope_guards():
    # National user can access all
    u_nat = CurrentUser(user_id="u1", role="national")
    assert u_nat.check_access(state_code="08", district_code="091") is True
    assert u_nat.check_access(state_code="27", district_code="521") is True

    # State user restricted to own state
    u_state = CurrentUser(user_id="u2", role="state", state_scope="08")
    assert u_state.check_access(state_code="08") is True
    assert u_state.check_access(state_code="27") is False

    # District user restricted to own district
    u_dist = CurrentUser(user_id="u3", role="district", state_scope="08", district_scope="091")
    assert u_dist.check_access(state_code="08", district_code="091") is True
    assert u_dist.check_access(state_code="08", district_code="093") is False
    assert u_dist.check_access(state_code="27", district_code="521") is False
