// src/lib/nodemailer.ts
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";

export const createTransporter = async () => {
  try {
    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const accessToken = await oAuth2Client.getAccessToken();
    if (!accessToken.token) {
      throw new Error("Failed to obtain access token");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.SMTP_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    await transporter.verify();
    console.log("Transporter verified successfully");
    return transporter;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating transporter:", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};
