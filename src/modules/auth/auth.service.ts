import { pool } from "../../db";
import type { IUser } from "./auth.interface";
import bcrypt from "bcrypt"

const createUserIntoDB = async (payLoad: IUser) => {
    const {name,email,password,role} = payLoad
    const hashedPassword = await bcrypt.hash(password,10)

    const result = await pool.query(/*sql*/`
    INSERT INTO users(name,email,password,role)
    VALUES ($1,$2,$3,COALESCE($4,'contributor'))
    RETURNING *
    `,[name,email,hashedPassword,role])
    delete result.rows[0].password

    return result
}

export const authService = {
    createUserIntoDB
}