import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { authRoute } from "./modules/auth/auth.route";
import { issuesRoute } from "./modules/issues/issues.route";

//  Middleware 

const app : Application = express()
app.use(cors({
  origin: "http://localhost:8000"
}))
app.use(express.json())

app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})

//  API 

app.use("/api/auth",authRoute)
app.use("/api/issues",issuesRoute)


app.use(globalErrorHandler)
export default app