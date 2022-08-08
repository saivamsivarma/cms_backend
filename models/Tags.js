const mongoose = require("mongoose");

const TagsSchema = new mongoose.Schema(
   {
      post_id: [{
         type: mongoose.Types.ObjectId,
         ref: "Post",
      }],
      tagName: {
         type: String,
      },
   },
   { timestamps: true }
);

module.exports = mongoose.model("Tags", TagsSchema);