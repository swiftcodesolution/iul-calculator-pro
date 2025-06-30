import axios from "axios";

export async function syncToZarMoney(
  user: { email: string; firstName?: string; lastName?: string },
  subscription: { planType: string; amount: number; createdAt: Date }
) {
  try {
    const response = await axios.post(
      "https://api.zarmoney.com/customers",
      {
        email: user.email,
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        invoices: [
          {
            amount: subscription.amount,
            date: subscription.createdAt,
            description: subscription.planType,
          },
        ],
      },
      { headers: { Authorization: `Bearer ${process.env.ZAR_MONEY_API_KEY}` } }
    );
    return response.data;
  } catch (error) {
    console.error("ZarMoney sync error:", error);
  }
}
