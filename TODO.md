# TODO

- [x] Fix `/api/weather/current` 503 cause by removing/ignoring mock-mode failure (keep real WeatherAI only).
- [x] Ensure backend cleanly fails with 503 when WeatherAI is unreachable, but without any mock-related branches.

- [ ] Address separate DB issue causing `/api/weather/trends` 500 (SSL connection closed unexpectedly) by stabilizing PostgreSQL SSL / connection parameters.
- [ ] Verify endpoints: `/api/weather/current`, `/api/weather/forecast`, `/api/weather/trends` all behave correctly.

