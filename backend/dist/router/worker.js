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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const config_1 = require("./../config");
const client_1 = require("@prisma/client");
const express_1 = require("express");
const middleware_1 = require("./middleware");
const db_1 = require("../db");
const types_1 = require("../types");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const bs58_1 = __importDefault(require("bs58"));
const web3_js_1 = require("@solana/web3.js");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const jwt = require("jsonwebtoken");
const TOTAL_SUBMISSIONS = 100;
const connection = new web3_js_1.Connection((_a = process.env.RPC_URL) !== null && _a !== void 0 ? _a : "");
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { publicKey, signature } = req.body;
    const message = new TextEncoder().encode("Sign into LabelChain as a worker");
    const signatureArray = new Uint8Array(signature);
    if (signatureArray.length !== 64) {
        return res.status(400).json({
            message: "Signature must be 64 bytes long",
        });
    }
    const result = tweetnacl_1.default.sign.detached.verify(message, signatureArray, new web3_js_1.PublicKey(publicKey).toBytes());
    if (!result) {
        return res.status(411).json({
            message: "Incorrect signature",
        });
    }
    const existingWorker = yield prisma.workers.findFirst({
        where: {
            address: publicKey,
        },
    });
    if (existingWorker) {
        const token = jwt.sign({ workerId: existingWorker.id }, config_1.JWT_SECRET_WORKER);
        return res.json({ token, amount: existingWorker.pending_amount });
    }
    else {
        const worker = yield prisma.workers.create({
            data: {
                address: publicKey,
                pending_amount: 0,
                locked_amount: 0,
            },
        });
        const token = jwt.sign({ workerId: worker.id }, config_1.JWT_SECRET_WORKER);
        return res.json({ token, amount: 0 });
    }
}));
router.get("/nextTask", middleware_1.authMiddlewareWorkers, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const workerId = req.workerId;
    const task = yield (0, db_1.nexttask)(Number(workerId));
    if (!task) {
        return res.status(411).json({
            message: "No task left for you to review.",
        });
    }
    else {
        res.json({
            task,
        });
    }
}));
router.post("/submission", middleware_1.authMiddlewareWorkers, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const workerId = req.workerId;
    const body = req.body;
    const parsedData = types_1.submissionInput.safeParse(body);
    if (parsedData.success) {
        const task = yield (0, db_1.nexttask)(Number(workerId));
        if (!task || (task === null || task === void 0 ? void 0 : task.id) !== Number(parsedData.data.taskId)) {
            return res.status(411).json({ message: "Invalid task id" });
        }
        const amount = (Number(task.amount) / TOTAL_SUBMISSIONS).toString();
        const submission = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            var _b, _c, _d;
            const submission = yield tx.submission.upsert({
                where: {
                    worker_id_task_id: {
                        worker_id: workerId,
                        task_id: Number(parsedData.data.taskId),
                    },
                },
                update: {
                    option_id: Number((_b = parsedData.data) === null || _b === void 0 ? void 0 : _b.OptionId),
                    amount: Number(amount),
                },
                create: {
                    option_id: Number((_c = parsedData.data) === null || _c === void 0 ? void 0 : _c.OptionId),
                    worker_id: workerId,
                    task_id: Number((_d = parsedData.data) === null || _d === void 0 ? void 0 : _d.taskId),
                    amount: Number(amount),
                },
            });
            yield tx.workers.update({
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
        }));
        const nextTask = yield (0, db_1.nexttask)(Number(workerId));
        return res.json({
            nextTask,
            amount,
        });
    }
    else {
        res.status(411).json({
            message: "Incorrect inputs",
        });
    }
}));
router.get("/balances", middleware_1.authMiddlewareWorkers, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const workerId = req.workerId;
    const worker = yield prisma.workers.findFirst({
        where: {
            id: Number(workerId),
        },
    });
    res.json({
        pendingAmount: worker === null || worker === void 0 ? void 0 : worker.pending_amount,
        lockedAmount: worker === null || worker === void 0 ? void 0 : worker.locked_amount,
    });
}));
router.post("/payouts", middleware_1.authMiddlewareWorkers, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const workerId = req.workerId;
    try {
        const worker = yield prisma.workers.findFirst({
            where: {
                id: Number(workerId),
            },
        });
        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }
        const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
            fromPubkey: new web3_js_1.PublicKey("Gz1RNHAYRppRt2vL4NCS9w1t7A2Nq6ExNHDrypWEKVAY"),
            toPubkey: new web3_js_1.PublicKey(worker.address),
            lamports: (1000000000 * worker.pending_amount) / 1000,
        }));
        const secretKeyUint8Array = bs58_1.default.decode(process.env.PRIVATE_KEY || "");
        const keypair = web3_js_1.Keypair.fromSecretKey(secretKeyUint8Array);
        let signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [
            keypair,
        ]);
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            yield tx.workers.update({
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
            yield tx.payouts.create({
                data: {
                    user_id: Number(workerId),
                    amount: worker.pending_amount,
                    status: "Processing",
                    signature: signature,
                },
            });
        }));
        return res.json({
            message: "Processing amount",
            amount: worker.pending_amount,
        });
    }
    catch (error) {
        console.error("Error processing payout:", error.message);
        return res.status(500).json({
            message: "Transaction failed",
            error: error.message,
        });
    }
}));
exports.default = router;
