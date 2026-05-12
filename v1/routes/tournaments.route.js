const express = require("express");
const router = express.Router();
const tournamentController = require("../controller/tournament.controller.js");
const { verifyToken } = require("../middleware/auth.js");

router.post("/create",verifyToken, tournamentController.createTournament);
router.get("/get",verifyToken, tournamentController.getTournaments);
router.get("/get/:id",verifyToken, tournamentController.getTournamentById);
// router.put("/update/:id",tournamentController.updateTournament);

module.exports = router;