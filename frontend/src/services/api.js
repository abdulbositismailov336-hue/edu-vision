const request = async (url, options = {}) => {
  const token = localStorage.getItem("school_ai_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) localStorage.removeItem("school_ai_token");
    throw new Error(data.error || "Server xatosi");
  }
  return data;
};

export const api = {
  login: (body) => request("/api/auth/login", { method:"POST", body:JSON.stringify(body) }),
  me: () => request("/api/auth/me"),
  schools: () => request("/api/schools"),
  createSchool: (body) => request("/api/schools", {method:"POST", body:JSON.stringify(body)}),
  users: () => request("/api/users"),
  createUser: (body) => request("/api/users", {method:"POST", body:JSON.stringify(body)}),
  news: () => request("/api/news"),
  createNews: (body) => request("/api/news", {method:"POST", body:JSON.stringify(body)}),
  updateNews: (id, body) => request(`/api/news/${id}`, {method:"PATCH", body:JSON.stringify(body)}),
  deleteNews: (id) => request(`/api/news/${id}`, {method:"DELETE"}),
  events: () => request("/api/events"),
  announcements: () => request("/api/announcements"),
  achievements: () => request("/api/achievements"),
  ai: (message) => request("/api/ai", {method:"POST", body:JSON.stringify({message})})
};
