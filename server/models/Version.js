const mongoose = require("mongoose");

const VersionSchema = new mongoose.Schema({
  docId: String,
  content: Object,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Version", VersionSchema);
