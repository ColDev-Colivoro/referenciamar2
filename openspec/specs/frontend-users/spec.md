# Frontend Users Specification — ColdevConAC

## Purpose

Define the behavior of the frontend user management layer in the Next.js 15 application.
This spec covers the React hook that manages user/role state and the `UserManagement`
component that renders the admin UI.

The frontend layer consumes the backend users API. It does NOT own business logic —
authorization decisions are always enforced by the backend.

---

## Requirements

### Requirement: Centralized User State via Hook

The system MUST provide a `useUsers()` hook that encapsulates all API calls
for user management and exposes consistent loading, error, and data state.

The hook MUST expose: `users`, `roles`, `isLoading`, `error`, and functions
`refresh()`, `createUser()`, `updateMembership()`, `deactivateUser()`.

The hook MUST initialize by fetching both `users` and `roles` on mount.

#### Scenario: Hook loads users and roles on mount

- GIVEN a component mounts with `useUsers()`
- WHEN the hook initializes
- THEN `isLoading` is `true` during the fetch
- AND once complete, `users` contains the list from the backend
- AND `roles` contains the list from the backend
- AND `isLoading` returns to `false`

#### Scenario: Hook surfaces API error

- GIVEN the backend returns an error on `GET /api/v1/users/`
- WHEN the hook initializes
- THEN `error` is set to a non-empty string
- AND `users` remains empty
- AND `isLoading` is `false`

#### Scenario: createUser updates the user list on success

- GIVEN the hook is initialized with existing users
- WHEN `createUser(input)` is called and the backend returns 201
- THEN the new membership is appended to `users`
- AND `isLoading` returns to `false`

#### Scenario: createUser surfaces validation error

- GIVEN the backend returns 400 (e.g., duplicate username)
- WHEN `createUser(input)` is called
- THEN an error is thrown or returned to the caller
- AND the `users` list is NOT modified

#### Scenario: deactivateUser removes membership from list

- GIVEN a membership with `id=5` is in `users`
- WHEN `deactivateUser(5)` is called and the backend returns 204
- THEN the membership with `id=5` is removed from `users`

---

### Requirement: Role Presentation Without Duplication

The system MUST NOT define role labels, colors, or display names in the
`UserManagement` component. This information MUST come exclusively from
`lib/auth/roles.ts` via `getRolePresentation()`.

#### Scenario: Role badge uses centralized presentation

- GIVEN a membership with `role.code = "monitor"` is rendered
- WHEN the `UserManagement` component displays the role badge
- THEN the label and color come from `getRolePresentation("monitor")`
- AND no hardcoded label strings exist in the component file

---

### Requirement: User Management Component Behavior

The `UserManagement` component MUST use `useUsers()` for all data fetching
and mutations. It MUST NOT call API functions directly.

The component MUST show a loading state while the hook is fetching.
The component MUST show an error message if the hook reports an error.
The component MUST hide the create user form if `canManage` prop is `false`.

#### Scenario: Component shows loading indicator

- GIVEN `useUsers()` is in loading state
- WHEN the `UserManagement` component renders
- THEN a loading indicator is visible

#### Scenario: Component shows error state

- GIVEN `useUsers()` has a non-empty `error`
- WHEN the `UserManagement` component renders
- THEN the error message is visible to the user

#### Scenario: Component hides form when canManage is false

- GIVEN `canManage={false}` is passed to `UserManagement`
- WHEN the component renders
- THEN the "create user" form is NOT visible

#### Scenario: Component shows form when canManage is true

- GIVEN `canManage={true}` is passed to `UserManagement`
- WHEN the component renders
- THEN the "create user" form IS visible with username, password, and role fields

#### Scenario: Successful user creation clears the form

- GIVEN the create user form is filled with valid data
- WHEN the form is submitted and the backend returns 201
- THEN the form fields are reset to empty
- AND the new user appears in the user list

---

### Requirement: Role Selector Populated from Backend

The create user form MUST populate the role selector from the `roles` list
returned by the backend. It MUST NOT use a hardcoded list of role options.

#### Scenario: Role select shows all available roles

- GIVEN the backend returns 4 roles on `GET /api/v1/users/roles/`
- WHEN the create user form renders
- THEN the role selector shows exactly 4 options
- AND each option label comes from `role.name`
