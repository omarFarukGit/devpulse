import express from "express";
import { AuthRoute } from "./modules/auth/auth.routes";
import { auth } from "./middleware/auth";
import { IssuesRoute } from "./modules/issues/issue.routes";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
const app = express();
const port = 3000;

app.use(express.json());
app.get("/", auth("contributor"), (req, res) => {
  res.send("Hello World!");
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

app.use(globalErrorHandler)

export default app;
