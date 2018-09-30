const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in User Model
let User = require('../models/user');

// Add GET
router.get('/register', (req,res) => {
    res.render('register');
});

// Add POST
router.post('/register', (req, res) =>
{
    console.log(req.body);
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password_confirm = req.body.password_confirm;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password_confirm', 'Passwords do not match').equals(req.body.password);


    let errors = req.validationErrors();

    if (errors)
    {
        res.render('register', {
            errors: errors
        });
    } else {
        let newUser = new User({
            name:name,
            email:email,
            username:username,
            password:password
        });

        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(newUser.password, salt, function(err, hash){
                if (err) throw err;

                console.log('Hash: ' + hash);
                newUser.password = hash;
                newUser.save(function(err){
                   if (err) throw err;

                   req.flash('success', 'You successfully registered');
                   res.redirect('/users/login');
                });
            });
        });
    }
});

// Login Form
router.get('/login', (req,res) =>{
   res.render('login');
});

// Login Process
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', (req,res) => {
    req.logout();
    req.flash('success','You successfully logged out');
    res.redirect('/');
});

// Delete

// Get

// Get all

module.exports = router;