const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/users
// @desc    Get all users (for chat contact search)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('name email role bio organization location experience skills createdAt');
    res.json(users);
  } catch (err) {
    console.error('Get Users Error:', err.message);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
router.put('/profile', auth, async (req, res) => {
  const { name, bio, organization, location, experience, skills, appsSent, interviewCount, matchingScore, activeRoles, totalCandidates, interviewsToday, aadhaarDoc, certificateDoc } = req.body;
  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (organization !== undefined) user.organization = organization;
    if (location !== undefined) user.location = location;
    if (experience !== undefined) user.experience = experience;
    if (skills !== undefined) user.skills = skills;
    if (appsSent !== undefined) user.appsSent = appsSent;
    if (interviewCount !== undefined) user.interviewCount = interviewCount;
    if (matchingScore !== undefined) user.matchingScore = matchingScore;
    if (activeRoles !== undefined) user.activeRoles = activeRoles;
    if (totalCandidates !== undefined) user.totalCandidates = totalCandidates;
    if (interviewsToday !== undefined) user.interviewsToday = interviewsToday;
    if (aadhaarDoc) user.aadhaarDoc = aadhaarDoc;
    if (certificateDoc) user.certificateDoc = certificateDoc;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Update Profile Error:', err.message);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

module.exports = router;
