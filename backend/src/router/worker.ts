import { DECIMALS, JWT_SECRET_WORKER } from "./../config";
import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authMiddlewareWorkers } from "./middleware";
import { nexttask } from "../db";
import { submissionInput } from "../types";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
const router = Router();
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const TOTAL_SUBMISSIONS = 100;

router.post("/signin", async (req, res) => {
  const { publicKey, signature } = req.body;
  const message = new TextEncoder().encode("Sign into LabelChain as a worker");

  
  const signatureArray = new Uint8Array(signature);

  if (signatureArray.length !== 64) {
    return res.status(400).json({
      message: "Signature must be 64 bytes long"
    });
  }

  const result = nacl.sign.detached.verify(
    message,
    signatureArray,
    new PublicKey(publicKey).toBytes()
  );

  if (!result) {
    return res.status(411).json({
      message: "Incorrect signature"
    });
  }

  const existingWorker = await prisma.workers.findFirst({
    where: {
      address: publicKey,
    },
  });
  if (existingWorker) {
    const token = jwt.sign({ workerId: existingWorker.id }, JWT_SECRET_WORKER);
    return res.json({ token });
  } else {
    const worker = await prisma.workers.create({
      data: {
        address: publicKey,
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
      const submission = await tx.submission.upsert({
        where: {
          worker_id_task_id: {
            worker_id: workerId,
            task_id: Number(parsedData.data.taskId),
          },
        },
        update: {
          option_id: Number(parsedData.data?.OptionId),
          amount: Number(amount),
        },
        create: {
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
      return submission;
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
      data: {
        user_id: Number(workerId),
        amount: worker.pending_amount,
        status: "Processing",
        signature: txnId,
      },
    });
  });
  return res.json({
    message: "processing amount",
    amount: worker.pending_amount,
  });
});
export default router;
