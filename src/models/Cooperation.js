const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const CooperationSchema = new Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  linkcooperation: {
    type: String,
  },
  imgURL: {
    type: String,
  },
  public_id: {
    type: String,
  },
});

module.exports = mongoose.models.Cooperation || mongoose.model('Cooperation', CooperationSchema);

