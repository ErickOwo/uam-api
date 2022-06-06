const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const RecursoSchema = new Schema({
  name: {
    type: String,
  },
  position: {
    type: String,
  },
  imgURL: {
    type: String,
  },
  public_id: {
    type: String,
  },
});

module.exports = mongoose.models.Recurso || mongoose.model('Recurso', RecursoSchema);

