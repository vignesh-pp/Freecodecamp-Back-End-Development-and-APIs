const express = require("express");
const cors = require("cors");
const dns = require("dns");
const urlParser = require("url");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static FCC test HTML
app.use("/public", express.static(`${process.cwd()}/public`));

// Basic homepage
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

let urlDatabase = [];
let counter = 1;

// POST to shorten a URL
app.post("/api/shorturl", (req, res) => {
  let originalUrl = req.body.url;

  try {
    const parsedUrl = new URL(originalUrl);

    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      } else {
        // Save URL with short id
        const shortUrl = counter++;
        urlDatabase[shortUrl] = originalUrl;

        return res.json({
          original_url: originalUrl,
          short_url: shortUrl,
        });
      }
    });
  } catch (e) {
    return res.json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  const originalUrl = urlDatabase[id];

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: "No short URL found for given input" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
