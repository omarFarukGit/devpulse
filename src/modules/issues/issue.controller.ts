import type { Request, Response } from "express";
import { IssueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {
  try {
    const reporterId = req.user.id;
    console.log("re", reporterId);

    const result = await IssueService.createIssueIntroDB(req.body, reporterId);

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await IssueService.getAllIssuesFromDB();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const IssuesController = {
  createIssue,
  getAllIssues,
};
