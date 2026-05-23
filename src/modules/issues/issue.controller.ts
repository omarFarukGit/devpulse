import {
  response,
  type NextFunction,
  type Request,
  type Response,
} from "express";
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
    const result = await IssueService.getAllIssuesFromDB(req.query);

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

const getSingleIssue = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await IssueService.getSingleIssueFromDB(
      Number(req.params.id),
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: "Issue not found",
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const issueId = Number(req.params.id);
    const result = await IssueService.updatedUssueFromDB(
      issueId,
      req.body,
      req.user,
    );
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const issueId = Number(req.params.id);
    await IssueService.deleteIssueFromDB(issueId);

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const IssuesController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
