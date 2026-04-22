const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['agent', 'recruiter'], default: 'agent' },
  bio: { type: String, default: '' },
  organization: { type: String, default: '' },
  location: { type: String, default: '' },
  experience: { type: String, default: '' },
  skills: [{ type: String }],
  appsSent: { type: Number, default: 0 },
  interviewCount: { type: Number, default: 0 },
  matchingScore: { type: Number, default: 0 },
  // Recruiter specific
  activeRoles: { type: Number, default: 0 },
  totalCandidates: { type: Number, default: 0 },
  interviewsToday: { type: Number, default: 0 },
  aadhaarDoc: { type: String, default: '' }, // URL or base64
  certificateDoc: { type: String, default: '' }, // URL or base64
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
