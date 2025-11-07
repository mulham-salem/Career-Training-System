import { sendSystemMessage } from "./sendSystemMessage";

export const sendNewOpportunityEmail = async (
  employerId: number,
  employerName: string,
  title: string,
  type: "job" | "training"
): Promise<void> => {

  await sendSystemMessage({
    receiverId: employerId,
    subject:
      type === "job"
        ? "💼 New Job Opportunity Available!"
        : "🎓 New Training Opportunity Available!",
    content: `
      <p>Hello ${employerName},</p>
      <p>Your new ${type} titled "<b>${title}</b>" has been published on Skillway.</p>
      <p>You can view it anytime from your dashboard.</p>
      <p>Best regards,<br/>The Skillway Team</p>
    `,
  });
};
