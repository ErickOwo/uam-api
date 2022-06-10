const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const BaseSchema = new Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  place: {
    type: String
  },
  parrafs: {
    type: Array
  },
  imgURL: {
    type: String,
  },
  public_id: {
    type: String,
  },
});

module.exports = mongoose.models.Base || mongoose.model('Base', BaseSchema);