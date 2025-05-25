const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = 3000;

// ===== MongoDB Connection =====
mongoose
  .connect(process.env.ATLASDB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== Define Schema and Model =====
const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  submittedAt: { type: Date, default: Date.now },
});

const FormSubmission = mongoose.model("FormSubmission", formSchema);

// ===== Middleware =====
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// ===== Routes =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/submit-form", async (req, res) => {
  const { name, email, subject, message } = req.body;

  console.log("--- Form Submission Received ---");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Subject:", subject);
  console.log("Message:", message);
  console.log("------------------------------");

  try {
    const newSubmission = new FormSubmission({ name, email, subject, message });
    await newSubmission.save();

    res
      .status(200)
      .send("Your message has been sent and saved to the database!");
  } catch (err) {
    console.error("❌ Error saving to database:", err);
    res
      .status(500)
      .send(
        "An error occurred while saving your message. Please try again later."
      );
  }
});

// ===== Start Server =====
app.listen(port, () => {
  console.log(`🚀 Server listening at http://localhost:${port}`);
});
