
const User = require('../models/User');
const Memory = require('../models/Memory');

// Get user profile by username
exports.getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's memories
    const memories = await Memory.find({ creator: user._id })
      .sort({ createdAt: -1 })
      .populate('creator', 'username profileImage');
    
    res.json({
      user,
      memories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { bio, profileImage } = req.body;
    
    // Find user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;
    
    // Save updated user
    await user.save();
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      bio: user.bio
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Follow/Unfollow user
exports.followUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }
    
    // Find user to follow
    const userToFollow = await User.findById(req.params.id);
    
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find current user
    const currentUser = await User.findById(req.user._id);
    
    // Check if already following
    const isFollowing = currentUser.following.includes(req.params.id);
    
    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== req.params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user._id);
    }
    
    await Promise.all([currentUser.save(), userToFollow.save()]);
    
    res.json({ 
      following: currentUser.following,
      message: isFollowing ? 'User unfollowed' : 'User followed'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get popular users (most followed)
exports.getPopularUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $project: {
          username: 1,
          profileImage: 1,
          bio: 1,
          followersCount: { $size: "$followers" }
        }
      },
      { $sort: { followersCount: -1 } },
      { $limit: 5 }
    ]);
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
