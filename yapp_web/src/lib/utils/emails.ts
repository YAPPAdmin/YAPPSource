import { Logger } from "$lib/utils/logger";
import { createTransport } from "nodemailer"

export class emailManager {
    protected static JWT_SECRET: "supersecret";

    protected static emailConfig = {
        host: "mail.privateemail.com",
        port: 587,
        auth: {
            user: "yapp@yetanotherportfolioplatform.com",
            pass: "!ufus-v!7t($K6L",
         },
    }
    protected static transporter = createTransport(emailManager.emailConfig)
    protected static senderEmail = "yapp@yetanotherportfolioplatform.com"
    
    static colors = {
        brand: "var(--color-primary-500)",
        text: "var(--color-background-100)",
        background: "var(--color-background-900)",
        mainBackground: "var(--color-background-700)",
        buttonBackground: "var(--color-primary-500)",
        buttonText: "white",
    };

    static async sendEmail(receiver: string, subject: string, text: string, html: any) {
        try {
            Logger.info("[EMAIL]", "Sending Email", {reciver: receiver, subject: subject})

            // Send Email
            const result = await emailManager.transporter.sendMail({
                to: receiver,
                from: emailManager.senderEmail,
                subject: subject,
                text: text,
                html: html,
            });

            return result;
        } catch(error) {
            Logger.crit("[EMAIL]", "EMAIL_SEND_FAILIURE", String(error), {reciver: receiver, subject: subject})
            throw error
        }
    }

    static async sendTokenEmail(host: string, receiver: string, type: "updatePassword" | "updateEmail" | "resetPassword" | "verifyEmail", code: string) {
        const escapedHost = host.replace(/\./g, "&#8203;.");

        const subjects = {
            updatePassword: "Your Verification Code",
            updateEmail: "Your Verification Code",
            resetPassword: "Your Password Reset Code",
            verifyEmail: "Verify Your Email Address"
        };

        const messages  = {
            updatePassword: {
                title: "Password Change Requested",
                description: `We received a request to reset your password for your account on ${escapedHost}. Use the code below to complete your password change.`,
            },
            updateEmail: {
                title: "Email Change Requested",
                description: `We received a request to change your email address on ${escapedHost}. Use the code below to verify your new email.`,
            },
            resetPassword: {
                title: "Password Reset Requested",
                description: `We received a request to reset your password on ${escapedHost}. Use the code below to verify the reset.`,
            },
            verifyEmail: {
                title: "Verify your Email",
                description: `Use this Code to change your Email Address`
            }
        }

        const {title, description} = messages[type];
        const subject = subjects[type];

        // Plain Text Version
        const textVersion = `
            Hi!

            ${description}

            Verification Code: ${code},

            If you didn't request this, you can safely ignore this email.

            Thank you!
            The ${escapedHost} Team
            © ${new Date().getFullYear()} ${escapedHost}. All rights reserved.
        `

        // HTML Version
        const htmlVersion = `
            <body style="background-color: ${emailManager.colors.background}; font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                    style="max-width: 600px; margin: 20px auto; background-color: ${emailManager.colors.mainBackground}; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                
                    <tr>
                        <td style="padding: 20px; text-align: center; background-color: ${emailManager.colors.brand}; border-radius: 10px 10px 0 0;">
                        <h1 style="color: ${emailManager.colors.buttonText}; margin: 0; font-size: 24px;">${escapedHost}</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 20px; text-align: center;">
                            <h2 style="color: ${emailManager.colors.text}; font-size: 20px; margin-bottom: 20px;">${title}</h2>
                            <p style="color: ${emailManager.colors.text}; font-size: 16px; line-height: 24px; margin-bottom: 30px;">${description}</p>

                            <div style="display: inline-block; background-color: ${emailManager.colors.buttonBackground}; color: ${emailManager.colors.buttonText}; padding: 12px 24px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
                                ${code}
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 20px; text-align: center; font-size: 14px; color: ${emailManager.colors.text}; line-height: 20px;">
                            <p>If you didn’t request this, please ignore this email.</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 10px; text-align: center; font-size: 12px; color: ${emailManager.colors.text}; background-color: ${emailManager.colors.background}; border-radius: 0 0 10px 10px;">
                            <p>&copy; ${new Date().getFullYear()} ${escapedHost}. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </body>
        `

        return await emailManager.sendEmail(receiver, subject, textVersion, htmlVersion);
    }

    // OLD
    static async sendEmailChange(host: string, receiver: string, newEmail: string, verificationUrl: string) {
        const escapedHost = host.replace(/\./g, "&#8203;.")
        const brandColor = "#346df1"
        const color = {
            background: "#f9f9f9",
            text: "#444",
            mainBackground: "#fff",
            buttonBackground: brandColor,
            buttonBorder: brandColor,
            buttonText: "#fff",
        }

        const emailChangeVerificationHTML = `
        <body style="background-color: ${color.background}; font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: ${color.mainBackground}; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <tr>
                    <td style="padding: 20px; text-align: center; background-color: ${brandColor}; border-radius: 10px 10px 0 0;">
                        <h1 style="color: ${color.buttonText}; margin: 0; font-size: 24px;">${escapedHost}</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px; text-align: center;">
                        <h2 style="color: ${color.text}; font-size: 20px; margin-bottom: 20px;">Confirm Your New Email Address</h2>
                        <p style="color: ${color.text}; font-size: 16px; line-height: 24px; margin-bottom: 20px;">
                            We received a request to change your email address to ${newEmail}. Please verify your new email by clicking the button below.
                        </p>
                        <table border="0" cellspacing="0" cellpadding="0" align="center">
                            <tr>
                                <td align="center" style="border-radius: 5px; background-color: ${color.buttonBackground};">
                                    <a href="${verificationUrl}" target="_blank"
                                    style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 12px 24px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">
                                        Verify New Email Address
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px; text-align: center; font-size: 14px; color: ${color.text}; line-height: 20px;">
                        <p>If you did not request this change, please ignore this email or contact our support team.</p>
                        <p>For assistance, contact us at <a href="mailto:support@${escapedHost}" style="color: ${brandColor}; text-decoration: none;">support@${escapedHost}</a>.</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px; text-align: center; font-size: 12px; color: ${color.text}; background-color: ${color.background}; border-radius: 0 0 10px 10px;">
                        <p>&copy; ${new Date().getFullYear()} ${escapedHost}. All rights reserved.</p>
                    </td>
                </tr>
            </table>
        </body>
        `;

        const emailChangeVerificationText = `
        Hello,

        We received a request to change your email address to ${newEmail} for your account on ${escapedHost}.

        Please verify your new email address by clicking the link below:

        ${verificationUrl}

        If you did not request this change, please ignore this email or contact our support team at support@${escapedHost}.

        Thank you,
        The ${escapedHost} Team
        © ${new Date().getFullYear()} ${escapedHost}. All rights reserved.
        `; 

        const subject = "Your Email has been changed!"

        return await emailManager.sendEmail(receiver, subject, emailChangeVerificationText, emailChangeVerificationHTML)
    }

    // OLD
    static async sendPasswdChange(host: string, receiver: string, verificationUrl: string) {
        const escapedHost = host.replace(/\./g, "&#8203;.")
        const brandColor = "#346df1"
        const color = {
            background: "#f9f9f9",
            text: "#444",
            mainBackground: "#fff",
            buttonBackground: brandColor,
            buttonBorder: brandColor,
            buttonText: "#fff",
        }

        const passwordChangeVerificationHTML = `
            <body style="background-color: ${color.background}; font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: ${color.mainBackground}; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="padding: 20px; text-align: center; background-color: ${brandColor}; border-radius: 10px 10px 0 0;">
                            <h1 style="color: ${color.buttonText}; margin: 0; font-size: 24px;">${escapedHost}</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; text-align: center;">
                            <h2 style="color: ${color.text}; font-size: 20px; margin-bottom: 20px;">Confirm Your Password Change</h2>
                            <p style="color: ${color.text}; font-size: 16px; line-height: 24px; margin-bottom: 20px;">
                                We received a request to change your account password. Please confirm this change by clicking the button below.
                            </p>
                            <table border="0" cellspacing="0" cellpadding="0" align="center">
                                <tr>
                                    <td align="center" style="border-radius: 5px; background-color: ${color.buttonBackground};">
                                        <a href="${verificationUrl}" target="_blank"
                                        style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 12px 24px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">
                                            Confirm Password Change
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; text-align: center; font-size: 14px; color: ${color.text}; line-height: 20px;">
                            <p>If you did not request this change, please ignore this email or contact our support team immediately.</p>
                            <p>For assistance, contact us at <a href="mailto:support@${escapedHost}" style="color: ${brandColor}; text-decoration: none;">support@${escapedHost}</a>.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; text-align: center; font-size: 12px; color: ${color.text}; background-color: ${color.background}; border-radius: 0 0 10px 10px;">
                            <p>&copy; ${new Date().getFullYear()} ${escapedHost}. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </body>
        `;

        const passwordChangeVerificationText = `
            Hello,

            We received a request to change the password for your account on ${escapedHost}.

            Please confirm your password change by clicking the link below:

            ${verificationUrl}

            If you did not request this change, please ignore this email or contact our support team at support@${escapedHost}.

            Thank you,
            The ${escapedHost} Team
            © ${new Date().getFullYear()} ${escapedHost}. All rights reserved.
        `;

        const subject = "Your Password has been changed!"

        const result = await emailManager.sendEmail(receiver, subject, passwordChangeVerificationText, passwordChangeVerificationHTML)
    }
}