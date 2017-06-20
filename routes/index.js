const express = require('express');
const passport = require('passport');
const router = express.Router();
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const request = require('request');

// We are going to want to share some data between our server and UI, so we'll be sure to pass that data in an env variable.
const env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: 'http://localhost:3000/callback'
};

router.get('/', function(req, res, next) {
  res.render('index', { env: env });
});

router.get('/login',function(req, res){
  res.render('login', { env: env });
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/polls');
  });

router.get('/polls', ensureLoggedIn, function(req, res){
  request('http://elections.huffingtonpost.com/pollster/api/charts.json?topic=2016-president', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var polls = JSON.parse(body);
      res.render('polls', {env: env, user: req.user, polls: polls});
    } else {
      res.render('error');
    }
  })
})

router.get('/user', ensureLoggedIn, function(req, res, next) {
  res.render('user', { env: env, user: req.user });
});

module.exports = router;