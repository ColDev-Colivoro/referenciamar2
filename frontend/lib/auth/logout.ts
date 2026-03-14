import { apiRequest } from "@/lib/api/client"
import { clearToken } from "@/lib/auth/token"

export async function logout() {
  await apiRequest("/api/v1/auth/logout/", {
    method: "POST",
  })
  clearToken()
}
