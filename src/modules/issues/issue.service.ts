import { title } from "node:process";
import { pool } from "../../db";
import type { IIssue } from "./issue.intreface";
import type { JwtPayload } from "jsonwebtoken";

const createIssueIntroDB = async (payload: IIssue, reporterId: number) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues(title,description,type,reporter_id) VALUES ($1,$2,$3,$4) RETURNING *
        `,
    [title, description, type, reporterId],
  );

  return result;
};

const getAllIssuesFromDB = async () => {
  const issueResult = await pool.query(`
    SELECT * FROM issues  ORDER BY created_at DESC
    `);

  const issues = issueResult.rows;

  const updatedUssues = [];

  for (const issue of issues) {
    const reporterResult = await pool.query(
      `
      SELECT id,name,role FROM users WHERE id=$1
      `,
      [issue.reporter_id],
    );

    updatedUssues.push({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,

      reporter: reporterResult.rows[0],
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    });
  }

  return updatedUssues;
};

const getSingleIssueFromDB = async (id: number) => {
  //issue query
  const issueResult = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id],
  );

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new Error("Issue not found");
  }
  //repoterquery
  const reporterResult = await pool.query(
    `
    SELECT id,name,role FROM users WHERE id=$1
    `,
    [issue.reporter_id],
  );

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,

    reporter: reporterResult.rows[0],

    create_at: issue.create_at,
    updated_at: issue.updated_at,
  };
};

const updatedUssueFromDB = async (
  issueId: number,
  payload: Partial<IIssue>,
  user: JwtPayload,
) => {
  //find issues
  const issueResult = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [issueId],
  );

  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue Not Found");
  }

  // contributor rules
  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      throw new Error("You cannot update other issue");
    }
    if (issue.status !== "open") {
      throw new Error("Open issues only editable");
    }
  }

  // update query

  const result = await pool.query(
    `
    UPDATE issues SET title=$1,description=$2,type=$3,updated_at=CURRENT_TIMESTAMP WHERE id=$4 RETURNING *
    `,
    [payload.title, payload.description, payload.type, issueId],
  );

  return result.rows[0];
};

export const IssueService = {
  createIssueIntroDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updatedUssueFromDB,
};
