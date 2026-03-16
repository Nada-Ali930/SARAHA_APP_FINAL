
import nodemailer from "nodemailer";
import { APPLICATION_NAME, EMAIL_APP, EMAIL_APP_PASS } from "../../../../config/config.js";

export const sendEmail = async({
    to,
    cc,
    bcc,
    subject,
    html,
    attachments=[]
}={})=>{
    
// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  service:"gmail",
  auth: {
    user: EMAIL_APP,
    pass: EMAIL_APP_PASS
  },
});


  const info = await transporter.sendMail({
    to,
    cc,
    bcc,
    subject,
    attachments,
    html,
    from: `"${APPLICATION_NAME} 💖" <${EMAIL_APP}>`
  });

  console.log("Message sent:", info.messageId);

}