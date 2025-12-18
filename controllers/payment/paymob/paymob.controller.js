import asyncWrapper from "../../../middlewares/asyncWrapper.js";
import axios from "axios";
import httpStatusText from "../../../utils/httpStatusText.js";
import Order from "../../../models/order.schema.js";

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_CARD_INTEGRATION_ID = process.env.PAYMOB_CARD_INTEGRATION_ID;
const PAYMOB_WALLET_INTEGRATION_ID = process.env.PAYMOB_WALLET_INTEGRATION_ID;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;

// Step 1: Get authentication token
const getAuthToken = async () => {
  const response = await axios.post(
    "https://accept.paymob.com/api/auth/tokens",
    {
      api_key: PAYMOB_API_KEY,
    }
  );
  return response.data.token;
};

// Step 2: Create order
const createPaymobOrder = async (token, amount, merchantOrderId) => {
  const response = await axios.post(
    "https://accept.paymob.com/api/ecommerce/orders",
    {
      auth_token: token,
      delivery_needed: false,
      amount_cents: Math.round(amount * 100),
      currency: "EGP",
      merchant_order_id: merchantOrderId,
      items: [],
    }
  );
  return response.data;
};

// Step 3: Get payment key
const getPaymentKey = async (
  token,
  orderId,
  amount,
  userInfo,
  integrationId
) => {
  const response = await axios.post(
    "https://accept.paymob.com/api/acceptance/payment_keys",
    {
      auth_token: token,
      amount_cents: Math.round(amount * 100),
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        email: userInfo.email || "test@test.com",
        first_name: userInfo.firstName || "Test",
        last_name: userInfo.lastName || "User",
        phone_number: userInfo.phone || "01000000000",
        apartment: "NA",
        floor: "NA",
        street: "NA",
        building: "NA",
        shipping_method: "NA",
        postal_code: "NA",
        city: "NA",
        country: "NA",
        state: "NA",
      },
      currency: "EGP",
      integration_id: integrationId,
    }
  );
  return response.data.token;
};

// Initialize payment
const initializePayment = asyncWrapper(async (req, res) => {
  const { products, shippingAddress, paymentMethod, discount } = req.body;
  const user = req.currentUser;
  // Validate products
  if (!products || !products.length) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: "Products cannot be empty",
    });
  }
  // Validate payment method
  const allowedMethods = ["card", "wallet"];
  if (!allowedMethods.includes(paymentMethod)) {
    return res
      .status(400)
      .json({ status: httpStatusText.FAIL, message: "Invalid payment method" });
  }

  // Calculate total and create order in DB

  let totalAmountBeforeDiscount = 0;
  let totalAmountAfterDiscount = 0;

  const orderProducts = products.map((item) => {
    totalAmountAfterDiscount += item.price * item.quantity;
    totalAmountBeforeDiscount += item.price * item.quantity;
    return {
      product: item.productId,
      quantity: item.quantity,
      price: item.price,
    };
  });
  // Apply discount if available
  if (discount && discount > 0) {
    totalAmountAfterDiscount =
      totalAmountBeforeDiscount - (totalAmountBeforeDiscount * discount) / 100;
  }

  const order = await Order.create({
    user: user.id,
    products: orderProducts,
    totalAmount: totalAmountAfterDiscount,
    shippingAddress,
    paymentMethod: paymentMethod || "card",
    paymentStatus: "pending",
    discount: discount || 0,
  });

  // Get Paymob token
  const authToken = await getAuthToken();
  // Create Paymob order
  const paymobOrder = await createPaymobOrder(
    authToken,
    totalAmountAfterDiscount,
    order._id.toString()
  );

  // Determine integration ID based on payment method
  const integrationId =
    paymentMethod === "wallet"
      ? PAYMOB_WALLET_INTEGRATION_ID
      : PAYMOB_CARD_INTEGRATION_ID;

  // Get payment key
  const paymentKey = await getPaymentKey(
    authToken,
    paymobOrder.id,
    totalAmountAfterDiscount,
    user,
    integrationId
  );
  // Payment URL
  const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;

  res.json({
    status: httpStatusText.SUCCESS,
    data: {
      paymentUrl,
      orderId: order._id,
      totalAmountAfterDiscount,
      discount: discount || 0,
      totalAmount: totalAmountBeforeDiscount,
    },
  });
});

const paymobWebhook = async (req, res) => {
  const data = req.body.obj;

  if (data.success) {
    await Order.findByIdAndUpdate(data.order.merchant_order_id, {
      paymentStatus: "paid",
      orderStatus: "processing",
    });
  } else {
    await Order.findByIdAndUpdate(data.order.merchant_order_id, {
      paymentStatus: "failed",
    });
  }

  res.status(200).send("OK");
};

export default {
  initializePayment,
  paymobWebhook,
};
