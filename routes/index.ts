///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>
interface UserInterface {
    getUsername() : String;
    getPassword() : String;
}

class User implements UserInterface {
    private username: String;
    private password: String;
    constructor(username: String, password: String) {
        this.username = username;
        this.password = password;
    }
    getUsername(){
        return this.username;
    }
    getPassword(){
        return this.password;
    }
}

// LEYLA'S ADDITION: THIS IS THE METHOD THAT GETS ALL THE FILES FROM THE PUBLIC/IMAGES FILE.
var fs = require('fs');
function getFiles (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}

// ^ Function above still works but this call doesnt?
console.log(getFiles('public/images', null));

var files = getFiles('public/images', null);

/*
for (var i = 0; files.length; i++) {
    var myImage = new Image(files[i]);
    myImage.src = files[i];
    var url = "../image/" + files[i];

    //var img = document.createElement("IMG")
    //img.setAttribute('src', url);
    //img.setAttribute('width', '300')
    //img.setAttribute('height', '300')

    //imageObject.setHTMLElement(img)
    console.log(myImage);
};
*/

class Router{
    constructor(){
        var express = require('express');
        var router = express.Router();
        var multer = require('multer');

        /* GET home page. */
        router.get('/home', function(req, res) {
            res.render('home');
        });

        /* GET login page. */
        router.get('/login', function(req, res) {
            res.render('login', { loginError: ''});
        });

        /* POST for login page */
        router.post('/login', function(req, res) {

            // Set our internal DB variable
            var db = req.db;

            // Get our form values. These rely on the "name" attributes
            var username = req.body.username;
            var password = req.body.password;

            // Set our collection
            var collection = db.get('usercollection');

            collection.findOne({
                "username": username.toLowerCase(),
                "password": password
            }, function(err, docs) {
                if (docs != null) {
                    var currentUser = req.currentUser;
                    currentUser.setUsername(username);
                    currentUser.setIsLoggedIn(true);
                    res.redirect('home');
                } else {
                    res.render('login', { loginError: 'Login failed, invalid credentials'});
                }
            });
        });

        router.get('/comic/*', function(req, res) {
            var comicNumber = req.params['0'];

            res.render('comic', { comicNumber: comicNumber.toString()});
        });

        /* GET Create Profile page. */
        router.get('/createprofile', function(req, res) {
            res.render('createprofile');
        });

        /* POST to UserList Page */
        router.post('/createprofile', function(req, res) {

            // Set our internal DB variable
            var db = req.db;

            // Get our form values. These rely on the "name" attributes
            var userName = req.body.username;
            var password = req.body.password;
            var confirmPassword = req.body.confirmPassword;

            if (!password == confirmPassword){
                res.send("Passwords do not match");
            }
            else {
                var user : User = new User(req.body.username, req.body.password);

                // Set our collection
                var collection = db.get('usercollection');
                // Submit to the DB
                collection.insert({
                        "username": user.getUsername(),
                        "password": user.getPassword()
                    }, function (err, doc) {
                        if (err) {
                            // If it failed, return error
                            res.send("There was a problem adding the information to the database.");
                        }
                        else {
                            // And forward to home page
                            res.redirect("main");
                        }
                    }
                );
            }
        });

        /* GET UPLOAD COMICS PAGE */
        router.get('/uploadcomics/*', function(req, res) {
            // Eventually need to check if user is supposed to be able to upload to comic
            res.render('uploadcomics');
        });

        /* POST TO UPLOAD COMICS PAGE */
        router.post('/uploadcomics/*', function(req, res) {
            var comicId = req.params[0];
            res.redirect("../../comic/" + comicId);
        });

        router.get('/', function(req, res){
            res.render('index');
        });

        module.exports = router;
    }
}

var router = new Router();
