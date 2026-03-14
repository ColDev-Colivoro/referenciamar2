import { apiRequest } from "@/lib/api/client"

export async function logout() {
  await apiRequest("/api/v1/auth/logout/", {
    method: "POST",
  })
}
