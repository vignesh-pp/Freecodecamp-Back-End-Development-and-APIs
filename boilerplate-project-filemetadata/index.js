var express = require("express");
var cors = require("cors");
require("dotenv").config();
var multer = require("multer");
const upload = multer({ limits: { fileSize: 5000 } });

var app = express();

app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/fileanalyse", upload.any(), (req, res) => {
  if (!req.files) {
    return res
      .status(400)
      .json({ error: "No file uploaded under field name 'upfile'." });
  }

  const { originalname, mimetype, size } = req.files[0];
  res.json({
    name: originalname,
    type: mimetype,
    size: size,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});
