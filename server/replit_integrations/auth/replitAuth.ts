import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { generateSecret, generateURI, verifySync } from "otplib";
import * as QRCode from "qrcode";
import { authStorage } from "./storage";

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
      secure: process.env.NODE_ENV === "production",
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
      const user = await authStorage.upsertUser({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
      });

      (req.session as any).userId = user.id;
      res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password, totpCode } = req.body;

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
        return res.status(403).json({ message: "This account has been banned" });
      }

      if (user.twoFactorEnabled) {
        if (!totpCode) {
          return res.status(200).json({ requires2FA: true, message: "Please enter your 2FA code" });
        }

        const result = verifySync({ token: totpCode, secret: user.twoFactorSecret! });
        if (!result.valid) {
          return res.status(401).json({ message: "Invalid 2FA code" });
        }
      }

      await authStorage.updateLastLogin(user.id);
      (req.session as any).userId = user.id;
      res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, twoFactorEnabled: user.twoFactorEnabled });
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

  app.post("/api/2fa/setup", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const secret = generateSecret();
      const otpauthUrl = generateURI({ secret, issuer: "TurboAnswer", label: user.email || "user", type: "totp" });
      const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

      await authStorage.setTwoFactorSecret(userId, secret);
      res.json({ qrCode: qrCodeUrl, secret, manualEntry: secret });
    } catch (error: any) {
      console.error("2FA setup error:", error);
      res.status(500).json({ message: "Failed to set up 2FA" });
    }
  });

  app.post("/api/2fa/verify", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code } = req.body;
      const user = await authStorage.getUser(userId);
      if (!user || !user.twoFactorSecret) return res.status(400).json({ message: "2FA not set up" });

      const verifyResult = verifySync({ token: code, secret: user.twoFactorSecret });
      if (!verifyResult.valid) {
        return res.status(401).json({ message: "Invalid code. Try again." });
      }

      await authStorage.enableTwoFactor(userId);
      res.json({ message: "2FA enabled successfully" });
    } catch (error: any) {
      console.error("2FA verify error:", error);
      res.status(500).json({ message: "Failed to verify 2FA" });
    }
  });

  app.post("/api/2fa/disable", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code } = req.body;
      const user = await authStorage.getUser(userId);
      if (!user || !user.twoFactorEnabled) return res.status(400).json({ message: "2FA not enabled" });

      const disableResult = verifySync({ token: code, secret: user.twoFactorSecret! });
      if (!disableResult.valid) {
        return res.status(401).json({ message: "Invalid code" });
      }

      await authStorage.disableTwoFactor(userId);
      res.json({ message: "2FA disabled" });
    } catch (error: any) {
      console.error("2FA disable error:", error);
      res.status(500).json({ message: "Failed to disable 2FA" });
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
