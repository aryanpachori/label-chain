import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { JWT_SECRET } from "../config";
import { authMiddleware } from "./middleware";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { taskInput } from "../types";

const router = Router();
const jwt = require("jsonwebtoken");
const DEFAULT_TITLE = "Choose the most appropriate thumbnail";
const prisma = new PrismaClient();
const s3client = new S3Client({
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
  region: "ap-south-1",
});

router.post("/task", authMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;
  const body = req.body;
  const parsedData = taskInput.safeParse(body);
  if (!parsedData) {
    return res.status(411).json({ message: "You've entered wrong inputs" });
  }
  //@ts-ignore
  let responce = prisma.$transaction(async (tx) => {
    const response = await tx.task.create({
      data: {
        title: parsedData.data?.title ?? DEFAULT_TITLE,
        amount: "1",
        //@ts-ignore
        signature: parsedData.data.signature,
        user_id: userId,
      },
    });

    await tx.option.createMany({
      //@ts-ignore
      data: parsedData.data?.options.map((x) => ({
        image_url: x.imageUrl,
        task_id: response.id,
      })),
    });
    return responce;
  });
  res.json({
    id: responce.id,
  });
});

router.get("/presignedUrl", authMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;

  const { url, fields } = await createPresignedPost(s3client, {
    Bucket: "decentralized-datalabelling",
    Key: `decentralized-ctr/${userId}/${Math.random()}/image.jpg`,
    Conditions: [
      ["content-length-range", 0, 5 * 1024 * 1024], // 5 MB max
    ],
    Expires: 3600,
  });

  res.json({
    preSignedUrl: url,
    fields,
  });
});

router.post("/signin", async (req, res) => {
  const walletaddressHardcoded = "0x8351B4feA34DB4A65B48f5a9bFFB26F8734a7bB3";
  const existingUser = await prisma.user.findFirst({
    where: {
      address: walletaddressHardcoded,
    },
  });

  if (existingUser) {
    const token = jwt.sign(
      {
        userId: existingUser.id,
      },
      JWT_SECRET
    );
    return res.json({
      token,
    });
  } else {
    const user = await prisma.user.create({
      data: {
        address: walletaddressHardcoded,
      },
    });
    const token = jwt.sign({
      userId: user.id,
      JWT_SECRET,
    });
    return res.json({
      token,
    });
  }
});

export default router;
