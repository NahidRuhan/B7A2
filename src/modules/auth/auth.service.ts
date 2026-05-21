import config from "../../config";
import { pool } from "../../db";
import type { AuthUser, IUser } from "./auth.interface";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

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

const loginUserIntoDB = async (payLoad:AuthUser) => {
    const {email,password} = payLoad


    const userData = await pool.query(`SELECT * FROM users WHERE email=$1`,[email])
    const user = userData.rows[0]
    if(userData.rows.length === 0) throw new Error("Invalid Credentials")


    const isPasswordMatched = await bcrypt.compare(password,user.password)
    if(!isPasswordMatched) throw new Error("Invalid Credential")


    const jwtPayload = {
        id: user.id,
        name: user.name,
        role: user.role
    }
    const token = jwt.sign(jwtPayload, config.secret, { expiresIn: '1d' })

    delete user.password

    return { token, user }
}

export const authService = {
    createUserIntoDB, loginUserIntoDB
}