const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const nodeMailer = require("nodemailer");
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

  // ===== Input Validation =====
  if (!name || !email || !subject || !message) {
    return res.status(400).send("All fields are required.");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send("Please provide a valid email address.");
  }

  console.log("--- Form Submission Received ---");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Subject:", subject);
  console.log("Message:", message);
  console.log("------------------------------");

  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const newSubmission = new FormSubmission({ name, email, subject, message });
    await newSubmission.save();

    // Send email notification to admin
    const adminMailOptions = {
      from: `"Muazzam Hussain" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Form Submission: ${subject}`,
      text: `You have received a new message from ${name} (${email}):\n\n${message}`, // fallback plain text
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">📬 New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="border-left: 4px solid #007BFF; padding-left: 15px; color: #555;">${message.replace(
              /\n/g,
              "<br>"
            )}</blockquote>
            <hr style="margin-top: 30px;" />
            <p style="font-size: 12px; color: #aaa;">This message was sent on ${new Date().toLocaleString()}.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(adminMailOptions);
    console.log("✅ Admin email sent successfully!");

    // Send confirmation email to user
    const userMailOptions = {
      from: `"Muazzam Hussain" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Thank you for your message: ${subject}`,
      text: `Hi ${name},\n\nThank you for reaching out! We have received your message and will get back to you soon.\n\nBest regards,\nMuazzam Hussain, Software Engineer`,
      html: `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f6f9; padding: 40px 0;">
  <div style="max-width: 640px; margin: auto; background: #ffffff; border-radius: 12px; padding: 40px 30px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);">
    
    <h2 style="color: #1a1a1a; font-size: 26px; margin-bottom: 20px;">👋 Hello ${name},</h2>
    
    <p style="font-size: 16px; color: #444; line-height: 1.7; margin-bottom: 20px;">
      Thank you for reaching out! Your message has been received and I appreciate you taking the time to contact me.
    </p>

    <p style="font-size: 16px; color: #444; line-height: 1.7; margin-bottom: 25px;">
      I’ll review your message and get back to you as soon as I can. Meanwhile, feel free to explore my work or connect through the links below.
    </p>

    <div style="text-align: center; margin: 35px 0;">
      <a href="https://muazzam.up.railway.app/" style="background: linear-gradient(90deg, #4f46e5, #6366f1); padding: 14px 30px; border-radius: 8px; color: white; font-size: 15px; font-weight: 600; text-decoration: none; display: inline-block;">
        🌐 View My Portfolio
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />

    <div style="display: flex; align-items: center;">
      <img src="https://muazzam.up.railway.app/assets/img/pixelcut-export.png" alt="Muazzam Hussain" style="width: 65px; height: 65px; border-radius: 50%; margin-right: 15px; border: 2px solid #e0e0e0;" />
      <div>
        <p style="margin: 0; font-size: 17px; font-weight: bold; color: #333;">Muazzam Hussain</p>
        <p style="margin: 3px 0; font-size: 14px; color: #666;">Aspiring Software Engineer</p>
        <p style="margin: 2px 0; font-size: 13px; color: #999;">Java • C++ • SQL • MERN Stack</p>
      </div>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="https://github.com/muazzamhussain" style="margin: 0 8px;">
        <img src="https://cdn-icons-png.flaticon.com/24/733/733553.png" alt="GitHub" style="vertical-align: middle;" />
      </a>
      <a href="https://linkedin.com/in/muazzamhussain" style="margin: 0 8px;">
        <img src="https://cdn-icons-png.flaticon.com/24/174/174857.png" alt="LinkedIn" style="vertical-align: middle;" />
      </a>
    </div>

    <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 40px;">
      Sent on ${new Date().toLocaleString()}<br />
      This email was automatically generated based on your submission.
    </p>
  </div>
</div>

`,
    };

    await transporter.sendMail(userMailOptions);
    console.log("✅ User confirmation email sent successfully!");

    res
      .status(200)
      .send("Your message has been sent and saved to the database!");
  } catch (err) {
    console.error("❌ Error:", err);
    res
      .status(500)
      .send(
        "An error occurred while saving your message or sending the email. Please try again later."
      );
  }
});

// ===== Start Server =====
app.listen(port, () => {
  console.log(`🚀 Server listening at http://localhost:${port}`);
});
