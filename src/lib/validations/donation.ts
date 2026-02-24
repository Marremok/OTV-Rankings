import { z } from "zod";

// Schema for donation amount (in cents)
export const donationAmountSchema = z
  .number({ message: "Amount must be a number" })
  .int({ message: "Amount must be a whole number" })
  .min(100, { message: "Minimum donation is $1.00" })
  .max(1000000, { message: "Maximum donation is $10,000.00" });

// Schema for checkout session creation
export const createCheckoutSchema = z.object({
  amount: donationAmountSchema,
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

// Schema for webhook event validation
export const webhookEventSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.record(z.string(), z.unknown()),
  }),
});
