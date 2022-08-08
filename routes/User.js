const express = require('express');
const {
    getUser,
    updateUser,
    updateProfile,
    getUserProfile,
    getUsersByIDs,
    following,
    unfollowing} = require('../controllers/User')
const router = express.Router();



router.route("/multiple").get(getUsersByIDs);
router.route("/").get(getUser);
router.route("/userProfile/:id").get(getUserProfile);
router.route("/update").patch(updateUser);
router.route("/update/dp").patch(updateProfile);
router.route("/following").patch(following)
router.route("/unfollowing").patch(unfollowing);

module.exports = router;