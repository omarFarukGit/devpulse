import express from "express";
import { AuthRoute } from "./modules/auth/auth.routes";
import { IssuesRoute } from "./modules/issues/issue.routes";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
const app = express();
const port = 3000;

app.use(express.json());
app.get("/", (req, res) => {
  res.send("server running...!");
});

app.use("/api/auth", AuthRoute);
app.use("/api/issues", IssuesRoute);

//not found route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

//globalErrorHandler

app.use(globalErrorHandler);

export default app;
