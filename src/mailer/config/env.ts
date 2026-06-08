import { z } from "zod";

const mailerEnvSchema = z.object({
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASS: z.string().min(1).optional(),

  GMAIL_CLIENT_ID:     z.string().optional(),
  GMAIL_CLIENT_SECRET: z.string().optional(),
  GMAIL_REFRESH_TOKEN: z.string().optional(),

  TENANT_DELACOSTA_EMAIL: z.string().email().optional(),
});

function loadMailerEnv() {
  const result = mailerEnvSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ✗ ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.warn("⚠️  Mailer env validation warnings:\n" + issues);
  }
  return result.success ? result.data : mailerEnvSchema.parse({});
}

export const mailerEnv = loadMailerEnv();
