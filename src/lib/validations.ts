import { z } from "zod";

// ─── Events ──────────────────────────────────────────────
export const createEventSchema = z.object({
    name: z
        .string()
        .min(2, "Event name must be at least 2 characters")
        .max(100, "Event name must be under 100 characters")
        .trim(),
    description: z
        .string()
        .max(500, "Description must be under 500 characters")
        .trim()
        .optional(),
    date: z.string().optional(),
});

export const updateEventSchema = z.object({
    name: z
        .string()
        .min(2, "Event name must be at least 2 characters")
        .max(100, "Event name must be under 100 characters")
        .trim()
        .optional(),
    description: z
        .string()
        .max(500, "Description must be under 500 characters")
        .trim()
        .optional(),
    date: z.string().optional(),
    status: z.enum(["draft", "active", "archived"]).optional(),
});

// ─── Attendee ────────────────────────────────────────────
export const attendeeRegisterSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be under 100 characters")
        .trim(),
    email: z.string().email("Invalid email address").trim().toLowerCase(),
    eventCode: z
        .string()
        .length(6, "Event code must be 6 characters")
        .toUpperCase(),
});

// ─── Contact Form ────────────────────────────────────────
export const contactFormSchema = z.object({
    name: z.string().min(2, "Name is required").max(100).trim(),
    email: z.string().email("Invalid email address").trim().toLowerCase(),
    subject: z.string().min(2, "Subject is required").max(200).trim(),
    message: z
        .string()
        .min(10, "Message must be at least 10 characters")
        .max(2000, "Message must be under 2000 characters")
        .trim(),
});

// ─── Attendee Auth ───────────────────────────────────────
export const attendeeAuthSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .refine((val) => !val.includes("+"), "Email cannot contain '+'")
        .transform((val) => val.trim().toLowerCase()),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(128, "Password must be under 128 characters"),
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be under 100 characters")
        .trim()
        .optional(),
});

// ─── Type exports ────────────────────────────────────────
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type AttendeeRegisterInput = z.infer<typeof attendeeRegisterSchema>;
export type AttendeeAuthInput = z.infer<typeof attendeeAuthSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
