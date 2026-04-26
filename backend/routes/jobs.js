const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// @route   GET api/jobs
// @desc    Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'name email').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/jobs
// @desc    Create a job
router.post('/', auth, async (req, res) => {
  const { title, company, description, salary, location, type, experience, skills } = req.body;
  
  if (!title || !company || !description) {
    return res.status(400).json({ msg: 'Please include title, company, and description' });
  }

  try {
    const newJob = new Job({
      title,
      company,
      description,
      salary,
      location,
      type,
      experience,
      skills,
      postedBy: req.user.id
    });

    const job = await newJob.save();
    res.json(job);
  } catch (err) {
    console.error('Job Creation Error:', err.message);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

module.exports = router;
