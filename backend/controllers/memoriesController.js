
const Memory = require('../models/Memory');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all memories
exports.getMemories = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag } = req.query;
    
    const query = tag ? { tags: { $in: [tag] } } : {};
    
    // Calculate pagination
    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { createdAt: -1 }
    };
    
    const memories = await Memory.find(query, null, options)
      .populate('creator', 'username profileImage')
      .populate({
        path: 'comments.creator',
        select: 'username profileImage'
      });
    
    const total = await Memory.countDocuments(query);
    
    res.json({
      memories,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalMemories: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get memory by id
exports.getMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id)
      .populate('creator', 'username profileImage')
      .populate({
        path: 'comments.creator',
        select: 'username profileImage'
      });
    
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }
    
    res.json(memory);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Memory not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Create memory
exports.createMemory = async (req, res) => {
  try {
    const { title, description, image, tags } = req.body;
    
    // Create new memory
    const newMemory = new Memory({
      title,
      description,
      image,
      tags: tags.map(tag => tag.trim().toLowerCase()),
      creator: req.user._id
    });
    
    // Save memory
    await newMemory.save();
    
    // Populate creator details and return
    const memory = await Memory.findById(newMemory._id)
      .populate('creator', 'username profileImage');
    
    res.status(201).json(memory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update memory
exports.updateMemory = async (req, res) => {
  try {
    const { title, description, image, tags } = req.body;
    
    // Find memory
    let memory = await Memory.findById(req.params.id);
    
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }
    
    // Check if user is creator
    if (memory.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Update fields
    memory.title = title || memory.title;
    memory.description = description || memory.description;
    memory.image = image || memory.image;
    memory.tags = tags ? tags.map(tag => tag.trim().toLowerCase()) : memory.tags;
    
    // Save updated memory
    await memory.save();
    
    // Populate creator details and return
    memory = await Memory.findById(memory._id)
      .populate('creator', 'username profileImage');
    
    res.json(memory);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Memory not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete memory
exports.deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }
    
    // Check if user is creator
    if (memory.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Delete memory
    await memory.deleteOne();
    
    res.json({ message: 'Memory deleted successfully' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Memory not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Like/unlike memory
exports.likeMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }
    
    // Check if already liked
    const index = memory.likes.findIndex(id => id.toString() === req.user._id.toString());
    
    if (index === -1) {
      // Not liked, add like
      memory.likes.push(req.user._id);
    } else {
      // Already liked, remove like
      memory.likes = memory.likes.filter(id => id.toString() !== req.user._id.toString());
    }
    
    // Save updated memory
    await memory.save();
    
    res.json({ likes: memory.likes });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Memory not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Add comment to memory
exports.commentMemory = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    
    const memory = await Memory.findById(req.params.id);
    
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }
    
    // Create comment object
    const comment = {
      text,
      creator: req.user._id,
    };
    
    // Add to comments array
    memory.comments.unshift(comment);
    
    // Save updated memory
    await memory.save();
    
    // Return updated memory with populated comments
    const updatedMemory = await Memory.findById(req.params.id)
      .populate('comments.creator', 'username profileImage');
    
    res.json(updatedMemory.comments);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Memory not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
