'use strict';

const passport = require('passport');
const OpenIdConnectStrategy = require('passport-openidconnect');
const { AuthenticationRequired } = require('unleash-server');
const unleash = require('unleash-server');

const host = process.env.UNLEASH_URL;
const issuer = process.env.OIDC_ISSUER;
const clientID = process.env.OIDC_CLIENT_ID;
const clientSecret = process.env.OIDC_CLIENT_SECRET;

function dexOidcAuth(app, config, services) {
  const { userService } = services;

  passport.use('oidc', new OpenIdConnectStrategy({
    issuer: issuer,
    authorizationURL: `${issuer}/auth`,
    tokenURL: `${issuer}/token`,
    userInfoURL: `${issuer}/userinfo`,
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: `${host}/api/auth/callback`,
    scope: ['openid', 'profile', 'email'],
  }, async (issuer, profile, cb) => {
    const email = profile.emails[0].value;
    const user = await userService.loginUserWithoutPassword(email, true);
    cb(null, user);
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  app.get('/api/admin/login', passport.authenticate('oidc'));

  app.get('/api/auth/callback',
    passport.authenticate('oidc', { failureRedirect: '/login', failureMessage: true }),
    (req, res) => res.redirect('/')
  );

  app.use('/api', (req, res, next) => {
    if (req.user) return next();
    return res.status(401).json(
      new AuthenticationRequired({
        path: '/api/admin/login',
        type: 'custom',
        message: 'Sign in with your Google account via Dex to use Unleash.',
      })
    ).end();
  });
}

unleash.start({
  authentication: {
    type: 'custom',
    customAuthHandler: dexOidcAuth,
  },
});
