const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const {
  getNotifications,
  getUnreadCount,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = require('../controllers/notificationController');

router.get('/', auth, getNotifications);
router.get('/unread-count', auth, getUnreadCount);
router.post('/', auth, createNotification);
router.put('/:id/read', auth, markAsRead);
router.put('/mark-all-read', auth, markAllAsRead);
router.delete('/:id', auth, deleteNotification);
router.delete('/', auth, clearAllNotifications);

module.exports = router;
