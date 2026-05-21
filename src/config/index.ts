import dotenv from "dotenv"
import path from "path"
import { env } from "process"

dotenv.config({
    path: path.join(process.cwd(),'.env')
})

const config = {
    port: env.PORT,
    connection_string: env.CONNECTION_STRING,
    secret: env.JWT_SECRET as string
}

export default config