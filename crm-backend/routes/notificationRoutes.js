const express = require('express');
const auth = require('../middlewares/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// Get all notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userID: req.user })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userID: req.user, isRead: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create notification
router.post('/', auth, async (req, res) => {
  try {
    const { title, message, type, link, userID } = req.body;
    const notification = new Notification({
      userID: userID || req.user,
      title,
      message,
      type: type || 'info',
      link,
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Mark as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Mark all as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany({ userID: req.user, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Clear all notifications
router.delete('/', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ userID: req.user });
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
