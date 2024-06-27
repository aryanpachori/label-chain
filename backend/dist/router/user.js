"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const config_1 = require("../config");
const middleware_1 = require("./middleware");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
const types_1 = require("../types");
const web3_js_1 = require("@solana/web3.js");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const router = (0, express_1.Router)();
const jwt = require("jsonwebtoken");
const DEFAULT_TITLE = "Choose the most appropriate thumbnail";
const prisma = new client_1.PrismaClient();
const s3client = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: (_a = process.env.AWS_ACCESS_KEY_ID) !== null && _a !== void 0 ? _a : "",
        secretAccessKey: (_b = process.env.AWS_SECRET_ACCESS_KEY) !== null && _b !== void 0 ? _b : "",
    },
    region: "ap-south-1",
});
router.post("/task", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const body = req.body;
    const parsedData = types_1.taskInput.safeParse(body);
    const user = yield prisma.user.findFirst({
        where: {
            id: userId,
        },
    });
    if (!parsedData.success) {
        return res.status(411).json({ message: "You've entered wrong inputs" });
    }
    let response = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d;
        const response = yield tx.task.create({
            data: {
                title: (_c = parsedData.data.title) !== null && _c !== void 0 ? _c : DEFAULT_TITLE,
                amount: 0.1 * config_1.DECIMALS,
                signature: parsedData.data.signature,
                user_id: userId,
            },
        });
        yield tx.option.createMany({
            data: (_d = parsedData.data) === null || _d === void 0 ? void 0 : _d.options.map((x) => ({
                image_url: x.imageUrl,
                task_id: response.id,
            })),
        });
        return response;
    }));
    res.json({
        id: response.id,
    });
}));
router.get("/task", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    // @ts-ignore
    const taskId = req.query.taskId;
    const taskDetails = yield prisma.task.findFirst({
        where: {
            user_id: Number(userId),
            id: Number(taskId),
        },
        include: {
            options: true,
        },
    });
    if (!taskDetails) {
        res.send(411).json({ message: "Invalid details" });
    }
    const responses = yield prisma.submission.findMany({
        where: {
            task_id: Number(taskId),
        },
        include: {
            option: true,
        },
    });
    const result = {};
    taskDetails === null || taskDetails === void 0 ? void 0 : taskDetails.options.forEach((option) => {
        result[option.id] = {
            count: 0,
            option: {
                imageUrl: option.image_url,
            },
        };
    });
    responses.forEach((r) => {
        result[r.option_id].count++;
    });
    return res.json({ result, taskDetails });
}));
router.get("/presignedUrl", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const { url, fields } = yield (0, s3_presigned_post_1.createPresignedPost)(s3client, {
        Bucket: "decentralized-datalabelling",
        Key: `decentralized-ctr/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
            ["content-length-range", 0, 5 * 1024 * 1024],
            ["starts-with", "$Content-Type", "image/jpeg"], // 5 MB max
        ],
        Expires: 3600,
    });
    res.json({
        preSignedUrl: url,
        fields,
    });
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { publicKey, signature } = req.body;
    if (!publicKey || !signature) {
        return res
            .status(400)
            .json({ message: "Public key and signature are required" });
    }
    const signatureArray = Array.isArray(signature.data)
        ? Uint8Array.from(signature.data)
        : null;
    if (!signatureArray) {
        return res.status(400).json({ message: "Invalid signature format" });
    }
    const publicKeyBytes = new web3_js_1.PublicKey(publicKey).toBytes();
    const message = new TextEncoder().encode("Sign in to LabelChain");
    const result = tweetnacl_1.default.sign.detached.verify(message, signatureArray, publicKeyBytes);
    if (!result) {
        return res.status(411).json({ message: "Incorrect signature" });
    }
    const existingUser = yield prisma.user.findFirst({
        where: { address: publicKey },
    });
    if (existingUser) {
        const token = jwt.sign({
            userId: existingUser.id,
        }, config_1.JWT_SECRET);
        res.json({
            token,
        });
    }
    else {
        const user = yield prisma.user.create({
            data: {
                address: publicKey,
            },
        });
        const token = jwt.sign({
            userId: user.id,
            JWT_SECRET: config_1.JWT_SECRET,
        });
        return res.json({
            token,
        });
    }
}));
exports.default = router;
