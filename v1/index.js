const express = require("express");
const router = express.Router();
const registrationRoute = require("./routes/users.route.js");
const tournamentRoute = require("./routes/tournaments.route.js")

router.use("/users/api",registrationRoute)
router.use("/tournaments/api",tournamentRoute)

module.exports = router;