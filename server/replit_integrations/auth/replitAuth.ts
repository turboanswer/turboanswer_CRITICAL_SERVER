import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { authStorage } from "./storage";

async function sendBrevoOtpEmail(recipientEmail: string, recipientName: string, otp: string) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    console.warn('[Email] BREVO_API_KEY not configured');
    return null;
  }
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
<div style="text-align:center;margin-bottom:24px;">
  <h2 style="color:#7c3aed;margin:0;">TurboAnswer Password Reset</h2>
</div>
<p>Hi ${recipientName},</p>
<p>We received a request to reset your TurboAnswer password. Use the verification code below to continue. This code expires in <strong>10 minutes</strong>.</p>
<div style="text-align:center;margin:32px 0;">
  <div style="display:inline-block;background:#1e1b4b;border-radius:12px;padding:24px 40px;">
    <p style="margin:0 0 8px;color:#a5b4fc;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Your 2FA Code</p>
    <p style="margin:0;color:#fff;font-size:40px;font-weight:bold;letter-spacing:12px;">${otp}</p>
  </div>
</div>
<p>If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
<hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">
<p style="font-size:13px;color:#666;margin:0;">TurboAnswer Support</p>
<p style="font-size:13px;color:#666;margin:2px 0;">Email: support@turboanswer.it.com | Phone: (866) 467-7269</p>
</body>
</html>`;
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'accept': 'application/json', 'api-key': brevoApiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'TurboAnswer', email: 'support@turboanswer.it.com' },
        to: [{ email: recipientEmail, name: recipientName }],
        subject: `${otp} is your TurboAnswer verification code`,
        htmlContent: html,
        textContent: `Your TurboAnswer password reset code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, ignore this email.`,
      }),
    });
    const result = await response.json();
    if (!response.ok) { console.error('[Email] Brevo OTP error:', result); return null; }
    console.log(`[Email] OTP sent to ${recipientEmail}`);
    return result.messageId;
  } catch (err: any) {
    console.error('[Email] OTP send failed:', err.message);
    return null;
  }
}

const ADMIN_EMAILS = ["support@turboanswer.it.com", "lanetschantret12@gmail.com"];

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "turbo-answer-secret-key-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.REPL_SLUG ? true : process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (!firstName || !firstName.trim()) {
        return res.status(400).json({ message: "First name is required" });
      }

      if (!lastName || !lastName.trim()) {
        return res.status(400).json({ message: "Last name is required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }

      const existing = await authStorage.getUserByEmail(email.toLowerCase());
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const isAdmin = ADMIN_EMAILS.some(e => e.toLowerCase() === email.toLowerCase());
      const user = await authStorage.upsertUser({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        isEmployee: isAdmin,
        employeeRole: isAdmin ? "super_admin" : "basic",
        canViewAllChats: isAdmin,
        canBanUsers: isAdmin,
      });

      (req.session as any).userId = user.id;
      res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isEmployee: user.isEmployee });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await authStorage.getUserByEmail(email.toLowerCase());
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (user.isBanned) {
        if (user.banExpiresAt && new Date(user.banExpiresAt) <= new Date()) {
          await authStorage.unbanUser(user.id);
        } else {
          const banMsg = user.banExpiresAt 
            ? `This account is banned until ${new Date(user.banExpiresAt).toLocaleDateString()}.`
            : "This account has been permanently banned.";
          return res.status(403).json({ message: banMsg });
        }
      }

      const isAdminEmail = ADMIN_EMAILS.some(e => e.toLowerCase() === user.email.toLowerCase());
      if (isAdminEmail && !user.isEmployee) {
        await authStorage.upsertUser({
          ...user,
          isEmployee: true,
          employeeRole: "super_admin",
          canViewAllChats: true,
          canBanUsers: true,
        });
        user.isEmployee = true;
      }

      await authStorage.updateLastLogin(user.id);
      (req.session as any).userId = user.id;
      res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isEmployee: user.isEmployee });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed. Please try again." });
    }
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      res.redirect("/");
    });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const user = await authStorage.getUserByEmail(email.toLowerCase());
      if (!user) {
        return res.json({ message: "If that email exists, a code has been sent." });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await authStorage.setPasswordResetOtp(user.id, otp, expiresAt);

      const name = user.firstName || email;
      await sendBrevoOtpEmail(email.toLowerCase(), name, otp);

      res.json({ message: "If that email exists, a code has been sent." });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  app.post("/api/auth/verify-reset-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) return res.status(400).json({ message: "Email and code are required" });

      const user = await authStorage.getUserByEmail(email.toLowerCase());
      if (!user || !user.passwordResetOtp || !user.passwordResetOtpExpires) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }

      if (new Date() > new Date(user.passwordResetOtpExpires)) {
        await authStorage.clearPasswordResetOtp(user.id);
        return res.status(400).json({ message: "Code has expired. Please request a new one." });
      }

      if (user.passwordResetOtp !== otp.trim()) {
        return res.status(400).json({ message: "Incorrect code. Please try again." });
      }

      const verifiedExpires = new Date(Date.now() + 15 * 60 * 1000);
      await authStorage.markPasswordResetVerified(user.id, verifiedExpires);

      res.json({ success: true, userId: user.id });
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { userId, newPassword } = req.body;
      if (!userId || !newPassword) return res.status(400).json({ message: "Missing required fields" });

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const user = await authStorage.getUser(userId);
      if (!user || !user.passwordResetVerified || !user.passwordResetVerifiedExpires) {
        return res.status(400).json({ message: "Verification required. Please start over." });
      }

      if (new Date() > new Date(user.passwordResetVerifiedExpires)) {
        await authStorage.clearPasswordResetOtp(userId);
        return res.status(400).json({ message: "Session expired. Please start over." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await authStorage.updatePassword(userId, hashedPassword);

      res.json({ success: true, message: "Password updated successfully." });
    } catch (error: any) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  (req as any).user = {
    claims: { sub: userId },
  };

  next();
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await authStorage.getUser(userId);
  if (!user || !user.isEmployee) {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  (req as any).user = {
    claims: { sub: userId },
  };

  next();
};
