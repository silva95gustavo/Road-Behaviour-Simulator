var express = require('express');
var router = express.Router();
var auth = require('./../utils/auth');
var config = require('./../configuration/config');
var BreadcrumbItem = require('./../utils/breadcrumb').BreadcrumbItem;
var db = require('./../database/db');
var users = require('./../database/users');
var quiz = require('./../database/quiz');

/* GET dashboard page. */
router.get('/', function (req, res, next) {
    var authenticated = auth.ensureAuthenticated(req, res, next);
    if (!authenticated) {
        return;
    }

    var page_breadcrumb = [
        new BreadcrumbItem("Home", "/"),
        new BreadcrumbItem("Dashboard")
    ];
    var quizes = [];
    quiz.getQuizzesListFromUser(req.user.id, function (error, results) {
      for(let quizItem of results)
        quizes.push(new QuizItem(quizItem.idQuiz, quizItem.name, 0));
    });

  users.getUserByID(req.user.id, function (error, results) {
    if(error)
      return;

    if(results.length == 0) // Inserir novo utilizador
    {
      users.createUser(req.user.id, req.user.displayName, function (error, results) {
        if(error)
          return;
      })
    }
    res.render('dashboard', {
        layout: 'layout',
        title: config.app_title,
        breadcrumb: page_breadcrumb,
        username: req.user.displayName,
        user_name: req.user.displayName,
        user_firstname: req.user.displayName.split(" ")[0],
        customStyles: ["dashboard"],
        quizes: quizes
    });
  });
});

var QuizItem = function (number, title, replies) {
    this.number = number;
    this.title = title;
    this.replies = replies;
};

module.exports = router;
