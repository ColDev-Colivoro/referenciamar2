import { apiRequest } from "@/lib/api/client"

import type { CreateUserInput, Role, UpdateMembershipInput, UserMembership } from "@/lib/users/types"

export function listUsers() {
  return apiRequest<UserMembership[]>("/api/v1/users/")
}

export function listRoles() {
  return apiRequest<Role[]>("/api/v1/users/roles/")
}

export function createUser(input: CreateUserInput) {
  return apiRequest<UserMembership>("/api/v1/users/", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateMembership(membershipId: number, input: UpdateMembershipInput) {
  return apiRequest<UserMembership>(`/api/v1/users/${membershipId}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}
