var express = require('express');
var router = express.Router();
const { createTodo, getTodo, deleteTodo, completeTodo, editTodo } = require('../controllers/todoController');
const authMiddleware = require('../authMiddleware');

router.get('/index', authMiddleware, function (req, res, next) {
  res.render('index', { userLogin: true });
});
router.post("/createTodo", authMiddleware, createTodo)
router.get('/getTodo', authMiddleware, getTodo)
router.delete('/deleteTodo/:id', authMiddleware, deleteTodo);
router.post('/editTodo', authMiddleware, editTodo)
router.put('/completeTodo/:id', authMiddleware, completeTodo);

module.exports = router;
