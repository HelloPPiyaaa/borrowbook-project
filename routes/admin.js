var express = require('express');
var router = express.Router();

const { await } = require('await');

router.get('/', function (req, res, next) {
     res.render('admin');
});

router.get('/logout',(req, res, next) => {
     try{
       if (req.session) {
         delete req.session;
       }
       res.redirect('/users/login')
     }
     catch (error) {
       console.log(error.message)
     }
   });

module.exports = router;
