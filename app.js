var express = require('express');

var port         = process.env.port || 3000;
var mongoose     = require('mongoose');
var passport     = require('passport');
var flash        = require('connect-flash');
var logger       = require('morgan');
var path         = require('path');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var configDB     = require('./config/database');

// connect database
mongoose.connect(configDB.url, function (err) {
    if (err) {
        console.log("connection error", err);

    } else {
        console.log('connection successful!');
    }
});
require('./config/passport')(passport);

var app        = express();
var router     = express.Router();

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use('/paris', express.static(path.join(__dirname, '/public')));
console.log(__dirname);
//session secret
app.use(session({secret: '123456789abcdefg'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(router);

// Bootstrap application settings
require('./config/express')(app);
require('./config/route')(router);

app.listen(port);
console.log('listening at:', port);
module.exports = app;