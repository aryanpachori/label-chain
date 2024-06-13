"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const user_1 = __importDefault(require("./router/user"));
const worker_1 = __importDefault(require("./router/worker"));
app.use(express_1.default.json());
app.use("/v1/user", user_1.default);
app.use("/v1/workers", worker_1.default);
app.listen(3000);
