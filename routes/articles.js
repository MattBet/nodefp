const express = require('express');
const router = express.Router();

// Article Model
let Article = require('../models/article');
// User Model
let User = require('../models/user');

// GET ADD
router.get('/add', ensureAuthenticated, (req,res) => {

    res.render('add_article', {title:'Add Article'})
});

// ADD
router.post('/add', (req,res) => {

    req.checkBody('title','Title is required').notEmpty();
    //req.checkBody('author','Author is required').notEmpty();
    req.checkBody('body','Body is required').notEmpty();

    // get Errors

    let errors = req.validationErrors();

    if(errors){
        res.render('add_article', {
            title:'Add Article',
            errors: errors
        })
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save(function(err){

            if (err) throw err;

            console.log('Article added');
            req.flash('success', 'Article added');
            res.redirect('/')
        })
    }
});

// Get Single Article
router.get('/:id', (req , res) => {
    Article.findById(req.params.id, function(err, article) {
        if (err) throw err;
        User.findById(article.author, function(err, user){
            if (err) throw err;
            res.render('article_show', {
                article: article,
                author: user.name
            });
        });
    })
});

// GET UPDATE
router.get('/edit/:id', ensureAuthenticated, (req , res) => {
    Article.findById(req.params.id, function(err, article) {

        if (err) throw err;

        if(article.author !== req.user.id){
            req.flash('danger', 'Not authorized');
            res.redirect('/');
        }
        res.render('edit_article', {
            article: article
        });

    })
});

// POST UPDATE
router.post('/edit/:id', (req,res) => {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id};

    Article.updateOne(query, article, function(err){

        if (err) throw err;

        console.log('Article edited');
        req.flash('primary','Article successfully edited');
        res.redirect('/')
    })
});

// DELETE
router.delete('/:id', (req, res) => {

    if(!req.user._id) {
        res.status(500).send();
    }

    let query = {_id: req.params.id};

    Article.findById(req.params.id, function(err, article){

        if(article.author !== req.user.id){
            res.status(500).send()
        } else {
            Article.deleteOne(query, function(err) {
                if (err) throw err;

                res.send('Success');
                req.flash('danger','Article successfully removed');
            })
        }
    });
});

// Access Control
function ensureAuthenticated(req, res, next){

    if(req.isAuthenticated())
    {
        next();
    }
    else
    {
        req.flash('danger','Please login');
        res.redirect('/users/login');
    }
}
module.exports = router;

