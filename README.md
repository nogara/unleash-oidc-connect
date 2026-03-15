# unleash-oidc-connect

Unleash feature toggle server with OIDC authentication via [passport-openidconnect](https://github.com/jaredhanson/passport-openidconnect). Designed to work with [Dex](https://dexidp.io/) or any OIDC-compliant provider (Google, Keycloak, Authentik, etc.).

## Docker Image

```
docker pull nogara/unleash-oidc-connect:latest
```

## Quick Start

```bash
docker run -p 4242:4242 \
  -e UNLEASH_URL=https://unleash.example.com \
  -e OIDC_ISSUER=https://dex.example.com \
  -e OIDC_CLIENT_ID=unleash \
  -e OIDC_CLIENT_SECRET=your-secret \
  -e DATABASE_URL=postgresql://user:pass@host/db \
  nogara/unleash-oidc-connect:latest
```

Unleash will be available at `http://localhost:4242`.

## Docker Compose

```yaml
services:
  unleash:
    image: nogara/unleash-oidc-connect:latest
    ports:
      - "4242:4242"
    environment:
      DATABASE_URL: postgresql://unleash:unleash@db/unleash
      UNLEASH_URL: https://unleash.example.com
      OIDC_ISSUER: https://dex.example.com
      OIDC_CLIENT_ID: unleash
      OIDC_CLIENT_SECRET: your-secret
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: unleash
      POSTGRES_PASSWORD: unleash
      POSTGRES_DB: unleash
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U unleash"]
      interval: 5s
      timeout: 5s
      retries: 5
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `UNLEASH_URL` | ✅ | Public URL of your Unleash instance (e.g. `https://unleash.example.com`) |
| `OIDC_ISSUER` | ✅ | OIDC issuer base URL (e.g. `https://dex.example.com`) |
| `OIDC_CLIENT_ID` | ✅ | OAuth2 client ID registered with your OIDC provider |
| `OIDC_CLIENT_SECRET` | ✅ | OAuth2 client secret |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |

> The OIDC endpoints (`/auth`, `/token`, `/userinfo`) are constructed automatically from `OIDC_ISSUER`.

## Auth Flow

```
User → /api/admin/login
     → OIDC provider (Dex / Google / Keycloak)
     → /api/auth/callback
     → Unleash session (user auto-created from email on first login)
```

1. User navigates to `/api/admin/login` → redirected to the OIDC provider
2. Provider authenticates and redirects to `/api/auth/callback`
3. The email from the OIDC profile is used to log in or auto-create the Unleash user
4. All subsequent `/api` calls require an active session; unauthenticated requests return `401`

## OIDC Provider Setup

Your provider must allow:
- **Redirect URI:** `https://<UNLEASH_URL>/api/auth/callback`
- **Scopes:** `openid profile email`

### Dex example client config

```yaml
staticClients:
  - id: unleash
    secret: your-secret
    name: Unleash
    redirectURIs:
      - https://unleash.example.com/api/auth/callback
```

## Notes

- Users are provisioned on first login via `loginUserWithoutPassword` with `autoCreate: true`
- Passport sessions are stored in-memory by default — pair with a sticky session or external session store for multi-replica deployments
- This image does **not** bundle a database migration tool; Unleash handles migrations on startup via `DATABASE_URL`

## Building Locally

```bash
git clone https://github.com/nogara/unleash-oidc-connect.git
cd unleash-oidc-connect
docker build -t unleash-oidc-connect .
```
