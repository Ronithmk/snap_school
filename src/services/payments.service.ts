import { apiClient } from "@/lib/api-client";
import { env } from "@/config/env";
import { mockDelay } from "@/services/mock/transport";
import type { CreateOrderInput, CreateRazorpayOrderResult, Order, VerifyPaymentInput } from "@/types";

const ENDPOINTS = {
  createOrder: "/payments/create-order",
  verify: "/payments/verify",
} as const;

export const paymentsService = {
  /** Creates a pending order and a matching Razorpay order for the "Pay online" checkout flow. */
  async createRazorpayOrder(input: CreateOrderInput): Promise<CreateRazorpayOrderResult> {
    if (env.useMockApi) {
      return mockDelay({
        orderId: `ord_${Date.now()}`,
        orderNumber: `SS-${2026000 + Date.now() % 1000}`,
        razorpayOrderId: null,
        razorpayKeyId: null,
        amount: Math.round(input.totals.total * 100),
        currency: "INR",
        customerName: input.customerName,
        customerEmail: input.customerEmail,
      }, 500);
    }
    const { data } = await apiClient.post<CreateRazorpayOrderResult>(ENDPOINTS.createOrder, input);
    return data;
  },

  /** Verifies the Razorpay payment signature and marks the order as paid. */
  async verifyPayment(input: VerifyPaymentInput): Promise<Order> {
    if (env.useMockApi) {
      return mockDelay({} as Order, 300);
    }
    const { data } = await apiClient.post<Order>(ENDPOINTS.verify, input);
    return data;
  },
};
