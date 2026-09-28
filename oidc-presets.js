function getOidcProviderConfig() {
  const host = process.env.UNLEASH_URL;
  const provider = process.env.OIDC_PROVIDER.toLowerCase();
  const issuer = process.env.OIDC_ISSUER;
  const clientID = process.env.OIDC_CLIENT_ID;
  const clientSecret = process.env.OIDC_CLIENT_SECRET;

  let config;

  switch (provider) {
    case 'azure': {
      config = {
        issuer: `${issuer}/v2.0`,
        authorizationURL: `${issuer}/oauth2/v2.0/authorize`,
        tokenURL: `${issuer}/oauth2/v2.0/token`,
        userInfoURL: 'https://graph.microsoft.com/oidc/userinfo',
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: `${host}/api/auth/callback`,
        scope: ['openid', 'profile', 'email'],
      };

      break;
    }

    case 'custom': {
      config = {
        issuer: requiredEnv('OIDC_ISSUER'),
        authorizationURL: requiredEnv('OIDC_AUTHORIZATION_URL'),
        tokenURL: requiredEnv('OIDC_TOKEN_URL'),
        userInfoURL: requiredEnv('OIDC_USERINFO_URL'),
        callbackURL: requiredEnv('OIDC_CALLBACK_URL'),
        scope: ['openid', 'profile', 'email'],
      };

      break;
    }

    default:
      config = {
        issuer: issuer,
        authorizationURL: `${issuer}/auth`,
        tokenURL: `${issuer}/token`,
        userInfoURL: `${issuer}/userinfo`,
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: `${host}/api/auth/callback`,
        scope: ['openid', 'profile', 'email'],
      }
  }

  return config;
}

module.exports = {
  getOidcProviderConfig,
};
