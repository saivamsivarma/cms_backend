const Tags = require('../models/Tags');
const Post = require('../models/Post');
const { StatusCodes } = require('http-status-codes');

const getAllTags = async (req, res) => {
	const tags = await Tags.find().sort('-createdAt').limit(15);
	res.status(StatusCodes.OK).json({ tags });
};

const getTagsPost = async(req,res)=>{
	const {id} = req.params
	const tag = await Tags.findById({_id:id}).populate('post_id');
	const tagName= tag.tagName;
	const posts = []
	for(i=0;i<=tag.post_id.length-1;i++){
		const post = await Post.find({_id:tag.post_id[i]});
		posts.push(post);
	}
	res.status(StatusCodes.OK).json({ tag,tagName });
}

module.exports = {getAllTags,getTagsPost}