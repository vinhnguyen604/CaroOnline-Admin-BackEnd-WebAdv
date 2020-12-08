const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('./components/auth/local-strategy');
const cors = require('cors');

const db = require('./components/database/connect');

const dotenv = require('dotenv').config();
const indexRouter = require('./components/misc/index');
const usersRouter = require('./components/users/users');
const authRouter = require('./components/auth/authRouter');

const app = express();
app.use(cors({
  credentials: true,
  origin: process.env.ALLOW_ORIGIN
}));

const allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

app.use(allowCrossDomain);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'ScottishFold',
  resave: false,
  saveUninitialized: true,
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);
const ensureAuthenticated = function (req, res, next) {
  passport.authenticate('local');
}
// app.use(ensureAuthenticated);
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
