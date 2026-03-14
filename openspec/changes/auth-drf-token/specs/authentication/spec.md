# Authentication Specification — ColdevConAC

## Purpose

Define the behavior of the authentication system for ColdevConAC. This spec covers
the token-based authentication layer (Phase 1: DRF Token) that enables the Next.js
frontend to securely identify users and perform authenticated API requests.

Authentication determines **who** a user is. Tenant resolution (which tenant they
belong to) is handled independently by `TenantContextMiddleware` and is out of scope
here, though both must coexist correctly.

---

## Requirements

### Requirement: Token-Based Login

The system MUST provide a login endpoint that accepts user credentials and returns
a persistent authentication token in JSON format.

The system MUST validate that the user exists, their password is correct, and they
have a membership in the resolved tenant before issuing a token.

The system MUST return a single token per user (create if not exists, otherwise
return the existing one).

#### Scenario: Successful login with valid credentials

- GIVEN a user exists with a valid username and password
- AND the user has a `UserMembership` in the active tenant
- WHEN `POST /api/auth/login` is called with `{username, password}`
- THEN the server returns HTTP 200
- AND the response body contains `{token, user: {id, username, email}, tenant: {id, slug}}`
- AND the token is a valid DRF auth token string

#### Scenario: Login with wrong password

- GIVEN a user exists with a known username
- WHEN `POST /api/auth/login` is called with a wrong password
- THEN the server returns HTTP 400 or HTTP 401
- AND the response body contains an error message
- AND no token is issued

#### Scenario: Login with non-existent user

- GIVEN no user exists for the given username
- WHEN `POST /api/auth/login` is called
- THEN the server returns HTTP 400 or HTTP 401
- AND no token is issued

#### Scenario: Login with missing fields

- GIVEN a request body is missing `username` or `password`
- WHEN `POST /api/auth/login` is called
- THEN the server returns HTTP 400
- AND the response body identifies which field is missing

#### Scenario: Login with user not in tenant

- GIVEN a valid user exists but has NO `UserMembership` in the current tenant
- WHEN `POST /api/auth/login` is called
- THEN the server returns HTTP 403
- AND no token is issued

---

### Requirement: Token-Based Logout

The system MUST provide a logout endpoint that permanently deletes the user's auth
token, invalidating all future requests using that token.

The system MUST require authentication to call the logout endpoint.

#### Scenario: Successful logout

- GIVEN a user is authenticated with a valid token
- WHEN `POST /api/auth/logout` is called with `Authorization: Token <key>`
- THEN the server returns HTTP 204 (No Content)
- AND the token is removed from the database
- AND subsequent requests using that token return HTTP 401

#### Scenario: Logout without token

- GIVEN no `Authorization` header is provided
- WHEN `POST /api/auth/logout` is called
- THEN the server returns HTTP 401
- AND no token is deleted

---

### Requirement: Protected Endpoint Access

The system MUST reject requests to protected endpoints when no valid token is provided.

The system MUST grant access to protected endpoints when a valid token is provided in
the `Authorization: Token <key>` header format.

#### Scenario: Access protected endpoint with valid token

- GIVEN a user has a valid auth token
- WHEN a request to a protected endpoint includes `Authorization: Token <key>`
- THEN the server returns HTTP 200 with the requested data

#### Scenario: Access protected endpoint without token

- GIVEN no `Authorization` header is included in the request
- WHEN a request to a protected endpoint is made
- THEN the server returns HTTP 401
- AND the response body indicates authentication is required

#### Scenario: Access protected endpoint with invalid/expired token

- GIVEN an `Authorization: Token <invalid_key>` header is included
- WHEN a request to a protected endpoint is made
- THEN the server returns HTTP 401

---

### Requirement: Tenant Isolation with Token Auth

The system MUST ensure that a token from a user in tenant A cannot access data from
tenant B, even if both tenants exist and the user has a valid token.

`TenantContextMiddleware` resolves the tenant independently. The auth token only
establishes user identity; tenant scope is enforced by the middleware and DB router.

#### Scenario: Token from tenant A cannot read tenant B data

- GIVEN user U has a valid token and is a member of tenant A
- AND tenant B exists with separate data
- WHEN a request is made with U's token but with a tenant B context
- THEN the server returns HTTP 403 or an empty result set
- AND no data from tenant B is exposed

#### Scenario: Token correctly scoped to user's tenant

- GIVEN user U has a valid token and is a member of tenant A only
- WHEN a request is made with U's token and tenant A context
- THEN the server returns HTTP 200 with tenant A data

---

### Requirement: DRF Settings Configuration

The system MUST configure Django REST Framework to use `TokenAuthentication` as the
default authentication class.

The system MUST have `rest_framework.authtoken` in `INSTALLED_APPS`.

The system MUST NOT remove `SessionAuthentication` — it remains active for Django Admin.

#### Scenario: DRF token auth is active

- GIVEN `INSTALLED_APPS` includes `rest_framework.authtoken`
- AND `REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES']` includes `TokenAuthentication`
- WHEN the app starts
- THEN token-based auth works for all API views
- AND Django Admin sessions continue to work independently

---

### Requirement: Audit Logging on Login

The system SHOULD log an audit event when a user successfully logs in, including
the user ID, tenant, and timestamp. This behavior already exists in `LoginView`
and MUST be preserved after the token migration.

#### Scenario: Audit event on successful login

- GIVEN a user successfully authenticates
- WHEN `POST /api/auth/login` returns HTTP 200
- THEN an audit event is logged with user ID, tenant ID, and timestamp
