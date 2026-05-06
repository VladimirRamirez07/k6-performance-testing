# k6 Performance Testing Suite

![k6](https://img.shields.io/badge/k6-7D64FF?style=for-the-badge&logo=k6&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

Performance testing suite for REST APIs using **k6**, with real-time visualization via **Grafana + InfluxDB** and continuous integration with **GitHub Actions**.

---

## Test Types

| Type   | Description                                  | Max VUs | Duration  |
|--------|----------------------------------------------|---------|-----------|
| Load   | Steady, sustained load simulation            | 20      | ~3.5 min  |
| Stress | Push beyond capacity to find breaking point  | 200     | ~8 min    |
| Spike  | Sudden dramatic traffic burst simulation     | 500     | ~2.5 min  |
| Soak   | Long endurance run to detect memory leaks    | 20      | ~34 min   |

---

## Project Structure

```
k6-performance-testing/
├── .github/
│   └── workflows/
│       └── performance-tests.yml   # CI/CD pipeline
├── config/
│   └── config.js                   # Centralized configuration and thresholds
├── grafana/
│   └── provisioning/
│       ├── dashboards/
│       │   └── dashboards.yml      # Dashboard provisioning config
│       └── datasources/
│           └── influxdb.yml        # InfluxDB datasource config
├── tests/
│   ├── load/
│   │   └── load-test.js            # Steady load simulation
│   ├── stress/
│   │   └── stress-test.js          # Breaking point detection
│   ├── spike/
│   │   └── spike-test.js           # Sudden traffic burst
│   └── soak/
│       └── soak-test.js            # 30-minute endurance run
├── utils/
│   └── helpers.js                  # Data factories and utilities
├── .env.example                    # Environment variables template
├── .gitignore
└── docker-compose.yml              # k6 + InfluxDB + Grafana stack
```

---

## Requirements

- [k6](https://k6.io/docs/getting-started/installation/) v0.45+
- [Docker](https://www.docker.com/) + Docker Compose *(for Grafana dashboard)*

---

## Installation

```bash
git clone https://github.com/VladimirRamirez07/k6-performance-testing.git
cd k6-performance-testing
```

---

## Running Tests Locally

```bash
# Load test
k6 run tests/load/load-test.js

# Stress test
k6 run tests/stress/stress-test.js

# Spike test
k6 run tests/spike/spike-test.js

# Soak test (30 minutes)
k6 run tests/soak/soak-test.js
```

---

## Thresholds

### Load Test
| Metric                  | Threshold  |
|-------------------------|------------|
| `http_req_duration` p95 | < 500ms    |
| `http_req_duration` p99 | < 1000ms   |
| `http_req_failed`       | < 1%       |

### Stress Test
| Metric                  | Threshold  |
|-------------------------|------------|
| `http_req_duration` p95 | < 2000ms   |
| `http_req_failed`       | < 10%      |

### Soak Test
| Metric                  | Threshold  |
|-------------------------|------------|
| `http_req_duration` p95 | < 500ms    |
| `http_req_failed`       | < 1%       |

---

## CI/CD

The pipeline triggers on:
- Push to `main` or `develop`
- Pull requests to `main`
- Scheduled daily at 02:00 UTC
- Manual trigger via `workflow_dispatch`

---

## Author

**Vladimir Ramirez** — [@VladimirRamirez07](https://github.com/VladimirRamirez07)

Software Engineering Student | QA & Testing | Performance Engineering