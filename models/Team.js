const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: [true, 'Team Name is required'],
      trim: true,
    },
    teamLeader: {
      type: String,
      required: [true, 'Team Leader Name is required'],
      trim: true,
    },
    teamId: {
      type: String,
      required: [true, 'Team ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    points: {
      type: Number,
      required: [true, 'Points are required'],
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for descending points and creation tie-break
teamSchema.index({ points: -1, _id: 1 });

module.exports = mongoose.model('Team', teamSchema);
