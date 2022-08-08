const express = require("express");
const {
    getAllTags,
    getTagsPost
} = require("../controllers/Tags");
const router = express.Router();

router.route("/").get(getAllTags);
router.route("/:id").get(getTagsPost);


module.exports = router;
