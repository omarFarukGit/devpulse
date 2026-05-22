import { Router } from "express";
import { IssuesController } from "./issue.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.post(
  "/",
  auth("contributor", "maintainer"),
  IssuesController.createIssue,
);

router.get("/", IssuesController.getAllIssues);

export const IssuesRoute = router;
