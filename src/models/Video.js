const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const VideoSchema = new Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  videoURL: {
    type: String,
  },
  public_id: {
    type: String,
  },
});

module.exports = mongoose.models.Video || mongoose.model('Video', VideoSchema);