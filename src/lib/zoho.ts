/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/zoho.ts
import axios from "axios";

export async function syncToZohoCRM(
  user: { id: string; email: string; firstName?: string; lastName?: string },
  subscription: {
    planType: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
  }
) {
  console.log("syncToZohoCRM started for user:", user.email);
  try {
    const accessToken = await getZohoAccessToken();
    console.log("Access token obtained, calling CRM API");
    const zohoApiBaseUrl =
      process.env.ZOHO_API_BASE_URL || "https://www.zohoapis.com";
    const moduleName = "IUL_Calculator_Pro_Leads"; // Replace if incorrect
    const response = await axios.post(
      `${zohoApiBaseUrl}/crm/v2/${moduleName}`,
      {
        data: [
          {
            Email: user.email,
            First_Name: user.firstName || "",
            Last_Name: user.lastName || "",
            Subscription_Plan: subscription.planType,
            Stripe_Customer_ID: subscription.stripeCustomerId || "",
            Stripe_Subscription_ID: subscription.stripeSubscriptionId || "",
          },
        ],
      },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Zoho CRM sync successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Zoho CRM sync error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      requestData: {
        email: user.email,
        planType: subscription.planType,
        stripeCustomerId: subscription.stripeCustomerId,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
      },
    });
    throw new Error("Failed to sync with Zoho CRM");
  }
}

async function getZohoAccessToken(): Promise<string> {
  console.log("getZohoAccessToken started");
  try {
    if (
      !process.env.ZOHO_CLIENT_ID ||
      !process.env.ZOHO_CLIENT_SECRET ||
      !process.env.ZOHO_REFRESH_TOKEN
    ) {
      console.error("Missing Zoho env vars:", {
        clientId: process.env.ZOHO_CLIENT_ID ? "Set" : "Missing",
        clientSecret: process.env.ZOHO_CLIENT_SECRET ? "Set" : "Missing",
        refreshToken: process.env.ZOHO_REFRESH_TOKEN ? "Set" : "Missing",
      });
      throw new Error("Missing Zoho environment variables");
    }

    const zohoAuthBaseUrl =
      process.env.ZOHO_AUTH_BASE_URL || "https://accounts.zoho.com";
    console.log("Requesting token from:", `${zohoAuthBaseUrl}/oauth/v2/token`);
    const response = await axios.post(
      `${zohoAuthBaseUrl}/oauth/v2/token`,
      new URLSearchParams({
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: "refresh_token",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("Zoho OAuth response:", response.data);
    const accessToken = response.data.access_token;
    if (!accessToken) {
      console.error("No access token in response:", {
        responseData: response.data,
        status: response.status,
      });
      throw new Error("No access token returned from Zoho");
    }
    console.log("Zoho access token retrieved, scope:", response.data.scope);
    return accessToken;
  } catch (error: any) {
    const zohoAuthBaseUrl =
      process.env.ZOHO_AUTH_BASE_URL || "https://accounts.zoho.com";

    console.error("Zoho access token error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      request: {
        url: `${zohoAuthBaseUrl}/oauth/v2/token`,
        data: {
          refresh_token: process.env.ZOHO_REFRESH_TOKEN ? "Set" : "Missing",
          client_id: process.env.ZOHO_CLIENT_ID ? "Set" : "Missing",
          client_secret: process.env.ZOHO_CLIENT_SECRET ? "Set" : "Missing",
          grant_type: "refresh_token",
        },
      },
    });
    throw new Error("Unable to obtain Zoho access token");
  }
}
