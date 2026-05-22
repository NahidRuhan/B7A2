import { pool } from "../../db";
import { USER_ROLE, type Roles } from "../../types";
import type { Filters, IIssue } from "./issues.interface";

const createIssueIntoDB = async (payLoad: IIssue, userID: number) => {
  const { title, description, type, status } = payLoad;

  // Insert a new issue into the database, defaulting the status to 'open' if not provided
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

  // Dynamically build the WHERE clause based on the provided filters
  if (type) conditions.push(`type = $${values.push(type)}`);
  if (status) conditions.push(`status = $${values.push(status)}`);

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  // Default to newest first (DESC) if oldest is not explicitly requested
  const orderBy = sort === "oldest" ? "ASC" : "DESC";

  const issuesResult = await pool.query(
    `SELECT * FROM issues ${whereClause} ORDER BY created_at ${orderBy}`,
    values,
  );

  const issues = issuesResult.rows;

  // Loop through each issue to fetch and attach the reporter's details
  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    const reporterResult = await pool.query(
      `SELECT id, name, role FROM users WHERE id = $1`,
      [issue.reporter_id],
    );

    // Restructure the response to place the reporter object right before the timestamps
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
  // Fetch the issue from the database
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id,
  ]);

  // Return null if the issue does not exist (caught by the controller as a 404)
  if (issueResult.rows.length === 0) {
    return null;
  }

  const issue = issueResult.rows[0];
  // Fetch the reporter's details
  const reporterResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id],
  );

  // Restructure the response to place the reporter object right before the timestamps
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

  // 1. Fetch the existing issue to verify ownership and current status
  const checking = await pool.query(
    `SELECT reporter_id, status FROM issues WHERE id=$1`,
    [id],
  );

  if (checking.rowCount === 0) {
    return "not_found";
  }

  const issueToUpdate = checking.rows[0];

  // 2. Enforce Business Rules for Contributors
  if (role !== USER_ROLE.maintainer) {
    // Contributor can only update their own issue
    if (issueToUpdate.reporter_id !== userID) {
      return "forbidden";
    }
    // Contributor can only update issues that are currently 'open'
    if (issueToUpdate.status !== "open") {
      return "forbidden_status";
    }
    // Contributor is not allowed to update the status field
    if (status) {
      return "forbidden_status_update";
    }
  }

  // 3. Execute the update query using COALESCE to keep existing values for fields not provided
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
  // Delete the issue from the database
  const result = await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
  // Return null if no rows were affected (issue not found)
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
