import express from "express";
import { AuthRoute } from "./modules/auth/auth.routes";
import { auth } from "./middleware/auth";
const app = express();
const port = 3000;

app.use(express.json());
app.get("/",auth('contributor'), (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", AuthRoute);

export default app;
