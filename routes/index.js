///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>
///<reference path='../db_objects/account.ts'/>
var User = (function () {
    function User(username, password) {
        this.username = username;
        this.password = password;
    }
    User.prototype.getUsername = function () {
        return this.username;
    };
    User.prototype.getPassword = function () {
        return this.password;
    };
    return User;
})();
var Router = (function () {
    function Router() {
        var express = require('express');
        var router = express.Router();
        var multer = require('multer'), bodyParser = require('body-parser'), path = require('path');
        /* GET home page. */
        router.get('/home', function (req, res) {
            res.render('home');
        });
        /* GET login page. */
        router.get('/login', function (req, res) {
            res.render('login', { loginError: '' });
        });
        /* POST for login page */
        router.post('/login', function (req, res) {
            // Set our internal DB variable
            var db = req.db;
            // Get our form values. These rely on the "name" attributes
            var username = req.body.username;
            var password = req.body.password;
            if (password.length() < 6 || password.length() > 20) {
                res.send("Password needs to be between 6 - 20 characters. Please try again!");
            }
            var collection = db.get('usercollection');
            collection.findOne({
                "username": username.toLowerCase(),
                "password": password
            }, function (err, docs) {
                if (docs != null) {
                    var currentUser = req.currentUser;
                    currentUser.setUsername(username);
                    currentUser.setIsLoggedIn(true);
                    res.redirect('home');
                }
                else {
                    res.render('login', { loginError: 'Login failed, invalid credentials' });
                }
            });
        });
        /* GET Create Profile page. */
        router.get('/createprofile', function (req, res) {
            res.render('createprofile');
        });
        /* POST to UserList Page */
        router.post('/createprofile', function (req, res) {
            // Set our internal DB variable
            var db = req.db;
            // Get our form values. These rely on the "name" attributes
            var userName = req.body.username;
            var password = req.body.password;
            var confirmPassword = req.body.confirmPassword;
            if (password != confirmPassword) {
                res.send("Passwords do not match");
            }
            else {
                var account = new Account(userName, password);
                // Set our collection
                var collection = db.get('usercollection');
                collection.findOne({
                    "username": userName.toLowerCase(),
                    "password": password
                }, function (err, docs) {
                    /*
                     ** check if the username exists in the db
                     *  if it does, register failed
                     *  if not, insert to db
                     */
                    if (docs != null) {
                        res.send("Username has already exists.");
                    }
                    else {
                        //submit to DB
                        collection.insert({
                            "username": account.getUsername(),
                            "password": account.getPassword()
                        }, function (err, doc) {
                            if (err) {
                                // If it failed, return error
                                res.send("There was a problem adding the information to the database.");
                            }
                            else {
                                // And forward to home page
                                res.redirect("home");
                            }
                        });
                    }
                });
            }
        });
        router.get('/', function (req, res) {
            res.render('index');
        });
        router.post('/fileupload2', multer({ dest: './uploads/' }).single('upl'), function (req, res) {
            console.log(req.body); //form fields
            /* example output:
             { title: 'abc' }
             */
            console.log(req.file); //form files
            /* example output:
             { fieldname: 'upl',
             originalname: 'grumpy.png',
             encoding: '7bit',
             mimetype: 'image/png',
             destination: './uploads/',
             filename: '436ec561793aa4dc475a88e84776b1b9',
             path: 'uploads/436ec561793aa4dc475a88e84776b1b9',
             size: 277056 }
             */
            res.status(204).end();
        });
        module.exports = router;
    }
    return Router;
})();
var router = new Router();
//# sourceMappingURL=index.js.map