import { Router } from "express";
import auth from "../../middleware/auth";
import { issueController } from "./issues.controller";
import { USER_ROLE } from "../../types";

const router = Router()

router.post("/",auth(),issueController.createIssue)
router.get("/",issueController.getAllIssue)
router.get("/:id",issueController.getSingleIssue)
router.put("/:id",auth(USER_ROLE.maintainer),issueController.updateIssue)
router.delete("/:id",auth(USER_ROLE.maintainer,USER_ROLE.contributor),issueController.deleteIssue)

export const issuesRoute = router