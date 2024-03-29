var express = require('express');
var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy;
var session = require('express-session');
var config = require('./configuration/config');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');
var url = require('url');
var errors = require('./utils/errors');
var renderer = require('./utils/renderer');

var index = require('./routes/index');
var quiz = require('./routes/quiz');
var create = require('./routes/create');
var dashboard = require('./routes/dashboard');
var demographics = require('./routes/demographics');
var api = require('./api/api');

var app = express();

////////// Passport setup ///////////
// Passport session setup.
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});
// Use the FacebookStrategy within Passport.
passport.use(new FacebookStrategy({
  clientID: config.facebook_api_key,
  clientSecret: config.facebook_api_secret,
  callbackURL: config.callback_url
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));
////////////////////////////////////

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat', key: 'sid', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// Partials
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

/////// Routes ///////
app.use('/', index);
app.use('/dashboard', dashboard);
app.use('/quiz', quiz);
app.use('/create', create);
app.use('/api', api);
app.use('/demographics', demographics);

/////// Authentication routes ///////
app.get('/auth/facebook',
  passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: config.bad_login_redirect }),
  function (req, res) {
    // Successful authentication, redirect home.
    const parsedURL = url.parse(req.session.returnTo+'').pathname;

    if(parsedURL.indexOf('/api') > -1)
    {
      if(req.session.redirectQuiz)
      {
        res.redirect(req.session.redirectQuiz);
        delete req.session.redirectQuiz;
      }
      else res.redirect(config.good_login_redirect);
    }
    else
      res.redirect(req.session.returnTo || config.good_login_redirect);
    delete req.session.returnTo;
  });
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect(config.bad_login_redirect);
});
////////////////////////////////////

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  renderer.render(res, 'not-found', {
    user_id: typeof req.user == 'undefined' ? null : req.user.id
  });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  renderer.render(res, 'error', {
    user_id: typeof req.user == 'undefined' ? null : req.user.id
  });
});

errors.clearErrors();

///// HANDLEBARS HELPERS /////
hbs.registerHelper('equal', function (lvalue, rvalue, options) {
  if (arguments.length < 3)
    throw new Error("Handlebars Helper equal needs 2 parameters");
  if (lvalue != rvalue) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

module.exports = app;