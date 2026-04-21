import os

from locust import HttpUser, between, task

# Dashboard-first configuration.
# Run with UI:
#   locust -f locustfile.py -H http://app.35.190.27.11.nip.io
# Then open:
#   http://localhost:8089

FRONTEND_PATH = os.getenv("FRONTEND_PATH", "/")
BACKEND_PATH = os.getenv("BACKEND_PATH", "/api/healthz")


class APSASFailoverDemo(HttpUser):
    # Keep traffic steady so charts in Locust UI are easy to observe.
    wait_time = between(0.1, 0.4)

    @task(1)
    def frontend_home(self):
        with self.client.get(FRONTEND_PATH, name="frontend:/", catch_response=True) as resp:
            if 200 <= resp.status_code < 400:
                resp.success()
            else:
                resp.failure(f"frontend status={resp.status_code}")

    @task(3)
    def backend_health(self):
        with self.client.get(BACKEND_PATH, name="backend:/api/healthz", catch_response=True) as resp:
            if resp.status_code == 200:
                resp.success()
            else:
                resp.failure(f"backend status={resp.status_code}")