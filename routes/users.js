var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/', function(req, res, next) {
  // res.send('respond with a resource');
  console.log("Users requst", req.body);
});

module.exports = router;
