const express = require("express");
const { register, login,googlelogin } = require("../controllers/Auth");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/googlelogin",googlelogin)


module.exports = router;