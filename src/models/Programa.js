const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const ProgramaSchema = new Schema({
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

module.exports = mongoose.models.Programa || mongoose.model('Programa', ProgramaSchema);