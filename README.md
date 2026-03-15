# unleash-oidc-connect

Unleash feature toggle server with OIDC authentication via [passport-openidconnect](https://github.com/jaredhanson/passport-openidconnect). Designed to work with Dex or any OIDC-compliant provider (e.g. Google, Keycloak, Authentik).

## Environment Variables

| Variable | Description |
|---|---|
| `UNLEASH_URL` | Public URL of your Unleash instance (e.g. `https://unleash.example.com`) |
| `OIDC_ISSUER` | OIDC issuer base URL (e.g. `https://dex.example.com`) |
| `OIDC_CLIENT_ID` | OAuth2 client ID |
| `OIDC_CLIENT_SECRET` | OAuth2 client secret |
| `DATABASE_URL` | PostgreSQL connection string |

## Usage

```bash
docker build -t unleash-oidc-connect .
docker run -p 4242:4242 \
  -e UNLEASH_URL=https://unleash.example.com \
  -e OIDC_ISSUER=https://dex.example.com \
  -e OIDC_CLIENT_ID=unleash \
  -e OIDC_CLIENT_SECRET=secret \
  -e DATABASE_URL=postgresql://user:pass@host/db \
  unleash-oidc-connect
```

## Auth Flow

1. User hits `/api/admin/login` → redirected to OIDC provider
2. Provider redirects to `/api/auth/callback`
3. Email from OIDC profile is used to log in (or auto-create) the Unleash user
4. All `/api` calls require an authenticated session

## Notes

- Uses `loginUserWithoutPassword` with `autoCreate: true` — users are provisioned on first login
- Sessions are managed by Passport's serialize/deserialize (in-memory by default)
- The OIDC endpoints (`/auth`, `/token`, `/userinfo`) are constructed from `OIDC_ISSUER`
