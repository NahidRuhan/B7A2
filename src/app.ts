import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { authRoute } from "./modules/auth/auth.route";

//  Middleware 

const app : Application = express()
app.use(express.json())

app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})

//  API 

app.use("/api/auth",authRoute)


app.use(globalErrorHandler)
export default app