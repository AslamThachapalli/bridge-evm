import express, { Express } from "express";
import { baseToEthRouter, ethToBaseRouter } from "routes";
import "dotenv/config";

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (_, res) => {
    res.send("Hello World!");
});

app.use("/eth-to-base", ethToBaseRouter);
app.use("/base-to-eth", baseToEthRouter);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
