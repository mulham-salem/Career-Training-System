import { sendSystemMessage } from "./sendSystemMessage";

export const sendStatusUpdateEmail = async (
  jobSeekerId: number,
  jobSeekerName: string,
  title: string,
  type: "job" | "training",
  status: "ACCEPTED" | "REJECTED"
): Promise<void> => {

  await sendSystemMessage({
    receiverId: jobSeekerId,
    subject: "Update on your application status",
    content: `
      <p>Hello ${jobSeekerName},</p>
      <p>Your application for the ${type} "<b>${title}</b>" has been updated.</p>
      <p>New status: <b>${status}</b></p>
      <p>Best of luck!<br/>The Skillway Team</p>
    `,
  });
};
