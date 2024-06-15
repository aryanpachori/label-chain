import { PrismaClient } from "@prisma/client";

export const nexttask = async (workerId: number) => {
  const prisma = new PrismaClient();
  const task = await prisma.task.findFirst({
    where: {
      done: false,
      submission: {
        none: {
          worker_id: workerId,
        },
      },
    },
    select: {
      id: true,
      amount: true,
      title: true,
      options: true,
    },
  });
  return task;
};
