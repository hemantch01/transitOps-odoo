const BASE = "/api";

async function request(url: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.error?.message || `request failed (${res.status})`;
    const err: any = new Error(message);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  // csv download
  if (res.headers.get("Content-Type")?.includes("text/csv")) {
    return res.blob();
  }

  return res.json();
}

export const api = {
  get: (url: string) => request(url),
  post: (url: string, data: any) => request(url, { method: "POST", body: JSON.stringify(data) }),
  put: (url: string, data: any) => request(url, { method: "PUT", body: JSON.stringify(data) }),
  delete: (url: string) => request(url, { method: "DELETE" }),
};
