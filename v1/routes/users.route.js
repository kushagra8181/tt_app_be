const express = require("express");
const router = express.Router();
const registrationController = require("../controller/users.controller.js");
const { verifyToken } = require("../middleware/auth.js");

//liogn and registration routes
router.post("/registration",registrationController.userRegistration);
router.post("/login",registrationController.userLogin);
router.post("/google-login", registrationController.googleLogin);

//profile update route
router.put("/update-profile",verifyToken, registrationController.updateProfile);
router.get("/profile-image",verifyToken, registrationController.getProfileImage);



module.exports = router;