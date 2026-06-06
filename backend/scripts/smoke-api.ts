const API_URL = process.env.SMOKE_API_URL ?? "http://localhost:3001/api";

let cookie = "";

async function request(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (cookie) {
    headers.set("Cookie", cookie);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });
  const setCookie = response.headers.get("set-cookie");

  if (setCookie) {
    cookie = setCookie.split(";")[0];
  }

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`${options.method ?? "GET"} ${path} failed: ${response.status} ${body}`);
  }

  return body ? JSON.parse(body) : null;
}

async function main() {
  await request("/health");
  await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "user@banktax.local",
      password: "user123"
    })
  });
  await request("/auth/me");
  await request("/dashboard/summary");
  await request("/reports/yearly?year=2026");

  console.log("Smoke API checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
