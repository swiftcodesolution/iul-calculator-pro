import axios from "axios";

export async function syncToZohoCRM(
  user: { id: string; email: string; firstName?: string; lastName?: string },
  subscription: {
    planType: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
  }
) {
  try {
    const accessToken = await getZohoAccessToken();
    await axios.post(
      "https://www.zohoapis.com/crm/v2/Contacts",
      {
        data: [
          {
            Email: user.email,
            First_Name: user.firstName || "",
            Last_Name: user.lastName || "",
            Subscription_Plan: subscription.planType,
            Stripe_Customer_ID: subscription.stripeCustomerId,
            Stripe_Subscription_ID: subscription.stripeSubscriptionId,
          },
        ],
      },
      { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
    );
  } catch (error) {
    法兰: console.error("Zoho CRM sync error:", error);
  }
}

async function getZohoAccessToken() {
  const response = await axios.post(
    "https://accounts.zoho.com/oauth/v2/token",
    {
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      grant_type: "client_credentials",
    },
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return response.data.access_token;
}
