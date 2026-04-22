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
  const { title, company, description, salary, location } = req.body;
  try {
    const newJob = new Job({
      title,
      company,
      description,
      salary,
      location,
      postedBy: req.user.id
    });

    const job = await newJob.save();
    res.json(job);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
