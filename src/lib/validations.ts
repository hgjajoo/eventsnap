import { z } from "zod";

// ─── Organizer Auth ──────────────────────────────────────
export const signupSchema = z.object({
    fullName: z
        .string()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name must be under 100 characters")
        .trim(),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be under 30 characters")
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, and underscores"
        )
        .trim(),
    email: z.string().email("Invalid email address").trim().toLowerCase(),
    phone: z.string().optional(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(
            /[^a-zA-Z0-9]/,
            "Password must contain at least one special character"
        ),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address").trim().toLowerCase(),
    password: z.string().min(1, "Password is required"),
});

export const recoveryRequestSchema = z.object({
    emailForRecovery: z
        .string()
        .email("Invalid email address")
        .trim()
        .toLowerCase(),
});

export const passwordResetSchema = z
    .object({
        token: z.string().min(1, "Token is required"),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(
                /[^a-zA-Z0-9]/,
                "Password must contain at least one special character"
            ),
        confirmPassword: z.string().min(1, "Confirm password is required"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const verifyTokenSchema = z.object({
    token: z.string().min(1, "Verification token is required"),
});

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
    date: z
        .string()
        .datetime({ offset: true })
        .optional()
        .or(z.string().optional()),
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

export const attendeeAccessSchema = z.object({
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

// ─── Type exports ────────────────────────────────────────
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RecoveryRequestInput = z.infer<typeof recoveryRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type VerifyTokenInput = z.infer<typeof verifyTokenSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type AttendeeRegisterInput = z.infer<typeof attendeeRegisterSchema>;
export type AttendeeAccessInput = z.infer<typeof attendeeAccessSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
