import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { env } from "../../config/env.js";
import { ensureResendClient } from "../../lib/resend.js";

export const listUsers = async (filters = {}) => {
  return prisma.user.findMany({
    where: {
      role: filters.role
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};

export const createUser = async (payload) => {
  try {
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        fullName: payload.fullName,
        role: payload.role,
        bio: payload.bio,
        skills: payload.skills,
        hourlyRate: payload.hourlyRate
      }
    });

    await maybeSendWelcomeEmail(user);

    return user;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError("A user with that email already exists", 409);
    }

    throw error;
  }
};

const maybeSendWelcomeEmail = async (user) => {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    return;
  }

  try {
    const resend = ensureResendClient();
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: user.email,
      subject: "Welcome to the Freelancer platform",
      html: `<p>Hi ${user.fullName},</p><p>Thanks for joining the platform as a ${user.role.toLowerCase()}!</p>`
    });
  } catch (emailError) {
    console.warn("Unable to send welcome email via Resend:", emailError);
  }
};
