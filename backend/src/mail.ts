import nodemailer from "nodemailer"
import { config } from "./config"

// Built once, and only when an SMTP host is configured.
const transporter = config.smtp.host
    ? nodemailer.createTransport({
          host: config.smtp.host,
          port: config.smtp.port,
          secure: config.smtp.secure,
          auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
      })
    : null

/**
 * Emails a password reset link. Without an SMTP host the link is written to the log instead, which is enough for local testing.
 *
 * @param to The address to send to.
 * @param username The account's username, used in the greeting.
 * @param link The one-time reset link.
 */
export const sendPasswordResetEmail = async (to: string, username: string, link: string) => {
    if (!transporter) {
        console.log(`[mail] SMTP_HOST is not set, so no email was sent. Reset link for ${username}: ${link}`)
        return
    }

    await transporter.sendMail({
        from: config.smtp.from,
        to: to,
        subject: "Granblue Automation Statistics - Password Reset",
        text: `Hi ${username},

There was a request to reset your password. You can click the link below to change your password or disregard this email if you did not make this request.

${link}

This link expires in 60 minutes and can only be used once.`,
    })
}
