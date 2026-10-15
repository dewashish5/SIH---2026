"""
SkillGap Neo4j Seeder & Cypher Exporter
Generates authoritative Cypher DDL/DML and seeds live Neo4j instances.
"""
import os
import sys
from pathlib import Path

# Add parent directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from services.neo4j_service import neo4j_service


def generate_cypher_export(output_path: str):
    """Writes all node and relationship Cypher queries to a .cypher file."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    lines = [
        "// ===================================================================",
        "// SkillGap Intelligence Neo4j Knowledge Graph Seed (PS 26246)",
        "// Real Government Data Topology: MSDE, NCS, PMKVY, NQR",
        "// ===================================================================",
        "",
        "// 1. Constraints",
        "CREATE CONSTRAINT trade_id_unique IF NOT EXISTS FOR (t:Trade) REQUIRE t.id IS UNIQUE;",
        "CREATE CONSTRAINT district_id_unique IF NOT EXISTS FOR (d:District) REQUIRE d.id IS UNIQUE;",
        "CREATE CONSTRAINT skill_id_unique IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE;",
        ""
    ]

    # Nodes
    lines.append("// 2. Nodes")
    for node in neo4j_service.nodes.values():
        label = node["label"]
        props = node["properties"]
        prop_str_parts = []
        for k, v in props.items():
            if isinstance(v, str):
                safe_val = v.replace("'", "\\'")
                prop_str_parts.append(f"{k}: '{safe_val}'")
            elif isinstance(v, (int, float)):
                prop_str_parts.append(f"{k}: {v}")
            elif isinstance(v, bool):
                prop_str_parts.append(f"{k}: {str(v).lower()}")
        prop_str = ", ".join(prop_str_parts)
        lines.append(f"MERGE (n:{label} {{id: '{node['id']}'}}) SET n += {{{prop_str}}};")

    lines.append("")
    lines.append("// 3. Relationships")
    for edge in neo4j_service.edges:
        rel_type = edge["type"]
        props = edge["properties"]
        prop_str_parts = []
        for k, v in props.items():
            if isinstance(v, str):
                safe_val = v.replace("'", "\\'")
                prop_str_parts.append(f"{k}: '{safe_val}'")
            elif isinstance(v, (int, float)):
                prop_str_parts.append(f"{k}: {v}")
            elif isinstance(v, bool):
                prop_str_parts.append(f"{k}: {str(v).lower()}")
        prop_str = f" {{{', '.join(prop_str_parts)}}}" if prop_str_parts else ""

        lines.append(
            f"MATCH (a {{id: '{edge['source']}'}}), (b {{id: '{edge['target']}'}}) "
            f"MERGE (a)-[r:{rel_type}]->(b){prop_str};"
        )

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Generated Cypher export at: {output_path}")
    print(f"Total Nodes: {len(neo4j_service.nodes)}, Total Edges: {len(neo4j_service.edges)}")


def main():
    root_dir = Path(__file__).resolve().parent.parent.parent.parent
    cypher_path = str(root_dir / "data" / "seed" / "skillgap_graph.cypher")
    generate_cypher_export(cypher_path)


if __name__ == "__main__":
    main()
