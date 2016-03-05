///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>
///<reference path='../db_objects/account.ts'/>
var User = (function () {
    function User(username, password, fullname, gender, age, aboutme, location, securityQuestion, securityAnswer) {
        this.username = username;
        this.password = password;
        this.fullname = fullname;
        this.gender = gender;
        this.age = age;
        this.aboutme = aboutme;
        this.location = location;
        this.securityQuestion = securityQuestion;
        this.securityAnswer = securityAnswer;
    }
    User.prototype.getUsername = function () {
        return this.username;
    };
    User.prototype.getPassword = function () {
        return this.password;
    };
    User.prototype.getFullName = function () {
        return this.fullname;
    };
    User.prototype.getGender = function () {
        return this.gender;
    };
    User.prototype.getAboutMe = function () {
        return this.aboutme;
    };
    User.prototype.getLocation = function () {
        return this.location;
    };
    User.prototype.getAge = function () {
        return this.age;
    };
    User.prototype.getSecurityQuestion = function () {
        return this.securityQuestion;
    };
    User.prototype.getSecurityAnswer = function () {
        return this.securityAnswer;
    };
    return User;
})();
var Router = (function () {
    function Router() {
        var express = require('express');
        var router = express.Router();
        var multer = require('multer');
        var path = require('path');
        var fs = require('fs');
        /* GET home page. */
        router.get('/home', function (req, res) {
            var db = req.db;
            var collection = db.get('comics');
            var comicIds = [];
            var urls = [];
            collection.find({}, function (err, docs) {
                if (err) {
                    res.send(err);
                }
                else if (docs != null) {
                    var imagesCollection = db.get('comicimages');
                    imagesCollection.find({
                        "sequence": 1
                    }, function (imagesErr, imagesDocs) {
                        if (imagesErr) {
                            res.send(imagesErr);
                        }
                        else if (imagesDocs != null) {
                            for (var i = 0; i < docs.length; i++) {
                                var curComicId = docs[i]['comicId'];
                                comicIds.push("../comic/" + curComicId);
                                for (var j = 0; j < imagesDocs.length; j++) {
                                    if (imagesDocs[j]['comicId'] == curComicId) {
                                        urls.push(imagesDocs[j]['url']);
                                    }
                                }
                            }
                            res.render('home', { cur: req.currentUser, urls: urls, comicIds: comicIds });
                        }
                    });
                }
            });
        });
        /* GET home page. */
        router.get('/', function (req, res) {
            res.render('home', { cur: req.currentUser });
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
            // Set our collection
            if (password.length < 4 || password.length > 20) {
                res.render('login', { loginError: 'Password needs to be between 4 - 20 characters. Please try again!' });
            }
            else {
                var collection = db.get('usercollection');
                collection.findOne({
                    "username": username.toLowerCase(),
                    "password": password
                }, function (err, docs) {
                    if (err) {
                        res.send(err);
                    }
                    else if (docs != null) {
                        var currentUser = req.currentUser;
                        currentUser.setUsername(username);
                        currentUser.setIsLoggedIn(true);
                        res.redirect('../home');
                    }
                    else {
                        res.render('login', { loginError: 'Login failed, invalid credentials' });
                    }
                });
            }
        });
        router.get('/comic/*', function (req, res) {
            var comicId = parseInt(req.params['0']);
            var db = req.db;
            var collection = db.get('comics');
            collection.findOne({
                "comicId": comicId
            }, function (err, docs) {
                if (err) {
                    res.send(err);
                }
                else if (docs != null) {
                    var creator = docs['creator'];
                    var imagesCollection = db.get('comicimages');
                    imagesCollection.find({
                        "comicId": comicId
                    }, function (imagesErr, imagesDocs) {
                        if (imagesErr) {
                            res.send(imagesErr);
                        }
                        else if (imagesDocs != null) {
                            var urls = [];
                            for (var i = 0; i < imagesDocs.length; i++) {
                                urls.push(imagesDocs[i]['url']);
                            }
                            var tags = docs['tags'];
                            res.render('comic', {
                                comicId: comicId.toString(),
                                urls: urls,
                                tags: tags
                            });
                        }
                    });
                }
            });
        });
        /* GET Create Profile page. */
        router.get('/createprofile', function (req, res) {
            res.render('createprofile');
        });
        /* GET logout */
        router.get('/logout', function (req, res) {
            var currentUser = req.currentUser;
            if (!currentUser.isLoggedIn) {
                res.redirect('/home');
            }
            else {
                currentUser.setIsLoggedIn(false);
                currentUser.setUsername("");
                res.redirect('/home');
            }
        });
        /* POST to UserList Page */
        router.post('/createprofile', function (req, res) {
            // Set our internal DB variable
            var db = req.db;
            // Get our form values. These rely on the "name" attributes
            var username = req.body.username;
            var password = req.body.password;
            var securityQuestion = req.body.securityQuestion;
            var securityAnswer = req.body.securityAnswer;
            var confirmPassword = req.body.confirmPassword;
            if (password.length < 4 || password.length > 20) {
                res.send("Password needs to be between 6 - 20 characters. Please try again!");
            }
            else if (password != confirmPassword) {
                res.send("passwords do not match");
            }
            else {
                var user = new User(username, password, req.body.fullname, req.body.age, req.body.aboutme, req.body.gender, req.body.location, securityQuestion, securityAnswer);
                // Set our collection
                var collection = db.get('usercollection');
                // Submit to the DB
                collection.findOne({
                    "username": username.toLowerCase()
                }, function (err, docs) {
                    if (err) {
                        res.send(err);
                    }
                    else if (docs != null) {
                        res.send("Username already exists. Please enter a new username");
                    }
                    else {
                        // Submit to the DB
                        collection.insert({
                            "username": user.getUsername(),
                            "password": user.getPassword(),
                            "fullname": "This user has not filled out a bio",
                            "age": "This user has not filled out a bio",
                            "gender": "This user has not filled out a bio",
                            "location": "This user has not filled out a bio",
                            "aboutme": "This user has not filled out a bio",
                            "securityquestion": user.getSecurityQuestion(),
                            "securityanswer": user.getSecurityAnswer()
                        }, function (err) {
                            if (err) {
                                // If it failed, return error
                                res.send("There was a problem adding the information to the database.");
                            }
                            else {
                                // Forward to home page
                                res.redirect("home");
                            }
                        });
                    }
                });
            }
        });
        /* GET UPLOAD COMICS PAGE */
        router.get('/uploadcomics/*', function (req, res) {
            var comicId = parseInt(req.params[0]) || 0;
            if (comicId == 0) {
                var newComic = 1;
            }
            else {
                var newComic = 0;
            }
            res.render('uploadcomics', {
                cur: req.currentUser,
                newComic: newComic
            });
        });
        /* POST TO UPLOAD COMICS PAGE */
        router.post('/uploadcomics/*', function (req, res) {
            var comicId = parseInt(req.params[0]) || 0;
            var db = req.db;
            if (comicId == 0) {
                var tagString = req.body['tags'];
                var tags = tagString.split(',').map(Function.prototype.call, String.prototype.trim);
                var collection = db.get('comics');
                collection.findOne({}, { sort: { "comicId": -1 } }, function (err, docs) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        var largestId;
                        if (docs != null) {
                            largestId = docs['comicId'];
                        }
                        else {
                            largestId = 0;
                        }
                        var imagesCollection = db.get('comicimages');
                        for (var i = 0; i < req.files.length; i++) {
                            largestId++;
                            collection.insert({
                                "comicId": largestId,
                                "creator": req.currentUser.getUsername(),
                                "tags": tags
                            });
                            imagesCollection.insert({
                                "comicId": largestId,
                                "uploader": req.currentUser.getUsername(),
                                "url": "/images/" + req.files[i].filename,
                                "sequence": 1
                            });
                        }
                        res.redirect("../../comic/" + largestId.toString());
                    }
                });
            }
            else {
                var imagesCollection = db.get('comicimages');
                imagesCollection.findOne({
                    "comicId": comicId
                }, { sort: { "sequence": -1 } }, function (err, docs) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        var largestSequence = docs['sequence'];
                        for (var i = 0; i < req.files.length; i++) {
                            imagesCollection.insert({
                                "comicId": comicId,
                                "uploader": req.currentUser.getUsername(),
                                "url": "/images/" + req.files[i].filename,
                                "sequence": largestSequence + 1
                            });
                        }
                    }
                });
                res.redirect("../../comic/" + comicId.toString());
            }
        });
        /* GET EDIT COMICS PAGE */
        router.get('/editcomic/*', function (req, res) {
            var comicId = parseInt(req.params[0]) || 0;
            if (comicId == 0) {
                res.render('editcomic', {
                    cur: req.currentUser,
                    comicId: comicId,
                    tagsValue: ""
                });
            }
            else {
                var db = req.db;
                var collection = db.get('comics');
                collection.findOne({
                    'comicId': comicId
                }, function (err, docs) {
                    if (err) {
                        res.send(err);
                    }
                    else if (docs != null) {
                        var tags = docs['tags'];
                        res.render('editcomic', {
                            cur: req.currentUser,
                            comicId: comicId,
                            tagsValue: tags
                        });
                    }
                });
            }
        });
        /* POST TO UPLOAD COMICS PAGE */
        router.post('/editcomic/*', function (req, res) {
            var comicId = parseInt(req.params[0]) || 0;
            var tagString = req.body['tags'];
            var tags = tagString.split(',').map(Function.prototype.call, String.prototype.trim);
            var db = req.db;
            if (comicId == 0) {
                res.send('Image does not exist');
            }
            else {
                var collection = db.get('comics');
                collection.findOne({
                    "comicId": comicId
                }, function (err, docs) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        collection.update({ "comicId": comicId }, {
                            "comicId": comicId,
                            "creator": docs['creator'],
                            "tags": tags
                        });
                    }
                });
            }
            res.redirect("../../comic/" + comicId.toString());
        });
        /*GET resetpassword1 page */
        router.get('/resetpassword1', function (req, res) {
            res.render('resetpassword1');
        });
        /*post resetpassword1 page */
        router.post('/resetpassword1', function (req, res) {
            var username = req.body.username;
            res.redirect("../resetpassword2/" + username);
        });
        /*GET resetpassword2 page */
        router.get('/resetpassword2/*', function (req, res) {
            var db = req.db;
            var username = req.params['0'];
            var collection = db.get('usercollection');
            collection.findOne({
                "username": username.toLowerCase()
            }, function (err, docs) {
                if (err) {
                    res.send(err);
                }
                else if (docs == null) {
                    res.send("The username does not exist, please re-enter again");
                }
                else {
                    res.render('resetpassword2');
                }
            });
        });
        router.post('/resetpassword2/*', function (req, res) {
            var db = req.db;
            var collection = db.get('usercollection');
        });
        /*GET resetpassword3 page */
        router.get('/resetpassword3', function (req, res) {
            res.render('resetpassword3');
        });
        /*GET enteremail page */
        router.get('/enteremail', function (req, res) {
            res.render('enteremail');
        });
        /* GET myprofile page. */
        router.get('/myprofile', function (req, res) {
            var db = req.db;
            var currentUser = req.currentUser;
            var current = currentUser.getUsername();
            var collection = db.get('usercollection');
            collection.findOne({
                "username": current
            }, function (err, docs) {
                if (err) {
                    res.send(err);
                }
                else if (docs != null) {
                    res.render('myprofile', {
                        cur: currentUser,
                        fullname: docs['fullname'],
                        location: docs['location'],
                        age: docs['age'],
                        gender: docs['gender'],
                        aboutme: docs['aboutme']
                    });
                }
                else {
                    res.render('myprofile', {
                        cur: currentUser,
                        fullname: '',
                        location: '',
                        age: '',
                        gender: '',
                        aboutme: ''
                    });
                }
            });
        });
        //Get profile pages
        router.get('/users/*', function (req, res) {
            var db = req.db;
            var collection = db.get('usercollection');
            var username = req.params['0'];
            collection.findOne({
                "username": username
            }, function (err, docs) {
                if (err) {
                    res.send(err);
                }
                else if (docs != null) {
                    res.render('users', {
                        userName: username,
                        fullname: docs['fullname'],
                        location: docs['location'],
                        age: docs['age'],
                        gender: docs['gender'],
                        aboutme: docs['aboutme']
                    });
                }
                else {
                    res.send("This user does not exist!");
                }
            });
        });
        //get Search User page
        router.get('/searchuser', function (req, res) {
            var db = req.db;
            var collection = db.get('usercollection');
            var username = req.body.username;
            collection.findOne({
                "username": username
            }, function (err, docs) {
                if (err) {
                    res.send(err);
                }
                else if (docs != null) {
                    res.render('/users/username');
                }
                else {
                    res.send("This user does not exist!");
                }
            });
        });
        /* GET editprofile page. */
        router.get('/editprofile', function (req, res) {
            res.render('editprofile', { title: 'Edit Profile' });
        });
        /* POST for editprofile page */
        router.post('/editprofile', function (req, res) {
            var currentUser = req.currentUser;
            if (currentUser.getIsLoggedIn() != true) {
                res.send("You must be logged in");
            }
            else {
                // Set our internal DB variable
                var db = req.db;
                //get form values
                var fullname = req.body.fullname;
                var age = req.body.age;
                var location = req.body.location;
                var gender = req.body.gender;
                var aboutme = req.body.aboutme;
                // Set our collection
                var collection = db.get('usercollection');
                collection.findOne({
                    "username": currentUser.getUsername()
                }, function (err, docs) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        var password = docs['password'];
                        var securityQuestion = docs['securityquestion'];
                        var securityAnswer = docs['securityanswer'];
                        var user = new User(currentUser.getUsername(), password, fullname, gender, age, aboutme, location, securityQuestion, securityAnswer);
                        collection.update({ username: currentUser.getUsername() }, { $set: {
                                "fullname": user.getFullName(),
                                "gender": user.getGender(),
                                "age": user.getAge(),
                                "aboutme": user.getAboutMe(),
                                "location": user.getLocation()
                            }
                        }, function (err) {
                            if (err) {
                                // If it failed, return error
                                res.send("There was a problem adding the information to the database.");
                            }
                            else {
                                // Forward back to my profile page
                                res.redirect("myprofile");
                            }
                        });
                    }
                });
            }
        });
        module.exports = router;
    }
    return Router;
})();
var router = new Router();
//# sourceMappingURL=index.js.map