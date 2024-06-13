import express from "express";
const app = express();
import userRouter from "./router/user";
import workerRouter from "./router/worker";
app.use(express.json())
app.use("/v1/user", userRouter);
app.use("/v1/workers", workerRouter);

app.listen(3000);
