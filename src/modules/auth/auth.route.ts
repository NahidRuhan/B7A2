import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router()

router.post('/signup',authController.createUser)
// router.post('/login') // TODO: Add login controller later

export const authRoute = router