import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .trim()
  .min(1, "L'email est requis")
  .email("Format d'email invalide")
  .max(255, "L'email ne peut pas dépasser 255 caractères")
  .transform((email) => email.toLowerCase());

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(/[^a-zA-Z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial");

// Name validation schema
export const nameSchema = z
  .string()
  .trim()
  .min(2, "Le nom doit contenir au moins 2 caractères")
  .max(100, "Le nom ne peut pas dépasser 100 caractères")
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets");

// Phone validation schema (French format)
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Format de téléphone invalide")
  .or(z.string().length(0))
  .optional();

// Login form schema
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
});

// Signup form schema
export const signupFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  phone: phoneSchema,
});

// Reset password schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

// Types
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type SignupFormData = z.infer<typeof signupFormSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// Password strength calculator
export function calculatePasswordStrength(password: string): {
  score: number;
  message: string;
  color: "destructive" | "yellow" | "green";
} {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  let message = "";
  let color: "destructive" | "yellow" | "green" = "destructive";
  
  if (score < 2) {
    message = "Très faible - Ajoutez des caractères variés";
    color = "destructive";
  } else if (score < 3) {
    message = "Faible - Ajoutez des majuscules et chiffres";
    color = "destructive";
  } else if (score < 4) {
    message = "Moyen - Ajoutez des caractères spéciaux";
    color = "yellow";
  } else if (score < 5) {
    message = "Bon - Presque parfait";
    color = "yellow";
  } else {
    message = "Excellent - Mot de passe très sécurisé";
    color = "green";
  }
  
  return { score, message, color };
}

// Sanitize input for logging (remove sensitive data)
export function sanitizeForLogging<T extends Record<string, any>>(
  data: T,
  sensitiveKeys: string[] = ["password", "token", "apiKey"]
): Partial<T> {
  const sanitized = { ...data };
  sensitiveKeys.forEach((key) => {
    if (key in sanitized) {
      delete sanitized[key];
    }
  });
  return sanitized;
}
