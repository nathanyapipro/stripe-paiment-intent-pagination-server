const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/payment-intents", async (req, res) => {
  const authorization = req.headers["authorization"];

  if (!authorization) {
    throw new Error("Missing STRIPE_SECRET_KEY in environment variables.");
  }
  try {
    let hasMore = true;
    let startingAfter: string | undefined;
    const allPaymentIntents: any[] = [];

    while (hasMore) {
      const response = await axios.get(
        "https://api.stripe.com/v1/payment_intents",
        {
          headers: {
            Authorization: `${authorization}`,
          },
          params: {
            starting_after: startingAfter,
            ...req.query,
          },
        }
      );

      const { data, has_more } = response.data;

      // const firstItemDate = data[0]?.created;

      // if (firstItemDate) {
      //   console.log(new Date(firstItemDate * 1000).toUTCString());
      //   console.log(data.length);
      // }

      allPaymentIntents.push(...data);
      hasMore = has_more;

      if (hasMore && data.length > 0) {
        startingAfter = data[data.length - 1].id;
      }
    }

    res.json(allPaymentIntents);
  } catch (error: any) {
    console.error("Error fetching payment intents:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching payment intents." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
