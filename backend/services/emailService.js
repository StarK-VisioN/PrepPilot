const nodemailer = require("nodemailer");

let transporter = null;

const isEmailConfigured = () =>
    Boolean(
        process.env.SMTP_HOST &&
            process.env.SMTP_PORT &&
            process.env.SMTP_USER &&
            process.env.SMTP_PASS &&
            process.env.FROM_EMAIL
    );

const getTransporter = () => {
    if (transporter) {
        return transporter;
    }

    if (!isEmailConfigured()) {
        return null;
    }

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    return transporter;
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
    const mailer = getTransporter();

    if (!mailer) {
        if (process.env.NODE_ENV !== "production") {
            console.log("=== PASSWORD RESET EMAIL (SMTP not configured) ===");
            console.log(`To: ${to}`);
            console.log(`Reset URL: ${resetUrl}`);
            console.log("==================================================");
            return { devMode: true };
        }

        throw new Error("Email service is not configured");
    }

    const fromEmail = process.env.FROM_EMAIL;
    const appName = process.env.APP_NAME || "Interview Prep AI";

    await mailer.sendMail({
        from: `"${appName}" <${fromEmail}>`,
        to,
        subject: `Reset your ${appName} password`,
        text: [
            `Hi ${name || "there"},`,
            "",
            "We received a request to reset your password.",
            `Reset your password using this link (valid for 30 minutes):`,
            resetUrl,
            "",
            "If you did not request this, you can safely ignore this email.",
        ].join("\n"),
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
                <h2 style="margin-bottom: 8px;">Reset your password</h2>
                <p>Hi ${name || "there"},</p>
                <p>We received a request to reset your password for <strong>${appName}</strong>.</p>
                <p>
                    <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">
                        Reset Password
                    </a>
                </p>
                <p style="font-size: 14px; color: #6b7280;">This link expires in 30 minutes.</p>
                <p style="font-size: 14px; color: #6b7280;">If you did not request this, you can safely ignore this email.</p>
            </div>
        `,
    });

    return { devMode: false };
};

module.exports = {
    isEmailConfigured,
    sendPasswordResetEmail,
};
