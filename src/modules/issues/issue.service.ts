import { title } from "node:process";
import { pool } from "../../db";
import type { IIssue } from "./issue.intreface";

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

export const IssueService = {
  createIssueIntroDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
};
