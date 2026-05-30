import { Role, type User } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";

const ACCESS_TOKEN_SECONDS = 15 * 60;
const REFRESH_TOKEN_DAYS = 30;

export const signupInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().optional(),
  preferredLang: z.string().default("en"),
  preferredCountry: z.string().optional(),
  preferredCurrency: z.string().optional()
});

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const refreshInputSchema = z.object({
  refreshToken: z.string().min(16)
});

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult extends AuthTokens {
  user: Omit<User, "passwordHash">;
}

function sanitizeUser(user: User): Omit<User, "passwordHash"> {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

/**
 * Creates a signed short-lived access token for an authenticated user.
 */
export function createAccessToken(user: Pick<User, "id" | "role">): string {
  return jwt.sign({ id: user.id, role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_SECONDS
  });
}

/**
 * Creates and persists a refresh token with a 30-day expiry.
 */
export async function createRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt }
  });

  return token;
}

/**
 * Registers a new customer account and returns access plus refresh tokens.
 */
export async function signup(input: z.infer<typeof signupInputSchema>): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) throw new AppError(409, "Email is already registered");

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, 12),
      name: input.name,
      preferredLang: input.preferredLang,
      role: Role.CUSTOMER,
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.preferredCountry ? { preferredCountry: input.preferredCountry } : {}),
      ...(input.preferredCurrency ? { preferredCurrency: input.preferredCurrency } : {})
    }
  });

  const refreshToken = await createRefreshToken(user.id);
  return {
    user: sanitizeUser(user),
    accessToken: createAccessToken(user),
    refreshToken,
    expiresIn: ACCESS_TOKEN_SECONDS
  };
}

/**
 * Authenticates a user by email and password.
 */
export async function login(input: z.infer<typeof loginInputSchema>): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, "Invalid email or password");
  }

  const refreshToken = await createRefreshToken(user.id);
  return {
    user: sanitizeUser(user),
    accessToken: createAccessToken(user),
    refreshToken,
    expiresIn: ACCESS_TOKEN_SECONDS
  };
}

/**
 * Rotates a valid refresh token and returns a new token pair.
 */
export async function refresh(refreshToken: string): Promise<AuthTokens> {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true }
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } });
  const nextRefreshToken = await createRefreshToken(stored.userId);

  return {
    accessToken: createAccessToken(stored.user),
    refreshToken: nextRefreshToken,
    expiresIn: ACCESS_TOKEN_SECONDS
  };
}

/**
 * Revokes a refresh token during logout.
 */
export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

/**
 * Returns the authenticated user's current profile.
 */
export async function me(userId: string): Promise<Omit<User, "passwordHash">> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");
  return sanitizeUser(user);
}
