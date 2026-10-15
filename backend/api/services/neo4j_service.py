"""
SkillGap Neo4j Graph Database Service
Provides Neo4j Bolt connectivity, Cypher execution, and resilient in-memory fallback.
"""
import logging
from typing import Dict, List, Any, Optional
from config import settings

logger = logging.getLogger(__name__)

# Try importing neo4j driver
try:
    from neo4j import GraphDatabase, AsyncGraphDatabase
    NEO4J_DRIVER_AVAILABLE = True
except ImportError:
    GraphDatabase = None
    AsyncGraphDatabase = None
    NEO4J_DRIVER_AVAILABLE = False


class Neo4jService:
    def __init__(self):
        self.uri = settings.NEO4J_URI
        self.user = settings.NEO4J_USER
        self.password = settings.NEO4J_PASSWORD
        self.database = settings.NEO4J_DATABASE
        self.driver = None
        self.is_connected = False
        self._init_in_memory_store()
        self._attempt_connection()

    def _attempt_connection(self):
        if not NEO4J_DRIVER_AVAILABLE:
            logger.info("neo4j python package not available. Using In-Memory Graph Engine.")
            return

        try:
            self.driver = GraphDatabase.driver(
                self.uri,
                auth=(self.user, self.password),
                connection_timeout=2.0
            )
            # Verify connectivity
            self.driver.verify_connectivity()
            self.is_connected = True
            logger.info(f"Connected to Neo4j instance at {self.uri} (database: {self.database})")
            # Seed graph into live Neo4j instance
            self._seed_live_neo4j()
        except Exception as e:
            logger.info(f"Neo4j Bolt connection to {self.uri} failed ({str(e)}). Activating In-Memory Graph Fallback Engine.")
            self.is_connected = False
            self.driver = None

    def _init_in_memory_store(self):
        """Initializes authoritative LMIS knowledge graph nodes and edges."""
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: List[Dict[str, Any]] = []

        # 1. State Nodes
        states = [
            {"id": "state_RJ", "label": "State", "name": "Rajasthan", "code": "08", "vacancies": 18690, "employers": 53474},
            {"id": "state_MH", "label": "State", "name": "Maharashtra", "code": "27", "vacancies": 119141, "employers": 158407},
            {"id": "state_KA", "label": "State", "name": "Karnataka", "code": "29", "vacancies": 83223, "employers": 45123},
        ]
        for s in states:
            self._add_node(s["id"], "State", s)

        # 2. District Nodes
        districts = [
            {"id": "dist_091", "name": "Jaipur", "state": "Rajasthan", "state_id": "state_RJ", "pmkvy_certified": 6026, "weight": 0.158},
            {"id": "dist_088", "name": "Bhilwara", "state": "Rajasthan", "state_id": "state_RJ", "pmkvy_certified": 1120, "weight": 0.029},
            {"id": "dist_094", "name": "Jodhpur", "state": "Rajasthan", "state_id": "state_RJ", "pmkvy_certified": 1383, "weight": 0.036},
            {"id": "dist_521", "name": "Pune", "state": "Maharashtra", "state_id": "state_MH", "pmkvy_certified": 4206, "weight": 0.105},
            {"id": "dist_505", "name": "Nagpur", "state": "Maharashtra", "state_id": "state_MH", "pmkvy_certified": 1740, "weight": 0.043},
            {"id": "dist_554", "name": "Bengaluru Urban", "state": "Karnataka", "state_id": "state_KA", "pmkvy_certified": 4090, "weight": 0.176},
        ]
        for d in districts:
            self._add_node(d["id"], "District", d)
            self._add_edge(d["id"], d["state_id"], "LOCATED_IN", {})

        # 3. Sector Nodes
        sectors = [
            {"id": "sec_clean_energy", "name": "Solar & Clean Energy", "priority": "high"},
            {"id": "sec_auto_ev", "name": "Automotive & Electric Vehicles", "priority": "high"},
            {"id": "sec_electrical", "name": "Electronics & Electrical", "priority": "medium"},
            {"id": "sec_it", "name": "IT-ITeS & Digital Services", "priority": "high"},
            {"id": "sec_construction", "name": "Construction & Infrastructure", "priority": "medium"},
        ]
        for sec in sectors:
            self._add_node(sec["id"], "Sector", sec)

        # 4. Trade Nodes
        trades = [
            {
                "id": "trade_7421_0301",
                "code": "7421.0301",
                "name": "Solar PV Technician",
                "sector_id": "sec_clean_energy",
                "nsqf": 4,
                "nqr_code": "QG-04-ES-02628-2024-V2-SCGJ",
                "status": "active"
            },
            {
                "id": "trade_7231_0102",
                "code": "7231.0102",
                "name": "EV Service Technician",
                "sector_id": "sec_auto_ev",
                "nsqf": 4,
                "nqr_code": "QG-04-AU-03586-2025-V2-ASDC",
                "status": "active"
            },
            {
                "id": "trade_7411_0100",
                "code": "7411.0100",
                "name": "Electrician",
                "sector_id": "sec_electrical",
                "nsqf": 4,
                "nqr_code": "2022/EHW/ESSC/06452",
                "status": "active"
            },
            {
                "id": "trade_2519_0301",
                "code": "2519.0301",
                "name": "AI Data Annotator",
                "sector_id": "sec_it",
                "nsqf": 5,
                "nqr_code": "QG-4.5-IT-00349-2023-V1-NIELIT",
                "status": "active"
            },
            {
                "id": "trade_7231_0100",
                "code": "7231.0100",
                "name": "Automotive Service Technician",
                "sector_id": "sec_auto_ev",
                "nsqf": 4,
                "nqr_code": "QG-04-AU-02943-2024-V2-ASDC",
                "status": "active"
            },
            {
                "id": "trade_7126_0100",
                "code": "7126.0100",
                "name": "Plumber",
                "sector_id": "sec_construction",
                "nsqf": 3.5,
                "nqr_code": "QG-3.5-PL-03196-2024-V2-DGT",
                "status": "active"
            }
        ]
        for t in trades:
            self._add_node(t["id"], "Trade", t)
            self._add_edge(t["id"], t["sector_id"], "IN_SECTOR", {})

        # 5. Skill Nodes
        skills = [
            {"id": "skill_pv_array", "name": "Solar PV Array Installation & Wiring", "category": "Domain Technical"},
            {"id": "skill_inverter_sync", "name": "Grid Tie Inverter Synchronization", "category": "Domain Technical"},
            {"id": "skill_hv_safety", "name": "High Voltage DC Safety Protocols", "category": "Safety Standard"},
            {"id": "skill_ev_battery", "name": "EV Lithium Battery Pack Diagnostics", "category": "Domain Technical"},
            {"id": "skill_motor_drive", "name": "Electric Motor Drive Testing", "category": "Domain Technical"},
            {"id": "skill_earthing", "name": "Single/Three Phase Earthing & Wiring", "category": "Core Foundation"},
            {"id": "skill_switchgear", "name": "Industrial Switchgear & Relays", "category": "Core Foundation"},
            {"id": "skill_multimeter", "name": "Insulation Resistance & Multimeter Testing", "category": "Diagnostic Testing"},
            {"id": "skill_cv_bbox", "name": "Computer Vision Bounding Box Annotation", "category": "Digital AI"},
            {"id": "skill_sensor_fusion", "name": "LiDAR Point Cloud Labeling", "category": "Digital AI"},
        ]
        for sk in skills:
            self._add_node(sk["id"], "Skill", sk)

        # 6. Skill Requirements (:Trade -[:REQUIRES_SKILL]-> :Skill)
        skill_links = [
            ("trade_7421_0301", "skill_pv_array", "mandatory"),
            ("trade_7421_0301", "skill_inverter_sync", "mandatory"),
            ("trade_7421_0301", "skill_hv_safety", "mandatory"),
            ("trade_7421_0301", "skill_multimeter", "mandatory"),
            ("trade_7231_0102", "skill_ev_battery", "mandatory"),
            ("trade_7231_0102", "skill_motor_drive", "mandatory"),
            ("trade_7231_0102", "skill_hv_safety", "mandatory"),
            ("trade_7231_0102", "skill_multimeter", "mandatory"),
            ("trade_7411_0100", "skill_earthing", "mandatory"),
            ("trade_7411_0100", "skill_switchgear", "mandatory"),
            ("trade_7411_0100", "skill_multimeter", "mandatory"),
            ("trade_7411_0100", "skill_hv_safety", "preferred"),
            ("trade_7231_0100", "skill_motor_drive", "preferred"),
            ("trade_7231_0100", "skill_multimeter", "mandatory"),
            ("trade_2519_0301", "skill_cv_bbox", "mandatory"),
            ("trade_2519_0301", "skill_sensor_fusion", "mandatory"),
        ]
        for t_id, sk_id, importance in skill_links:
            self._add_edge(t_id, sk_id, "REQUIRES_SKILL", {"importance": importance})

        # 7. Career Transition / Skill Adjacency (:Trade -[:ADJACENT_TO]-> :Trade)
        adjacencies = [
            {
                "source": "trade_7411_0100",
                "target": "trade_7421_0301",
                "similarity": 0.82,
                "shared_skills": ["Multimeter & Testing", "High Voltage Safety"],
                "gap_skills": ["PV Array Wiring", "Inverter Sync"],
                "upskill_weeks": 6,
                "readiness": "Immediate (Short Course)"
            },
            {
                "source": "trade_7411_0100",
                "target": "trade_7231_0102",
                "similarity": 0.76,
                "shared_skills": ["Earthing & Circuit Testing", "Safety"],
                "gap_skills": ["Lithium Battery Diagnostics", "Motor Drives"],
                "upskill_weeks": 8,
                "readiness": "Moderate (Bridge Program)"
            },
            {
                "source": "trade_7231_0100",
                "target": "trade_7231_0102",
                "similarity": 0.79,
                "shared_skills": ["Vehicle Mechanics", "Brake & Chassis"],
                "gap_skills": ["High Voltage Battery", "Inverter Power Electronics"],
                "upskill_weeks": 6,
                "readiness": "Immediate (Short Course)"
            }
        ]
        for adj in adjacencies:
            self._add_edge(adj["source"], adj["target"], "ADJACENT_TO", adj)

        # 8. Employer Nodes (:Employer -[:OPERATES_IN]-> :District, -[:HIRING_FOR]-> :Trade)
        employers = [
            {"id": "emp_tata_solar", "name": "Tata Power Solar Systems", "district_id": "dist_091", "trade_id": "trade_7421_0301", "openings": 850},
            {"id": "emp_adani_green", "name": "Adani Solar Renewables", "district_id": "dist_094", "trade_id": "trade_7421_0301", "openings": 620},
            {"id": "emp_mahindra_ev", "name": "Mahindra Electric Mobility Ltd", "district_id": "dist_521", "trade_id": "trade_7231_0102", "openings": 780},
            {"id": "emp_tata_motors", "name": "Tata Motors EV Division", "district_id": "dist_521", "trade_id": "trade_7231_0102", "openings": 640},
            {"id": "emp_infosys_bpm", "name": "Infosys BPM AI Services", "district_id": "dist_554", "trade_id": "trade_2519_0301", "openings": 920},
        ]
        for e in employers:
            self._add_node(e["id"], "Employer", e)
            self._add_edge(e["id"], e["district_id"], "OPERATES_IN", {})
            self._add_edge(e["id"], e["trade_id"], "HIRING_FOR", {"vacancies": e["openings"]})

        # 9. Training Institute Nodes (:Institute -[:BASED_IN]-> :District, -[:OFFERS]-> :Trade)
        institutes = [
            {"id": "inst_iti_jaipur", "name": "Govt ITI Jaipur Central", "district_id": "dist_091", "trade_id": "trade_7421_0301", "capacity": 240, "certified": 195},
            {"id": "inst_pmkvy_jaipur", "name": "PMKVY Suryamitra Kendra Jaipur", "district_id": "dist_091", "trade_id": "trade_7421_0301", "capacity": 360, "certified": 310},
            {"id": "inst_iti_pune", "name": "Industrial Training Institute Aundh Pune", "district_id": "dist_521", "trade_id": "trade_7231_0102", "capacity": 300, "certified": 245},
            {"id": "inst_nsti_bengaluru", "name": "National Skill Training Institute Bengaluru", "district_id": "dist_554", "trade_id": "trade_2519_0301", "capacity": 450, "certified": 410},
        ]
        for ins in institutes:
            self._add_node(ins["id"], "Institute", ins)
            self._add_edge(ins["id"], ins["district_id"], "BASED_IN", {})
            self._add_edge(ins["id"], ins["trade_id"], "OFFERS", {"capacity": ins["capacity"], "certified": ins["certified"]})

        # 10. District Demand & Supply Edges (:District -[:DEMANDS]-> :Trade, :District -[:SUPPLIES]-> :Trade)
        demand_supply_links = [
            ("dist_091", "trade_7421_0301", 4200, 2600, "critical_shortage"),
            ("dist_088", "trade_7411_0100", 1700, 3100, "oversupply"),
            ("dist_521", "trade_7231_0102", 3800, 2400, "moderate_shortage"),
            ("dist_554", "trade_2519_0301", 3500, 2700, "moderate_shortage"),
        ]
        for dist_id, tr_id, dem, sup, status in demand_supply_links:
            self._add_edge(dist_id, tr_id, "DEMANDS", {"vacancies": dem, "gap": dem - sup, "status": status})
            self._add_edge(dist_id, tr_id, "SUPPLIES", {"certified_pipeline": sup, "retention_rate": 0.82})

    def _add_node(self, node_id: str, label: str, properties: Dict[str, Any]):
        self.nodes[node_id] = {
            "id": node_id,
            "label": label,
            "properties": properties
        }

    def _add_edge(self, source: str, target: str, rel_type: str, properties: Dict[str, Any]):
        self.edges.append({
            "id": f"{source}_{rel_type}_{target}",
            "source": source,
            "target": target,
            "type": rel_type,
            "properties": properties
        })

    def _seed_live_neo4j(self):
        """Executes Cypher statements to seed the graph in a running Neo4j instance."""
        if not self.driver or not self.is_connected:
            return

        try:
            with self.driver.session(database=self.database) as session:
                # Create constraints
                session.run("CREATE CONSTRAINT trade_id_unique IF NOT EXISTS FOR (t:Trade) REQUIRE t.id IS UNIQUE")
                session.run("CREATE CONSTRAINT district_id_unique IF NOT EXISTS FOR (d:District) REQUIRE d.id IS UNIQUE")
                session.run("CREATE CONSTRAINT skill_id_unique IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE")

                # Insert Nodes
                for node in self.nodes.values():
                    label = node["label"]
                    props = node["properties"]
                    query = f"MERGE (n:{label} {{id: $id}}) SET n += $props"
                    session.run(query, id=node["id"], props=props)

                # Insert Edges
                for edge in self.edges:
                    rel_type = edge["type"]
                    props = edge["properties"]
                    query = f"""
                    MATCH (a {{id: $source}}), (b {{id: $target}})
                    MERGE (a)-[r:{rel_type}]->(b)
                    SET r += $props
                    """
                    session.run(query, source=edge["source"], target=edge["target"], props=props)
                logger.info(f"Successfully seeded {len(self.nodes)} nodes and {len(self.edges)} edges into Neo4j.")
        except Exception as e:
            logger.warning(f"Error seeding live Neo4j: {str(e)}")

    def get_status(self) -> Dict[str, Any]:
        """Returns connection and topology status."""
        return {
            "driver_installed": NEO4J_DRIVER_AVAILABLE,
            "is_connected": self.is_connected,
            "connection_mode": "NEO4J_BOLT_CONNECTED" if self.is_connected else "IN_MEMORY_GRAPH_FALLBACK",
            "bolt_uri": self.uri,
            "database": self.database,
            "total_nodes": len(self.nodes),
            "total_edges": len(self.edges),
            "node_labels": list(set(n["label"] for n in self.nodes.values())),
            "edge_types": list(set(e["type"] for e in self.edges))
        }

    def get_overview(self) -> Dict[str, Any]:
        """Provides macro graph statistics and structural insights."""
        node_counts = {}
        for n in self.nodes.values():
            lbl = n["label"]
            node_counts[lbl] = node_counts.get(lbl, 0) + 1

        edge_counts = {}
        for e in self.edges:
            t = e["type"]
            edge_counts[t] = edge_counts.get(t, 0) + 1

        # Hub nodes with highest in/out degree
        degree = {}
        for e in self.edges:
            degree[e["source"]] = degree.get(e["source"], 0) + 1
            degree[e["target"]] = degree.get(e["target"], 0) + 1

        top_hubs = []
        for n_id, deg in sorted(degree.items(), key=lambda x: x[1], reverse=True)[:5]:
            node = self.nodes.get(n_id)
            if node:
                top_hubs.append({
                    "id": n_id,
                    "name": node["properties"].get("name", n_id),
                    "label": node["label"],
                    "degree": deg
                })

        return {
            "status": self.get_status(),
            "node_counts": node_counts,
            "edge_counts": edge_counts,
            "top_hubs": top_hubs,
            "graph_density": round(len(self.edges) / (len(self.nodes) * (len(self.nodes) - 1)) if len(self.nodes) > 1 else 0, 4),
            "communities": ["Clean Energy Hub (Jaipur)", "Automotive EV Cluster (Pune)", "Digital AI Hub (Bengaluru)"]
        }

    def get_lineage(self, trade_code: Optional[str] = None, district_id: Optional[str] = None) -> Dict[str, Any]:
        """Returns targeted sub-graph for a trade and district."""
        # Find matching trade
        target_trade_id = None
        for n_id, n in self.nodes.items():
            if n["label"] == "Trade":
                if trade_code and n["properties"].get("code") == trade_code:
                    target_trade_id = n_id
                    break
        if not target_trade_id:
            target_trade_id = "trade_7421_0301"  # Default Solar PV Tech

        target_dist_id = f"dist_{district_id}" if district_id and f"dist_{district_id}" in self.nodes else "dist_091"

        # Collect relevant nodes and edges
        subgraph_node_ids = {target_trade_id, target_dist_id}
        subgraph_edges = []

        for e in self.edges:
            if e["source"] == target_trade_id or e["target"] == target_trade_id or \
               e["source"] == target_dist_id or e["target"] == target_dist_id:
                subgraph_node_ids.add(e["source"])
                subgraph_node_ids.add(e["target"])
                subgraph_edges.append(e)

        subgraph_nodes = [self.nodes[n_id] for n_id in subgraph_node_ids if n_id in self.nodes]

        return {
            "focus": {
                "trade": self.nodes.get(target_trade_id),
                "district": self.nodes.get(target_dist_id)
            },
            "nodes": subgraph_nodes,
            "edges": subgraph_edges
        }

    def get_career_pathways(self, trade_code: Optional[str] = None) -> Dict[str, Any]:
        """Returns adjacent trade transitions and transferable skill breakdown."""
        target_trade_id = "trade_7411_0100"  # Default Electrician
        if trade_code:
            for n_id, n in self.nodes.items():
                if n["label"] == "Trade" and n["properties"].get("code") == trade_code:
                    target_trade_id = n_id
                    break

        pathways = []
        for e in self.edges:
            if e["type"] == "ADJACENT_TO" and (e["source"] == target_trade_id or e["target"] == target_trade_id):
                other_id = e["target"] if e["source"] == target_trade_id else e["source"]
                other_trade = self.nodes.get(other_id)
                pathways.append({
                    "relationship": e["properties"],
                    "source_trade": self.nodes.get(e["source"]),
                    "target_trade": other_trade
                })

        return {
            "base_trade": self.nodes.get(target_trade_id),
            "adjacent_pathways": pathways
        }

    def run_cypher(self, query: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Executes a Cypher query on live Neo4j or through pattern simulation."""
        query_strip = query.strip()
        params = params or {}

        # 1. If connected to live Neo4j, execute real Cypher
        if self.is_connected and self.driver:
            try:
                with self.driver.session(database=self.database) as session:
                    result = session.run(query_strip, params)
                    records = [record.data() for record in result]
                    return {
                        "mode": "NEO4J_BOLT_LIVE",
                        "status": "SUCCESS",
                        "query": query_strip,
                        "records_count": len(records),
                        "records": records
                    }
            except Exception as e:
                return {
                    "mode": "NEO4J_BOLT_LIVE",
                    "status": "ERROR",
                    "query": query_strip,
                    "error": str(e)
                }

        # 2. Resilient In-Memory Evaluator
        lower_q = query_strip.lower()
        matched_records = []

        if "skill" in lower_q and ("trade" in lower_q or "requires" in lower_q):
            # MATCH (t:Trade)-[:REQUIRES_SKILL]->(s:Skill)
            for e in self.edges:
                if e["type"] == "REQUIRES_SKILL":
                    t = self.nodes.get(e["source"])
                    s = self.nodes.get(e["target"])
                    if t and s:
                        matched_records.append({
                            "trade": t["properties"].get("name"),
                            "skill": s["properties"].get("name"),
                            "importance": e["properties"].get("importance")
                        })
        elif "adjacent" in lower_q or "pathway" in lower_q:
            # MATCH (a:Trade)-[r:ADJACENT_TO]->(b:Trade)
            for e in self.edges:
                if e["type"] == "ADJACENT_TO":
                    a = self.nodes.get(e["source"])
                    b = self.nodes.get(e["target"])
                    if a and b:
                        matched_records.append({
                            "from_trade": a["properties"].get("name"),
                            "to_trade": b["properties"].get("name"),
                            "similarity": e["properties"].get("similarity"),
                            "upskill_weeks": e["properties"].get("upskill_weeks")
                        })
        elif "employer" in lower_q:
            # MATCH (e:Employer)-[:HIRING_FOR]->(t:Trade)
            for e in self.edges:
                if e["type"] == "HIRING_FOR":
                    emp = self.nodes.get(e["source"])
                    tr = self.nodes.get(e["target"])
                    if emp and tr:
                        matched_records.append({
                            "employer": emp["properties"].get("name"),
                            "trade": tr["properties"].get("name"),
                            "vacancies": e["properties"].get("vacancies")
                        })
        elif "district" in lower_q and ("demands" in lower_q or "gap" in lower_q):
            # MATCH (d:District)-[r:DEMANDS]->(t:Trade)
            for e in self.edges:
                if e["type"] == "DEMANDS":
                    d = self.nodes.get(e["source"])
                    t = self.nodes.get(e["target"])
                    if d and t:
                        matched_records.append({
                            "district": d["properties"].get("name"),
                            "trade": t["properties"].get("name"),
                            "vacancies": e["properties"].get("vacancies"),
                            "severity": e["properties"].get("status")
                        })
        else:
            # General node sampling
            for n in list(self.nodes.values())[:10]:
                matched_records.append({
                    "id": n["id"],
                    "label": n["label"],
                    "name": n["properties"].get("name")
                })

        return {
            "mode": "IN_MEMORY_GRAPH_ENGINE",
            "status": "SUCCESS",
            "query": query_strip,
            "records_count": len(matched_records),
            "records": matched_records
        }


# Singleton instance
neo4j_service = Neo4jService()
