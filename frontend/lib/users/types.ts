export interface Role {
  id: number
  code: string
  name: string
  permissions: string[]
}

export interface UserMembership {
  id: number
  user_id: number
  username: string
  full_name: string
  email: string
  role: Role
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserInput {
  username: string
  password: string
  first_name?: string
  last_name?: string
  email?: string
  role_id: number
}

export interface UpdateMembershipInput {
  role_id?: number
  is_active?: boolean
}
