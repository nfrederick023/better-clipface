/**
 * Handles authentication
 *
 * This module should only be imported from server code.
 */

import { randomBytes, scryptSync } from "crypto";

import { AuthStatus } from "./interfaces";
import { NextPageContext } from "next";
import { Request } from "express";
import config from "config";

export const getAuthStatus = async (ctx: NextPageContext): Promise<AuthStatus> => {

  if (!config.get("user_password"))
    return AuthStatus.notAuthenticated;

  const hasAuthToken = !!(ctx.req as Request | undefined)?.cookies?.authToken;
  const isAuthTokenValid = await isTokenValid(ctx.req as Request);

  if (hasAuthToken && !isAuthTokenValid && ctx.res) {
    ctx.res.setHeader("Set-Cookie", "authToken=; Max-Age=0");
    ctx.res.setHeader("Location", "/login");
  }

  if (isAuthTokenValid)
    return AuthStatus.authenticated;

  return AuthStatus.notAuthenticated;
};

export const isTokenValid = async (req: Request): Promise<boolean> => {
  return await checkHashedPassword("default", req?.cookies?.authToken ?? "");
};

export const checkHashedPassword = async (user: string, hashedPassword: string): Promise<boolean> => {
  if (user !== "default") {
    //throw "Logging in as non-default user is not yet supported";
  }

  const salt = hashedPassword.slice(64);
  const serverPassword = scryptSync(config.get("user_password"), salt, 32).toString("hex") + salt;
  return serverPassword === hashedPassword;
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString("hex");
  return scryptSync(password, salt, 32).toString("hex") + salt;
};