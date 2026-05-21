import { Router } from "express";
import auth from "../../middleware/auth";
import { issueController } from "./issues.controller";

const router = Router()

router.post("/",auth(),issueController.createIssue)
router.get("/",issueController.getAllIssue)

export const issuesRoute = router