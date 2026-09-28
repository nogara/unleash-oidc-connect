'use strict';

const passport = require('passport');
const OpenIdConnectStrategy = require('passport-openidconnect');
const { AuthenticationRequired } = require('unleash-server');
const unleash = require('unleash-server');
const { getOidcProviderConfig } = require('./oidc-presets');

function dexOidcAuth(app, config, services) {
  const { userService } = services;
  const oidcConfig = getOidcProviderConfig();

  passport.use('oidc', new OpenIdConnectStrategy(oidcConfig, async (issuer, profile, cb) => {
    const email =
      profile.emails?.[0]?.value ||
      profile._json?.email ||
      profile._json?.preferred_username ||
      profile._json?.upn ||
      profile._json?.unique_name;

    if (!email) {
      return cb(new Error('Could not resolve email from OIDC profile'));
    }
    
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
        message: 'Sign in to your account via OIDC to use Unleash.',
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
