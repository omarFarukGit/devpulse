import { Router } from "express";
import { IssuesController } from "./issue.controller";
import { auth } from "../../middleware/auth";


const router=Router()

router.post('/', auth('contributor','maistainer'),IssuesController.createIssue)



export const IssuesRoute=router;