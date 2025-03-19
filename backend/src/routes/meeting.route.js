import express from "express"

const router = express.Router();

router.post("/createMeeting", createMeeting);
router.get("/joinMeeting/:code", joinMeeting);

export default router;