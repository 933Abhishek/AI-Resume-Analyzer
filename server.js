const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const app = express();
const upload = multer({ dest: "uploads/" });

// 👉 Serve HTML
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// 🔥 Skills list
const skillsList = [
  "JavaScript","React","Node.js","Python",
  "Java","C","C++","HTML","CSS","MongoDB","SQL"
];

// 🔥 Extract skills
function extractSkills(text) {
  return skillsList.filter(skill =>
    text.toLowerCase().includes(skill.toLowerCase())
  );
}

// 🔥 Score system
function calculateScore(text, skills) {
  let score = skills.length * 10;

  if (text.toLowerCase().includes("project")) score += 20;
  if (text.toLowerCase().includes("experience")) score += 20;
  if (text.toLowerCase().includes("education")) score += 10;

  return Math.min(score, 100);
}

// 🔥 FREE AI Suggestions (NO API)
function getAISuggestions(text, skills) {
  let suggestions = [];

  if (skills.length < 3) {
    suggestions.push("Add more technical skills");
  }

  if (!text.toLowerCase().includes("project")) {
    suggestions.push("Add at least 2 projects");
  }

  if (!text.toLowerCase().includes("experience")) {
    suggestions.push("Add internship or experience");
  }

  if (!text.toLowerCase().includes("education")) {
    suggestions.push("Add education section");
  }

  if (text.length < 1000) {
    suggestions.push("Increase resume content (too short)");
  }

  if (suggestions.length === 0) {
    suggestions.push("Your resume looks good 👍");
  }

  return suggestions.join("\n");
}

// 🔥 API
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        text: "No file uploaded",
        skills: [],
        score: 0,
        suggestions: ""
      });
    }

    const buffer = fs.readFileSync(req.file.path);

    let text = "";
    try {
      const data = await pdfParse(buffer);
      text = data.text;
    } catch {
      text = "PDF read error";
    }

    const skills = extractSkills(text);
    const score = calculateScore(text, skills);
    const suggestions = getAISuggestions(text, skills);

    res.json({
      text,
      skills,
      score,
      suggestions
    });

  } catch (err) {
    console.log(err);
    res.json({
      text: "Server error",
      skills: [],
      score: 0,
      suggestions: ""
    });
  }
});

app.listen(5000, () => {
  console.log("👉 Open: http://localhost:5000");
});