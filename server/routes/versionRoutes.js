const express = require("express");
const router = express.Router();
const Version = require("../models/Version");
const versionRoutes = require("./routes/versionRoutes");
app.use("/api/versions", versionRoutes);

router.post("/save", async (req, res) => {
  const { docId, content } = req.body;
  try {
    await Version.create({ docId, content });
    res.status(200).send("Snapshot saved!");
  } catch (err) {
    res.status(500).send("Error saving version");
  }
});

router.get("/:docId", async (req, res) => {
  try {
    const versions = await Version.find({ docId: req.params.docId }).sort({ createdAt: -1 });
    res.status(200).json(versions);
  } catch (err) {
    res.status(500).send("Error fetching versions");
  }
});

module.exports = router;
