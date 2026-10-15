// ===================================================================
// SkillGap Intelligence Neo4j Knowledge Graph Seed (PS 26246)
// Real Government Data Topology: MSDE, NCS, PMKVY, NQR
// ===================================================================

// 1. Constraints
CREATE CONSTRAINT trade_id_unique IF NOT EXISTS FOR (t:Trade) REQUIRE t.id IS UNIQUE;
CREATE CONSTRAINT district_id_unique IF NOT EXISTS FOR (d:District) REQUIRE d.id IS UNIQUE;
CREATE CONSTRAINT skill_id_unique IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE;

// 2. Nodes
MERGE (n:State {id: 'state_RJ'}) SET n += {id: 'state_RJ', label: 'State', name: 'Rajasthan', code: '08', vacancies: 18690, employers: 53474};
MERGE (n:State {id: 'state_MH'}) SET n += {id: 'state_MH', label: 'State', name: 'Maharashtra', code: '27', vacancies: 119141, employers: 158407};
MERGE (n:State {id: 'state_KA'}) SET n += {id: 'state_KA', label: 'State', name: 'Karnataka', code: '29', vacancies: 83223, employers: 45123};
MERGE (n:District {id: 'dist_091'}) SET n += {id: 'dist_091', name: 'Jaipur', state: 'Rajasthan', state_id: 'state_RJ', pmkvy_certified: 6026, weight: 0.158};
MERGE (n:District {id: 'dist_088'}) SET n += {id: 'dist_088', name: 'Bhilwara', state: 'Rajasthan', state_id: 'state_RJ', pmkvy_certified: 1120, weight: 0.029};
MERGE (n:District {id: 'dist_094'}) SET n += {id: 'dist_094', name: 'Jodhpur', state: 'Rajasthan', state_id: 'state_RJ', pmkvy_certified: 1383, weight: 0.036};
MERGE (n:District {id: 'dist_521'}) SET n += {id: 'dist_521', name: 'Pune', state: 'Maharashtra', state_id: 'state_MH', pmkvy_certified: 4206, weight: 0.105};
MERGE (n:District {id: 'dist_505'}) SET n += {id: 'dist_505', name: 'Nagpur', state: 'Maharashtra', state_id: 'state_MH', pmkvy_certified: 1740, weight: 0.043};
MERGE (n:District {id: 'dist_554'}) SET n += {id: 'dist_554', name: 'Bengaluru Urban', state: 'Karnataka', state_id: 'state_KA', pmkvy_certified: 4090, weight: 0.176};
MERGE (n:Sector {id: 'sec_clean_energy'}) SET n += {id: 'sec_clean_energy', name: 'Solar & Clean Energy', priority: 'high'};
MERGE (n:Sector {id: 'sec_auto_ev'}) SET n += {id: 'sec_auto_ev', name: 'Automotive & Electric Vehicles', priority: 'high'};
MERGE (n:Sector {id: 'sec_electrical'}) SET n += {id: 'sec_electrical', name: 'Electronics & Electrical', priority: 'medium'};
MERGE (n:Sector {id: 'sec_it'}) SET n += {id: 'sec_it', name: 'IT-ITeS & Digital Services', priority: 'high'};
MERGE (n:Sector {id: 'sec_construction'}) SET n += {id: 'sec_construction', name: 'Construction & Infrastructure', priority: 'medium'};
MERGE (n:Trade {id: 'trade_7421_0301'}) SET n += {id: 'trade_7421_0301', code: '7421.0301', name: 'Solar PV Technician', sector_id: 'sec_clean_energy', nsqf: 4, nqr_code: 'QG-04-ES-02628-2024-V2-SCGJ', status: 'active'};
MERGE (n:Trade {id: 'trade_7231_0102'}) SET n += {id: 'trade_7231_0102', code: '7231.0102', name: 'EV Service Technician', sector_id: 'sec_auto_ev', nsqf: 4, nqr_code: 'QG-04-AU-03586-2025-V2-ASDC', status: 'active'};
MERGE (n:Trade {id: 'trade_7411_0100'}) SET n += {id: 'trade_7411_0100', code: '7411.0100', name: 'Electrician', sector_id: 'sec_electrical', nsqf: 4, nqr_code: '2022/EHW/ESSC/06452', status: 'active'};
MERGE (n:Trade {id: 'trade_2519_0301'}) SET n += {id: 'trade_2519_0301', code: '2519.0301', name: 'AI Data Annotator', sector_id: 'sec_it', nsqf: 5, nqr_code: 'QG-4.5-IT-00349-2023-V1-NIELIT', status: 'active'};
MERGE (n:Trade {id: 'trade_7231_0100'}) SET n += {id: 'trade_7231_0100', code: '7231.0100', name: 'Automotive Service Technician', sector_id: 'sec_auto_ev', nsqf: 4, nqr_code: 'QG-04-AU-02943-2024-V2-ASDC', status: 'active'};
MERGE (n:Trade {id: 'trade_7126_0100'}) SET n += {id: 'trade_7126_0100', code: '7126.0100', name: 'Plumber', sector_id: 'sec_construction', nsqf: 3.5, nqr_code: 'QG-3.5-PL-03196-2024-V2-DGT', status: 'active'};
MERGE (n:Skill {id: 'skill_pv_array'}) SET n += {id: 'skill_pv_array', name: 'Solar PV Array Installation & Wiring', category: 'Domain Technical'};
MERGE (n:Skill {id: 'skill_inverter_sync'}) SET n += {id: 'skill_inverter_sync', name: 'Grid Tie Inverter Synchronization', category: 'Domain Technical'};
MERGE (n:Skill {id: 'skill_hv_safety'}) SET n += {id: 'skill_hv_safety', name: 'High Voltage DC Safety Protocols', category: 'Safety Standard'};
MERGE (n:Skill {id: 'skill_ev_battery'}) SET n += {id: 'skill_ev_battery', name: 'EV Lithium Battery Pack Diagnostics', category: 'Domain Technical'};
MERGE (n:Skill {id: 'skill_motor_drive'}) SET n += {id: 'skill_motor_drive', name: 'Electric Motor Drive Testing', category: 'Domain Technical'};
MERGE (n:Skill {id: 'skill_earthing'}) SET n += {id: 'skill_earthing', name: 'Single/Three Phase Earthing & Wiring', category: 'Core Foundation'};
MERGE (n:Skill {id: 'skill_switchgear'}) SET n += {id: 'skill_switchgear', name: 'Industrial Switchgear & Relays', category: 'Core Foundation'};
MERGE (n:Skill {id: 'skill_multimeter'}) SET n += {id: 'skill_multimeter', name: 'Insulation Resistance & Multimeter Testing', category: 'Diagnostic Testing'};
MERGE (n:Skill {id: 'skill_cv_bbox'}) SET n += {id: 'skill_cv_bbox', name: 'Computer Vision Bounding Box Annotation', category: 'Digital AI'};
MERGE (n:Skill {id: 'skill_sensor_fusion'}) SET n += {id: 'skill_sensor_fusion', name: 'LiDAR Point Cloud Labeling', category: 'Digital AI'};
MERGE (n:Employer {id: 'emp_tata_solar'}) SET n += {id: 'emp_tata_solar', name: 'Tata Power Solar Systems', district_id: 'dist_091', trade_id: 'trade_7421_0301', openings: 850};
MERGE (n:Employer {id: 'emp_adani_green'}) SET n += {id: 'emp_adani_green', name: 'Adani Solar Renewables', district_id: 'dist_094', trade_id: 'trade_7421_0301', openings: 620};
MERGE (n:Employer {id: 'emp_mahindra_ev'}) SET n += {id: 'emp_mahindra_ev', name: 'Mahindra Electric Mobility Ltd', district_id: 'dist_521', trade_id: 'trade_7231_0102', openings: 780};
MERGE (n:Employer {id: 'emp_tata_motors'}) SET n += {id: 'emp_tata_motors', name: 'Tata Motors EV Division', district_id: 'dist_521', trade_id: 'trade_7231_0102', openings: 640};
MERGE (n:Employer {id: 'emp_infosys_bpm'}) SET n += {id: 'emp_infosys_bpm', name: 'Infosys BPM AI Services', district_id: 'dist_554', trade_id: 'trade_2519_0301', openings: 920};
MERGE (n:Institute {id: 'inst_iti_jaipur'}) SET n += {id: 'inst_iti_jaipur', name: 'Govt ITI Jaipur Central', district_id: 'dist_091', trade_id: 'trade_7421_0301', capacity: 240, certified: 195};
MERGE (n:Institute {id: 'inst_pmkvy_jaipur'}) SET n += {id: 'inst_pmkvy_jaipur', name: 'PMKVY Suryamitra Kendra Jaipur', district_id: 'dist_091', trade_id: 'trade_7421_0301', capacity: 360, certified: 310};
MERGE (n:Institute {id: 'inst_iti_pune'}) SET n += {id: 'inst_iti_pune', name: 'Industrial Training Institute Aundh Pune', district_id: 'dist_521', trade_id: 'trade_7231_0102', capacity: 300, certified: 245};
MERGE (n:Institute {id: 'inst_nsti_bengaluru'}) SET n += {id: 'inst_nsti_bengaluru', name: 'National Skill Training Institute Bengaluru', district_id: 'dist_554', trade_id: 'trade_2519_0301', capacity: 450, certified: 410};

// 3. Relationships
MATCH (a {id: 'dist_091'}), (b {id: 'state_RJ'}) MERGE (a)-[r:LOCATED_IN]->(b);
MATCH (a {id: 'dist_088'}), (b {id: 'state_RJ'}) MERGE (a)-[r:LOCATED_IN]->(b);
MATCH (a {id: 'dist_094'}), (b {id: 'state_RJ'}) MERGE (a)-[r:LOCATED_IN]->(b);
MATCH (a {id: 'dist_521'}), (b {id: 'state_MH'}) MERGE (a)-[r:LOCATED_IN]->(b);
MATCH (a {id: 'dist_505'}), (b {id: 'state_MH'}) MERGE (a)-[r:LOCATED_IN]->(b);
MATCH (a {id: 'dist_554'}), (b {id: 'state_KA'}) MERGE (a)-[r:LOCATED_IN]->(b);
MATCH (a {id: 'trade_7421_0301'}), (b {id: 'sec_clean_energy'}) MERGE (a)-[r:IN_SECTOR]->(b);
MATCH (a {id: 'trade_7231_0102'}), (b {id: 'sec_auto_ev'}) MERGE (a)-[r:IN_SECTOR]->(b);
MATCH (a {id: 'trade_7411_0100'}), (b {id: 'sec_electrical'}) MERGE (a)-[r:IN_SECTOR]->(b);
MATCH (a {id: 'trade_2519_0301'}), (b {id: 'sec_it'}) MERGE (a)-[r:IN_SECTOR]->(b);
MATCH (a {id: 'trade_7231_0100'}), (b {id: 'sec_auto_ev'}) MERGE (a)-[r:IN_SECTOR]->(b);
MATCH (a {id: 'trade_7126_0100'}), (b {id: 'sec_construction'}) MERGE (a)-[r:IN_SECTOR]->(b);
MATCH (a {id: 'trade_7421_0301'}), (b {id: 'skill_pv_array'}) MERGE (a)-[r:REQUIRES_SKILL]->(b) {importance: 'mandatory'};
MATCH (a {id: 'trade_7421_0301'}), (b {id: 'skill_inverter_sync'}) MERGE (a)-[r:REQUIRES_SKILL]->(b) {importance: 'mandatory'};
MATCH (a {id: 'trade_7421_0301'}), (b {id: 'skill_hv_safety'}) MERGE (a)-[r:REQUIRES_SKILL]->(b) {importance: 'mandatory'};
MATCH (a {id: 'trade_7421_0301'}), (b {id: 'skill_multimeter'}) MERGE (a)-[r:REQUIRES_SKILL]->(b) {importance: 'mandatory'};
MATCH (a {id: 'trade_7231_0102'}), (b {id: 'skill_ev_battery'}) MERGE (a)-[r:REQUIRES_SKILL]->(b) {importance: 'mandatory'};
MATCH (a {id: 'trade_7231_0102'}), (b {id: 'skill_motor_drive'}) MERGE (a)-[r:REQUIRES_SKILL]->(b) {importance: 'mandatory'};
MATCH (a {id: 'trade_7231_0102'}), (b {id: 'skill_hv_safety'}) MERGE (a)-[r:REQUIRES_SKILL]->(b) {importance: 'mandatory'};
MATCH (a {id: 'trade_7231_0102'}), (b {id: 'skill_multimeter'}) MERGE (a)-[r:REQUIRES_SKILL]->(b) {importance: 'mandatory'};
MATCH (a {id: 'trade_7411_0100'}), (b {id: 'skill_earthing'}) MERGE (a)-[r:REQUIRES_SKILL]->(b) {importance: 'mandatory'};
MATCH (a {id: 'trade_7411_0100'}), (b {id: 'skill_switchgear'}) MERGE (a)-[r:REQUIRES_SKILL]->(b) {importance: 'mandatory'};
MATCH (a {id: 'trade_7411_0100'}), (b {id: 'skill_multimeter'}) MERGE (a)-[r:REQUIRES_SKILL]->(b) {importance: 'mandatory'};
MATCH (a {id: 'trade_7411_0100'}), (b {id: 'skill_hv_safety'}) MERGE (a)-[r:REQUIRES_SKILL]->(b) {importance: 'preferred'};
MATCH (a {id: 'trade_7231_0100'}), (b {id: 'skill_motor_drive'}) MERGE (a)-[r:REQUIRES_SKILL]->(b) {importance: 'preferred'};
MATCH (a {id: 'trade_7231_0100'}), (b {id: 'skill_multimeter'}) MERGE (a)-[r:REQUIRES_SKILL]->(b) {importance: 'mandatory'};
MATCH (a {id: 'trade_2519_0301'}), (b {id: 'skill_cv_bbox'}) MERGE (a)-[r:REQUIRES_SKILL]->(b) {importance: 'mandatory'};
MATCH (a {id: 'trade_2519_0301'}), (b {id: 'skill_sensor_fusion'}) MERGE (a)-[r:REQUIRES_SKILL]->(b) {importance: 'mandatory'};
MATCH (a {id: 'trade_7411_0100'}), (b {id: 'trade_7421_0301'}) MERGE (a)-[r:ADJACENT_TO]->(b) {source: 'trade_7411_0100', target: 'trade_7421_0301', similarity: 0.82, upskill_weeks: 6, readiness: 'Immediate (Short Course)'};
MATCH (a {id: 'trade_7411_0100'}), (b {id: 'trade_7231_0102'}) MERGE (a)-[r:ADJACENT_TO]->(b) {source: 'trade_7411_0100', target: 'trade_7231_0102', similarity: 0.76, upskill_weeks: 8, readiness: 'Moderate (Bridge Program)'};
MATCH (a {id: 'trade_7231_0100'}), (b {id: 'trade_7231_0102'}) MERGE (a)-[r:ADJACENT_TO]->(b) {source: 'trade_7231_0100', target: 'trade_7231_0102', similarity: 0.79, upskill_weeks: 6, readiness: 'Immediate (Short Course)'};
MATCH (a {id: 'emp_tata_solar'}), (b {id: 'dist_091'}) MERGE (a)-[r:OPERATES_IN]->(b);
MATCH (a {id: 'emp_tata_solar'}), (b {id: 'trade_7421_0301'}) MERGE (a)-[r:HIRING_FOR]->(b) {vacancies: 850};
MATCH (a {id: 'emp_adani_green'}), (b {id: 'dist_094'}) MERGE (a)-[r:OPERATES_IN]->(b);
MATCH (a {id: 'emp_adani_green'}), (b {id: 'trade_7421_0301'}) MERGE (a)-[r:HIRING_FOR]->(b) {vacancies: 620};
MATCH (a {id: 'emp_mahindra_ev'}), (b {id: 'dist_521'}) MERGE (a)-[r:OPERATES_IN]->(b);
MATCH (a {id: 'emp_mahindra_ev'}), (b {id: 'trade_7231_0102'}) MERGE (a)-[r:HIRING_FOR]->(b) {vacancies: 780};
MATCH (a {id: 'emp_tata_motors'}), (b {id: 'dist_521'}) MERGE (a)-[r:OPERATES_IN]->(b);
MATCH (a {id: 'emp_tata_motors'}), (b {id: 'trade_7231_0102'}) MERGE (a)-[r:HIRING_FOR]->(b) {vacancies: 640};
MATCH (a {id: 'emp_infosys_bpm'}), (b {id: 'dist_554'}) MERGE (a)-[r:OPERATES_IN]->(b);
MATCH (a {id: 'emp_infosys_bpm'}), (b {id: 'trade_2519_0301'}) MERGE (a)-[r:HIRING_FOR]->(b) {vacancies: 920};
MATCH (a {id: 'inst_iti_jaipur'}), (b {id: 'dist_091'}) MERGE (a)-[r:BASED_IN]->(b);
MATCH (a {id: 'inst_iti_jaipur'}), (b {id: 'trade_7421_0301'}) MERGE (a)-[r:OFFERS]->(b) {capacity: 240, certified: 195};
MATCH (a {id: 'inst_pmkvy_jaipur'}), (b {id: 'dist_091'}) MERGE (a)-[r:BASED_IN]->(b);
MATCH (a {id: 'inst_pmkvy_jaipur'}), (b {id: 'trade_7421_0301'}) MERGE (a)-[r:OFFERS]->(b) {capacity: 360, certified: 310};
MATCH (a {id: 'inst_iti_pune'}), (b {id: 'dist_521'}) MERGE (a)-[r:BASED_IN]->(b);
MATCH (a {id: 'inst_iti_pune'}), (b {id: 'trade_7231_0102'}) MERGE (a)-[r:OFFERS]->(b) {capacity: 300, certified: 245};
MATCH (a {id: 'inst_nsti_bengaluru'}), (b {id: 'dist_554'}) MERGE (a)-[r:BASED_IN]->(b);
MATCH (a {id: 'inst_nsti_bengaluru'}), (b {id: 'trade_2519_0301'}) MERGE (a)-[r:OFFERS]->(b) {capacity: 450, certified: 410};
MATCH (a {id: 'dist_091'}), (b {id: 'trade_7421_0301'}) MERGE (a)-[r:DEMANDS]->(b) {vacancies: 4200, gap: 1600, status: 'critical_shortage'};
MATCH (a {id: 'dist_091'}), (b {id: 'trade_7421_0301'}) MERGE (a)-[r:SUPPLIES]->(b) {certified_pipeline: 2600, retention_rate: 0.82};
MATCH (a {id: 'dist_088'}), (b {id: 'trade_7411_0100'}) MERGE (a)-[r:DEMANDS]->(b) {vacancies: 1700, gap: -1400, status: 'oversupply'};
MATCH (a {id: 'dist_088'}), (b {id: 'trade_7411_0100'}) MERGE (a)-[r:SUPPLIES]->(b) {certified_pipeline: 3100, retention_rate: 0.82};
MATCH (a {id: 'dist_521'}), (b {id: 'trade_7231_0102'}) MERGE (a)-[r:DEMANDS]->(b) {vacancies: 3800, gap: 1400, status: 'moderate_shortage'};
MATCH (a {id: 'dist_521'}), (b {id: 'trade_7231_0102'}) MERGE (a)-[r:SUPPLIES]->(b) {certified_pipeline: 2400, retention_rate: 0.82};
MATCH (a {id: 'dist_554'}), (b {id: 'trade_2519_0301'}) MERGE (a)-[r:DEMANDS]->(b) {vacancies: 3500, gap: 800, status: 'moderate_shortage'};
MATCH (a {id: 'dist_554'}), (b {id: 'trade_2519_0301'}) MERGE (a)-[r:SUPPLIES]->(b) {certified_pipeline: 2700, retention_rate: 0.82};