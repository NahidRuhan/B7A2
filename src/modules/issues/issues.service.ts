import { pool } from "../../db";
import { USER_ROLE, type Roles } from "../../types";
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

  const values: string[] = [];
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

const getSingleIssueFromDB = async (id: string) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id,
  ]);

  if (issueResult.rows.length === 0) {
    return null;
  }

  const issue = issueResult.rows[0];
  const reporterResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id],
  );

  const { reporter_id, created_at, updated_at, ...rest } = issue;

  return {
    ...rest,
    reporter: reporterResult.rows[0],
    created_at,
    updated_at,
  };
};

const updateIssueIntoDB = async (
  payLoad: IIssue,
  id: string,
  role: Roles,
  userID: number,
) => {
  const { title, description, type, status } = payLoad;

  const checking = await pool.query(
    `SELECT reporter_id, status FROM issues WHERE id=$1`,
    [id],
  );

  if (checking.rowCount === 0) {
    return "not_found";
  }

  const issueToUpdate = checking.rows[0];

  if (role !== USER_ROLE.maintainer) {
    if (issueToUpdate.reporter_id !== userID) {
      return "forbidden";
    }
    if (issueToUpdate.status !== "open") {
      return "forbidden_status";
    }
    if (status) {
      return "forbidden_status_update";
    }
  }

  const result = await pool.query(
    /*sql*/
    `UPDATE issues SET
     title=COALESCE($1,title),
     description=COALESCE($2,description),
     type=COALESCE($3,type),
     status=COALESCE($4,status),
     updated_at=NOW()
     WHERE id=$5
     RETURNING *
    `,
    [title, description, type, status, id],
  );

  if (result.rowCount === 0) {
    return "not_found";
  }

  return result.rows[0];
};

const deleteIssueFromDB = async (id: string) => {
  const result = await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
  if (result.rowCount === 0) {
    return null;
  }
  return result;
};

export const issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB,
};
