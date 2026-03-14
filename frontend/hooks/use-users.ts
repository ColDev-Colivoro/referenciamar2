"use client"

// Hook that encapsulates all user management state and API calls
// Exposes: users, roles, isLoading, error, refresh, createUser, updateMembership, deactivateUser

import { useCallback, useEffect, useMemo, useState } from "react"

import { ApiError } from "@/lib/api/client"
import {
  listUsers,
  listRoles,
  createUser as createUserApi,
  updateMembership as updateMembershipApi,
  deactivateUser as deactivateUserApi,
} from "@/lib/users/api"
import type { CreateUserInput, Role, UpdateMembershipInput, UserMembership } from "@/lib/users/types"

export function useUsers() {
  const [users, setUsers] = useState<UserMembership[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const [memberships, roleList] = await Promise.all([listUsers(), listRoles()])
      setUsers(memberships)
      setRoles(roleList)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No fue posible cargar los datos.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createUser = useCallback(async (input: CreateUserInput) => {
    const newMembership = await createUserApi(input)
    setUsers((current) => [newMembership, ...current])
    return newMembership
  }, [])

  const updateMembership = useCallback(async (id: number, input: UpdateMembershipInput) => {
    const updated = await updateMembershipApi(id, input)
    setUsers((current) => current.map((m) => (m.id === id ? updated : m)))
    return updated
  }, [])

  const deactivateUser = useCallback(async (id: number) => {
    await deactivateUserApi(id)
    setUsers((current) => current.filter((m) => m.id !== id))
  }, [])

  return useMemo(
    () => ({ users, roles, isLoading, error, refresh, createUser, updateMembership, deactivateUser }),
    [users, roles, isLoading, error, refresh, createUser, updateMembership, deactivateUser],
  )
}
