"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionInput = exports.taskInput = void 0;
const zod_1 = __importDefault(require("zod"));
exports.taskInput = zod_1.default.object({
    options: zod_1.default.array(zod_1.default.object({
        imageUrl: zod_1.default.string().min(2),
    })),
    title: zod_1.default.string().optional(),
    signature: zod_1.default.string(),
});
exports.submissionInput = zod_1.default.object({
    taskId: zod_1.default.string(),
    OptionId: zod_1.default.string(),
});
