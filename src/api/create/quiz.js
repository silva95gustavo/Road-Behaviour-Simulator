const express = require('express');
const router = express.Router();
const quiz = require('./../../database/quiz');
router.route('/create')
  .post((req, res) => {

    //TODO: Verificar login
    
    if(req.body.name === '')
    {
      res.status(400);
      res.redirect('/dashboard');
      return;
    }
    //TODO: Usar id que está no req
    quiz.createQuiz(req.user.id, req.body.name, function (error, results) {
      if(error){
        console.log(error);
        res.status(400);
        res.redirect('/dashboard');
        return;
      }
      res.status(200);
      res.redirect('/quiz/' + results.insertId);
    })
  });

module.exports = router;