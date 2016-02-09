///<reference path='types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='types/DefinitelyTyped/express/express.d.ts'/>
//import session = BrowserStorage.session;
'use strict';
var LoggedInUser = (function () {
    function LoggedInUser(username, isLoggedIn) {
        this.username = username;
        this.isLoggedIn = isLoggedIn;
    }
    LoggedInUser.prototype.getUsername = function () {
        return this.username;
    };
    LoggedInUser.prototype.setUsername = function (username) {
        this.username = username;
    };
    LoggedInUser.prototype.getIsLoggedIn = function () {
        return this.isLoggedIn;
    };
    LoggedInUser.prototype.setIsLoggedIn = function (isLoggedIn) {
        this.isLoggedIn = isLoggedIn;
    };
    return LoggedInUser;
})();
var Application = (function () {
    function Application() {
        var express = require('express');
        var path = require('path');
        var favicon = require('serve-favicon');
        var logger = require('morgan');
        var cookieParser = require('cookie-parser');
        var bodyParser = require('body-parser');
        var mongo = require('mongodb');
        var monk = require('monk');
        var db = monk('user:pass@ds060968.mongolab.com:60968/wecode_db');
        var routes = require('./routes/index');
        var users = require('./routes/users');
        var multer = require('multer');
        var upload = multer({ dest: 'uploads/' });
        var app = express();
        app.post('/profile', upload.single('avatar'), function (req, res, next) {
            // req.file is the `avatar` file
            // req.body will hold the text fields, if there were any
        });
        app.post('/photos/upload', upload.array('photos', 12), function (req, res, next) {
            // req.files is array of `photos` files
            // req.body will contain the text fields, if there were any
        });
        var cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]);
        app.post('/cool-profile', cpUpload, function (req, res, next) {
            // req.files is an object (String -> Array) where fieldname is the key, and the value is array of files
            //
            // e.g.
            //  req.files['avatar'][0] -> File
            //  req.files['gallery'] -> Array
            //
            // req.body will contain the text fields, if there were any
        });
        upload = (multer({
            dest: './uploads',
            limits: {
                fieldNameSize: 50,
                files: 1,
                fields: 5,
                fileSize: 400 * 400
            },
            rename: function (fieldname, filename) {
                return filename;
            },
            onFileUploadStart: function (file) {
                if (file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
                    return false;
                }
            }
        }));
        // view engine setup
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'ejs');
        // uncomment after placing your favicon in /public
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cookieParser());
        app.use(express.static(path.join(__dirname, 'public')));
        // Make our db accessible to our router
        app.use(function (req, res, next) {
            req.currentUser = currentUser;
            req.db = db;
            next();
        });
        app.use('/', routes);
        app.use('/users', users);
        // catch 404 and forward to error handler
        app.use(function (req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });
        // viewed at http://localhost:8080
        app.get('/', function (req, res) {
            res.sendFile(path.join(__dirname + '/*.html'));
        });
        app.listen(3030);
        // error handlers
        // development error handler
        // will print stacktrace
        if (app.get('env') === 'development') {
            app.use(function (err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            });
        }
        // production error handler
        // no stacktraces leaked to user
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error.html', {
                message: err.message,
                error: {}
            });
        });
        module.exports = app;
    }
    return Application;
})();
var currentUser = new LoggedInUser('', false);
var application = new Application();
//# sourceMappingURL=app.js.map
//# sourceMappingURL=app.js.map 
