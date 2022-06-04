const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const PhotoSchema = new Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  imgURL: {
    type: String,
  },
  public_id: {
    type: String,
  },
});

module.exports = mongoose.models.Photo || mongoose.model('Photo', PhotoSchema);

