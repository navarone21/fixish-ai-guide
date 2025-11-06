import { z } from "zod";

export const feedbackSchema = z.object({
  feedbackType: z.string().nonempty({ message: "Please select a feedback type" }),
  name: z
    .string()
    .trim()
    .nonempty({ message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  message: z
    .string()
    .trim()
    .nonempty({ message: "Message is required" })
    .max(2000, { message: "Message must be less than 2000 characters" }),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;
