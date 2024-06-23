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
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./../config");
const client_1 = require("@prisma/client");
const express_1 = require("express");
const middleware_1 = require("./middleware");
const db_1 = require("../db");
const types_1 = require("../types");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const jwt = require("jsonwebtoken");
const TOTAL_SUBMISSIONS = 100;
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const walletaddressHardcoded = "0x8351B4feA34DB4A65B48f5a9bFFB26F8734a7bB3hckjacbkj";
    const existingWorker = yield prisma.workers.findFirst({
        where: {
            address: walletaddressHardcoded,
        },
    });
    if (existingWorker) {
        const token = jwt.sign({ workerId: existingWorker.id }, config_1.JWT_SECRET_WORKER);
        return res.json({ token });
    }
    else {
        const worker = yield prisma.workers.create({
            data: {
                address: walletaddressHardcoded,
                pending_amount: 0,
                locked_amount: 0,
            },
        });
        const token = jwt.sign({ workerId: worker.id }, config_1.JWT_SECRET_WORKER);
        return res.json({ token });
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
            var _a, _b;
            const submisson = yield tx.submission.create({
                data: {
                    option_id: Number((_a = parsedData.data) === null || _a === void 0 ? void 0 : _a.OptionId),
                    worker_id: workerId,
                    task_id: Number((_b = parsedData.data) === null || _b === void 0 ? void 0 : _b.taskId),
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
            return submisson;
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
    //@ts-ignore
    const workerId = req.workerId;
    const worker = yield prisma.workers.findFirst({
        where: {
            id: Number(workerId),
        },
    });
    if (!worker) {
        return res.status(411).json({ message: "worker not found" });
    }
    const address = worker.address;
    const txnId = "dowuhgdcuikgckhjcjh";
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
                signature: txnId
            }
        });
    }));
    return res.json({
        message: "processing amount",
        amount: worker.pending_amount
    });
}));
exports.default = router;
