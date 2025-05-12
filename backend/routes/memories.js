
const express = require('express');
const router = express.Router();
const {
  getMemories,
  getMemory,
  createMemory,
  updateMemory,
  deleteMemory,
  likeMemory,
  commentMemory
} = require('../controllers/memoriesController');
const { protect } = require('../middleware/auth');

// Get all memories / Create memory
router.route('/')
  .get(getMemories)
  .post(protect, createMemory);

// Get, update, delete memory by id
router.route('/:id')
  .get(getMemory)
  .put(protect, updateMemory)
  .delete(protect, deleteMemory);

// Like/unlike memory
router.put('/:id/like', protect, likeMemory);

// Comment on memory
router.post('/:id/comment', protect, commentMemory);

module.exports = router;
