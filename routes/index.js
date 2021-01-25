var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/chat',(req,res)=>{
  const livu = req.query.username;
  console.log(livu)
  res.render('chat',);
});

module.exports = router;