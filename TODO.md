## Render deployment debugging checklist

- [x] Identify `requirements.txt` location issue (Render working directory)
- [x] Verify `backend/requirements.txt` contains PostgreSQL driver (`psycopg2-binary`)
- [ ] Force Render Python to 3.12 (add `backend/runtime.txt` or `.python-version`)
- [ ] Redeploy and confirm build log installs `psycopg2-binary`
- [ ] If still failing, check if Render is ignoring/using a different requirements file

