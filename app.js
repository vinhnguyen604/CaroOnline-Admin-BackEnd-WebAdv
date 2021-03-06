const createError = require('http-errors');
const express = require('express');
const dotenv = require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
// const session = require('express-session');
const passport = require('./components/auth/local-strategy');
const cors = require('cors');

const db = require('./components/database/connect');

const indexRouter = require('./components/misc/index');
const usersRouter = require('./components/users/usersRouter');
const authRouter = require('./components/auth/authRouter');
const historyRouter = require('./components/history/historyRouter');

const app = express();
app.use(cors());
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
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(session({
//   secret: process.env.APP_SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     path: "/",
//     secure: true,
//     httpOnly: true
//   }
// }))
app.use(passport.initialize());
// app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);

// app.use(passport.authenticate('jwt'));
// app.all('*', function (req, res, next) {
//   if (req.url === '/auth/login') next();
//   if (req.isAuthenticated()) {
//     next();
//   } else {
//     res.status(401).send("Unauthorized");
//   }
// });
app.use('/', passport.authenticate('jwt', { session: false }), indexRouter);
app.use('/users', passport.authenticate('jwt', { session: false }), usersRouter);
app.use('/history', passport.authenticate('jwt', { session: false }), historyRouter);

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
