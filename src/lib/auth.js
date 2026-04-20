export function getUser() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    localStorage.removeItem("userToken");
    window.location.href = "/home";
  }
}
