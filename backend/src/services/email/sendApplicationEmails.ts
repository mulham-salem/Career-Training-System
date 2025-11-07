import { sendSystemMessage } from "./sendSystemMessage";

export const sendApplicationEmails = async (
  jobSeekerId: number,
  jobSeekerName: string,
  employerId: number,
  employerName: string,
  title: string,
  type: "job" | "training"
): Promise<void> => {

  await sendSystemMessage({
    receiverId: jobSeekerId,
    subject: "📢 Your application has been received!",
    content: `
      <p>Hello ${jobSeekerName},</p>
      <p>Your application for the ${type} "<b>${title}</b>" has been received.</p>
      <p>We'll notify you once it's reviewed.</p>
      <p>Best regards,<br/>The Skillway Team</p>
    `,
  });

  await sendSystemMessage({
    receiverId: employerId,
    subject: "📢 New applicant for your opportunity!",
    content: `
      <p>Hello ${employerName},</p>
      <p>New applicant <b>${jobSeekerName}</b> applied for your ${type} "<b>${title}</b>".</p>
      <p>You can view details in your dashboard.</p>
      <p>Best regards,<br/>The Skillway Team</p>
    `,
  });
};
