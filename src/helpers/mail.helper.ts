import nodemailer from "nodemailer";
import User from "@/models/user.model";
import { v4 as uuidv4 } from "uuid";

const accessMail = process.env.ACCESS_EMAIL!;
const accessPassword = process.env.ACCESS_EMAIL_PASSWORD!;
const domain = process.env.DOMAIN!;

export const sendEmail = async ({ email, emailType, userId }: any) => {
  try {
    let token: string | undefined;
    let tokenExpiry: number | undefined;

    if (emailType === "VERIFY") {
      // Generate verification token for email verification
      token = uuidv4();
      tokenExpiry = Date.now() + 600000; // 10 minutes expiry
      await User.findByIdAndUpdate(userId, {
        $set: { verifyToken: token, verifyTokenExpiry: tokenExpiry },
      });
    }

    if (emailType === "RECOVERY") {
      // Generate recovery token for password reset
      token = uuidv4();
      await User.findByIdAndUpdate(userId, {
        $set: { recoveryToken: token},
      });
    }

    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: accessMail,
        pass: accessPassword,
      },
    });

    const mailOptions = {
      from: {
        name: "EventSnap",
        address: accessMail,
      },
      to: email,
      subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #4CAF50;">
            ${emailType === "VERIFY" ? "Email Verification" : "Password Recovery"}
          </h2>
          <p>
            ${
              emailType === "VERIFY"
                ? "Thank you for signing up! Use the token below to verify your email address."
                : "You have requested to reset your password. Click the button below to proceed."
            }
          </p>
          ${
            emailType === "VERIFY"
              ? `
                <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border: 1px solid #ddd; border-radius: 5px;">
                  <strong>Token:</strong> <span style="font-size: 1.2em; color: #4CAF50;">${token}</span>
                </div>
              `
              : ''
          }
          <a 
            href="${domain}/organizer/${
              emailType === "VERIFY" ? "verify" : `recover?token=${token}`
            }" 
            style="display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
            ${emailType === "VERIFY" ? "Verify Email" : "Reset Password"}
          </a>
          <p style="color: #888; font-size: 0.9em;">
            This link is valid for 10 minutes. If you did not request this, please ignore this email.
          </p>
          <footer style="margin-top: 20px; font-size: 0.9em; color: #aaa;">
            <p>Best regards,</p>
            <p>EventSnap Team</p>
          </footer>
        </div>
      `,
    };
    

    const mailResponse = await transport.sendMail(mailOptions);
    return mailResponse;
  } catch (err: any) {
    console.log("Error sending email");
    console.error(err);
    throw new Error("Failed to send email");
  }
};
