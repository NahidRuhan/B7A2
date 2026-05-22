import { pool } from "../../db";
import type { Filters, IIssue } from "./issues.interface";

const createIssueIntoDB = async (payLoad: IIssue, userID: number) => {
  const { title, description, type, status } = payLoad;

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, status, reporter_id) VALUES ($1, $2, $3, COALESCE($4, 'open'), $5) RETURNING *`,
    [title, description, type, status, userID],
  );

  return result.rows[0];
};

const getAllIssueFromDB = async (filters: Filters) => {
  const { sort, type, status } = filters;

  const values: any[] = [];
  const conditions: string[] = [];

  if (type) conditions.push(`type = $${values.push(type)}`);
  if (status) conditions.push(`status = $${values.push(status)}`);

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy = sort === "oldest" ? "ASC" : "DESC";

  const issuesResult = await pool.query(
    `SELECT * FROM issues ${whereClause} ORDER BY created_at ${orderBy}`,
    values,
  );

  const issues = issuesResult.rows;

  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    const reporterResult = await pool.query(
      `SELECT id, name, role FROM users WHERE id = $1`,
      [issue.reporter_id],
    );

    const { reporter_id, created_at, updated_at, ...rest } = issue;

    issues[i] = {
      ...rest,
      reporter: reporterResult.rows[0],
      created_at,
      updated_at,
    };
  }

  return issues;
};

const getSingleIssueFromDB = async (id:string) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
  
  if (issueResult.rows.length === 0) {
    return null;
  }

  const issue = issueResult.rows[0];
  const reporterResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id]
  );

  const { reporter_id, created_at, updated_at, ...rest } = issue;

  return {
    ...rest,
    reporter: reporterResult.rows[0],
    created_at,
    updated_at,
  };
};

const deleteIssueFromDB = async (id:string) => {
  const result = await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
  if (result.rowCount === 0) {
    return null;
  }
  return result;
}

export const issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  deleteIssueFromDB
};
