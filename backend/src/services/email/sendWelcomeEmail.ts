import { sendSystemMessage } from "./sendSystemMessage";

export const sendWelcomeEmail = async (
  userId: number,
  name: string
): Promise<void> => {

  await sendSystemMessage({
    receiverId: userId,
    subject: "🎉 Welcome to Skillway!",
    content: `
      <p>Hello ${name},</p>
      <p>Welcome to <b>Career and Training System (Skillway)</b>!</p>
      <p>You can now explore jobs and trainings to grow your career.</p>
      <p>Best regards,<br/>The Skillway Team</p>
    `,
  });
};
