var express = require('express');
var router = express.Router();
const { login, register, registerUser, loginUser } = require('../controllers/loginController');

/* GET login page. */
router.get('/', login);
/* GET registrasion page. */
router.get('/creataccunt', register);
// Post registerUser 
router.post('/registerUser', registerUser)
// Post logi user
router.post('/loginUser', loginUser)


module.exports = router;