import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient();

export const getNextTask = async(userId:string) => {
    const nextTask = await prisma.task.findFirst({
        where: {
            done: false,
            submissions: {
                none: {
                    worker_id: Number(userId)
                }
            }
        },
        select: {
            title: true,
            id: true,
            options: true,
            amount: true
        }
    })
    return nextTask;
}