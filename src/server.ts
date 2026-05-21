import type { Request, Response } from "express"

import express from "express"
import config from "./config"
const app = express()
const port = config.port || 3000

app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})