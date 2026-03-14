# Frontend Auth Specification — ColdevConAC

## Purpose

Define the behavior of the frontend authentication layer in the Next.js 15 application.
This spec covers token persistence, the HTTP client with automatic auth headers, and
the React hook that manages user authentication state.

The frontend layer consumes the backend auth API defined in the `authentication` spec.
It does NOT own business logic — it delegates all auth decisions to the backend.

---

## Requirements

### Requirement: Token Persistence

The system MUST persist the auth token in `localStorage` using a consistent key,
so that users remain authenticated across page refreshes.

The system MUST provide utilities to read, write, and delete the token from storage.

The system MUST NOT store sensitive user data (passwords, secrets) in `localStorage`.

#### Scenario: Token stored after successful login

- GIVEN the backend returns a valid token on login
- WHEN the frontend processes the login response
- THEN the token is saved to `localStorage` under a consistent key (e.g., `coldevconac_token`)
- AND the token can be retrieved by subsequent requests

#### Scenario: Token cleared on logout

- GIVEN a user is logged in with a token in `localStorage`
- WHEN the frontend calls the logout function
- THEN the token is removed from `localStorage`
- AND subsequent reads of the token key return `null`

#### Scenario: Token absent on first visit

- GIVEN a user has never logged in (fresh browser)
- WHEN `getToken()` is called
- THEN it returns `null`
- AND the user is treated as unauthenticated

---

### Requirement: HTTP Client with Authorization Header

The system MUST provide an HTTP client function that automatically attaches the
`Authorization: Token <key>` header to every outgoing API request when a token exists.

The system MUST forward all HTTP method semantics (GET, POST, PUT, PATCH, DELETE).

The system SHOULD surface HTTP error responses as thrown errors with the status code
and response body accessible to the caller.

#### Scenario: Authenticated request includes Authorization header

- GIVEN a valid token is stored in `localStorage`
- WHEN `apiFetch(url, options)` is called for any endpoint
- THEN the outgoing request includes `Authorization: Token <key>` in the headers

#### Scenario: Unauthenticated request omits Authorization header

- GIVEN no token is stored in `localStorage`
- WHEN `apiFetch(url, options)` is called
- THEN the outgoing request does NOT include an `Authorization` header
- AND the request is sent as-is (the backend will return 401 for protected endpoints)

#### Scenario: Server returns 401 on protected request

- GIVEN a token is absent or invalid
- WHEN `apiFetch` receives a 401 response from the server
- THEN the function throws an error indicating unauthorized access
- AND the caller can handle it to redirect to login

#### Scenario: Server returns 500

- GIVEN the backend experiences a server error
- WHEN `apiFetch` receives a 500 response
- THEN the function throws an error with the status code
- AND the caller is not given a false success result

---

### Requirement: `useAuth` React Hook

The system MUST provide a `useAuth()` hook that exposes the current user state,
loading status, login function, and logout function.

The system MUST initialize user state from `localStorage` on mount, so returning
users are not shown a login screen unnecessarily.

The system MUST update user state synchronously after login or logout without
requiring a full page reload.

#### Scenario: Hook initializes from stored token on mount

- GIVEN a valid token is in `localStorage`
- WHEN a component using `useAuth()` mounts
- THEN `user` is non-null and `isAuthenticated` is `true`
- AND `isLoading` is `false` after initialization completes

#### Scenario: Hook initializes as unauthenticated when no token

- GIVEN no token is in `localStorage`
- WHEN a component using `useAuth()` mounts
- THEN `user` is `null` and `isAuthenticated` is `false`
- AND `isLoading` is `false` after initialization completes

#### Scenario: Successful login via hook

- GIVEN a user provides correct credentials
- WHEN `login(username, password)` is called from `useAuth()`
- THEN the hook calls `POST /api/auth/login`
- AND on success, stores the token
- AND updates `user` and `isAuthenticated` to reflect the logged-in state
- AND `isLoading` returns to `false`

#### Scenario: Failed login via hook

- GIVEN a user provides wrong credentials
- WHEN `login(username, password)` is called from `useAuth()`
- THEN the hook calls `POST /api/auth/login`
- AND on failure, does NOT update `user` or store a token
- AND `isAuthenticated` remains `false`
- AND an error is surfaced to the caller (thrown or returned)

#### Scenario: Logout via hook

- GIVEN a user is authenticated
- WHEN `logout()` is called from `useAuth()`
- THEN the hook calls `POST /api/auth/logout`
- AND clears the token from `localStorage`
- AND sets `user` to `null` and `isAuthenticated` to `false`

#### Scenario: Hook loading state during async operations

- GIVEN a login or logout action is in progress
- WHEN `useAuth()` is observed during the request
- THEN `isLoading` is `true`
- AND once the request completes (success or failure), `isLoading` returns to `false`

---

### Requirement: No Sensitive Data in State

The system MUST NOT store the raw password in any React state, hook, or `localStorage`.

The system SHOULD store only non-sensitive user fields from the login response
(e.g., `id`, `username`, `email`, tenant info) for display purposes.

#### Scenario: User state contains only safe fields

- GIVEN a successful login response `{token, user: {id, username, email}, tenant}`
- WHEN the hook processes the response
- THEN `user` state contains only `{id, username, email}` (or equivalent safe fields)
- AND the raw token is stored in `localStorage`, not in React component state
- AND no password is stored anywhere

---

### Requirement: CORS Header Compatibility

The system MUST configure the `Authorization` header as an allowed header in frontend
fetch requests so that CORS preflight passes for cross-origin API calls.

#### Scenario: Preflight allows Authorization header

- GIVEN the frontend and backend run on different origins (e.g., localhost:3000 + :8000)
- WHEN a browser sends a CORS preflight for an authenticated request
- THEN the backend responds with `Access-Control-Allow-Headers: Authorization`
- AND the actual request proceeds without CORS error
