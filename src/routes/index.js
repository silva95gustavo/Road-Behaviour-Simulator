var express = require('express');
var router = express.Router();
var config = require('./../configuration/config');
var errors = require('./../utils/errors');
var ErrorMessage = errors.ErrorMessage;
var renderer = require('./../utils/renderer');

/* GET home page. */
router.get('/', function (req, res, next) {
  renderer.render(res, 'index', {
    subtitle: 'A simulation tool for driver decision analysis',
    isAuthenticated: req.isAuthenticated(),
    noGlobalStyle: true,
    hideCustomFooter: true,
    customStyles: ['landing-page']
  });
});

module.exports = router;
