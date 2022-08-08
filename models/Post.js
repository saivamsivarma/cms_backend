const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
   {
      title:{type:String},
      post_content: {
         type: String,
      },
      poster: {
         src: {
            type: String,
            default: '' 
         },
         publicID: {
            type: String,
            default: '' 
         },
      },
      createdBy: {
         type: mongoose.Types.ObjectId,
         ref: "User",
         required: true,
      },
      author_details: {
         name: {
            type: String,
            required: true,
         },
         image: {
            type: String,
         },
      },
      likes: {
         type: [String],
      },
      unlikes: {
         type: [String],
      },
      tags:[{type: mongoose.Types.ObjectId,
         ref: "Tag",
         required: true}],
      category:{
         type:String
      },
      canComments:Boolean,
      canReact:Boolean,
      comments: [
         {
            commentedBy: {
               type: mongoose.Types.ObjectId,
               ref: "User",
               required: true,
            },
            author_Name:{
               type:String,
            },
            image:{
               type:String,
            },
            comment: {
               type: String,
               required: true,
            },
            commentedAt: {
               type: Date,
               default: new Date(),
               required: true,
            },
         },
      ],
   },
   { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);
