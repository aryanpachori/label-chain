import { DECIMALS, JWT_SECRET_WORKER } from "./../config";
import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authMiddlewareWorkers } from "./middleware";
import { nexttask } from "../db";
import { submissionInput } from "../types";
const router = Router();
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const TOTAL_SUBMISSIONS = 100;

router.post("/signin", async (req, res) => {
  const walletaddressHardcoded =
    "0x8351B4feA34DB4A65B48f5a9bFFB26F8734a7bB3hckjacbkj";
  const existingWorker = await prisma.workers.findFirst({
    where: {
      address: walletaddressHardcoded,
    },
  });
  if (existingWorker) {
    const token = jwt.sign({ workerId: existingWorker.id }, JWT_SECRET_WORKER);
    return res.json({ token });
  } else {
    const worker = await prisma.workers.create({
      data: {
        address: walletaddressHardcoded,
        pending_amount: 0,
        locked_amount: 0,
      },
    });
    const token = jwt.sign({ workerId: worker.id }, JWT_SECRET_WORKER);
    return res.json({ token });
  }
});

router.get("/nextTask", authMiddlewareWorkers, async (req, res) => {
  //@ts-ignore
  const workerId = req.workerId;
  const task = await nexttask(Number(workerId));
  if (!task) {
    return res.status(411).json({
      message: "No task left for you to review.",
    });
  } else {
    res.json({
      task,
    });
  }
});

router.post("/submission", authMiddlewareWorkers, async (req, res) => {
  //@ts-ignore
  const workerId = req.workerId;
  const body = req.body;
  const parsedData = submissionInput.safeParse(body);

  if (parsedData.success) {
    const task = await nexttask(Number(workerId));

    if (!task || task?.id !== Number(parsedData.data.taskId)) {
      return res.status(411).json({ message: "Invalid task id" });
    }
    const amount = (Number(task.amount) / TOTAL_SUBMISSIONS).toString();
    const submission = await prisma.$transaction(async (tx) => {
      const submisson = await tx.submission.create({
        data: {
          option_id: Number(parsedData.data?.OptionId),
          worker_id: workerId,
          task_id: Number(parsedData.data?.taskId),
          amount: Number(amount),
        },
      });
      await tx.workers.update({
        where: {
          id: workerId,
        },
        data: {
          pending_amount: {
            increment: Number(amount),
          },
        },
      });
      return submisson;
    });

    const nextTask = await nexttask(Number(workerId));
    return res.json({
      nextTask,
      amount,
    });
  } else {
    res.status(411).json({
      message: "Incorrect inputs",
    });
  }
});

router.get("/balances", authMiddlewareWorkers, async (req, res) => {
  // @ts-ignore
  const workerId = req.workerId;
  const worker = await prisma.workers.findFirst({
    where: {
      id: Number(workerId),
    },
  });
  res.json({
    pendingAmount: worker?.pending_amount,
    lockedAmount: worker?.locked_amount,
  });
});

router.post("/payouts", authMiddlewareWorkers, async (req, res) => {
  //@ts-ignore
  const workerId = req.workerId;
  const worker = await prisma.workers.findFirst({
    where: {
      id: Number(workerId),
    },
  });
  if (!worker) {
    return res.status(411).json({ message: "worker not found" });
  }
  const address = worker.address;
  const txnId = "dowuhgdcuikgckhjcjh";

  await prisma.$transaction(async (tx) => {
    await tx.workers.update({
      where: {
        id: Number(workerId),
      },
      data: {
        pending_amount: {
          decrement: worker.pending_amount,
        },
        locked_amount: {
          increment: worker.pending_amount,
        },
      },
    });
    await tx.payouts.create({
      data:{
        user_id : Number(workerId),
        amount : worker.pending_amount,
        status : "Processing",
        signature: txnId
      }
    })
  });
  return res.json({
    message : "processing amount",
    amount : worker.pending_amount
  })
});
export default router;
