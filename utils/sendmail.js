const nodemailer = require("nodemailer");
// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "gmail",
  auth: {
    user: "anhduong097878@gmail.com",
    pass: "anh0978784112",
  },
});

// Function to send email
function sendEmail(options) {
  // Send email using Nodemailer
  const mailOptions = {
    from: options.from,
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
}

module.exports = sendEmail;
