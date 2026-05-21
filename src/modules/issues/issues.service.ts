import { pool } from "../../db";
import type { IIssue } from "./issues.interface";

const createIssueIntoDB = async (payLoad: IIssue, userID: number) => {
    const { title, description, type, status } = payLoad;
    
    const result = await pool.query(
        `INSERT INTO issues (title, description, type, status, reporter_id) VALUES ($1, $2, $3, COALESCE($4, 'open'), $5) RETURNING *`,
        [title, description, type, status, userID]
    );
    
    return result.rows[0];
}

export const issueService = {
    createIssueIntoDB
}