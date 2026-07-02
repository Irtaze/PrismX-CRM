const express = require('express');
const { createComment, getComments, getCommentById, updateComment, deleteComment } = require('../controllers/commentController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, createComment);
router.get('/', auth, getComments);
router.get('/:id', auth, getCommentById);
router.put('/:id', auth, updateComment);
router.delete('/:id', auth, deleteComment);

module.exports = router;
