# Framework
- NestJS@11.1.18
- Biome@2.4

# DB
- PostgreSQL@18.3
    - Use Docker
# ORM
- Prisma@7.6.0

# Logging
- Grafana Alloy@1.15.0
- Prometheus@3.11.0
- Loki@3.7.1
- Tempo@2.10.3
- Grafana@12.4.2

## Logging Architect
0. NestJS(로그 발생)
1. Grafana Alloy (수집/가공)
1.1. Prometheus (메트릭)
1.2. Loki (로그)
1.3. Tempo (트레이스)
2. Grafana (조회/대시보드/알림)
