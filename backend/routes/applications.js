const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/applications/apply/:jobId
// @desc    Apply for a job
router.post('/apply/:jobId', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    // Check if already applied
    const existingApp = await Application.findOne({ job: req.params.jobId, agent: req.user.id });
    if (existingApp) return res.status(400).json({ msg: 'Already applied for this job' });

    const newApp = new Application({
      job: req.params.jobId,
      agent: req.user.id,
      recruiter: job.postedBy,
      status: 'pending'
    });

    await newApp.save();

    // Calculate Skill Match Percentage
    let matchScore = 0;
    const user = await User.findById(req.user.id);
    const agentSkills = user.skills || [];
    const jobSkills = (job.skills || '').split(',').map(s => s.trim().toLowerCase()).filter(s => s);
    
    if (jobSkills.length > 0) {
      const common = agentSkills.filter(s => jobSkills.includes(s.toLowerCase()));
      matchScore = Math.round((common.length / jobSkills.length) * 100);
    } else {
      matchScore = 100; // Generalist match
    }

    // Update agent's matchingScore (running average or just most recent?)
    // Let's use a weighted average favoring recent applications
    const oldScore = user.matchingScore || 0;
    const newAverage = Math.round((oldScore + matchScore) / (user.appsSent > 0 ? 2 : 1));

    await User.findByIdAndUpdate(req.user.id, { 
      $inc: { appsSent: 1 },
      $set: { matchingScore: newAverage }
    });
    
    // Increment totalCandidates for recruiter
    await User.findByIdAndUpdate(job.postedBy, { $inc: { totalCandidates: 1 } });

    res.json({ ...newApp.toObject(), matchScore });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/applications/my
// @desc    Get all applications for the logged-in user (Agent or Recruiter)
router.get('/my', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let query = {};
    
    if (user.role === 'recruiter') {
      query = { recruiter: req.user.id };
    } else {
      query = { agent: req.user.id };
    }

    const apps = await Application.find(query)
      .populate('job', 'title company')
      .populate('agent', 'name email experience skills')
      .populate('recruiter', 'name email organization')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/applications/:id/status
// @desc    Update application status (Accept/Reject)
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body; // 'accepted', 'rejected', etc.
  try {
    let app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ msg: 'Application not found' });

    // Only the recruiter can update status
    if (app.recruiter.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    app.status = status;
    await app.save();

    // If accepted, increment interview counts
    if (status === 'accepted' || status === 'interview') {
      // Increment agent interviews
      await User.findByIdAndUpdate(app.agent, { $inc: { interviewCount: 1 } });
      // Increment recruiter interviews
      await User.findByIdAndUpdate(req.user.id, { $inc: { interviewsToday: 1 } });
    }

    res.json(app);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
