import { PrismaClient } from '@prisma/client';
import { sendEmail } from "../../utils/email";

const prisma = new PrismaClient();

interface SystemMessageParams {
    receiverId: number;
    subject: string;
    content: string;
}

export const sendSystemMessage = async ({ receiverId, subject, content }: SystemMessageParams): Promise<void> => {
    try {
        const message = await prisma.message.create({
            data: {
                receiverId,
                subject,
                content,
                status: "PENDING",
            },
        });

        const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
            select: { email: true },
        });

        if(receiver?.email) {
            const sent = await sendEmail(receiver.email, subject, content);

            await prisma.message.update({
                where: { id: message.id },
                data: { status: sent ? "SENT" : "FAILED" },
            });
        }
    } catch (err) {
        console.error("Error in sendSystemMessage:", err);
    }
}