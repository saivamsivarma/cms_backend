const { BadRequestError, NotFoundError } = require('../errors');
const Post = require('../models/Post');
const Tags = require('../models/Tags')
const User = require('../models/User');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { StatusCodes } = require('http-status-codes');

const createPost = async (req, res) => {
	const { post_content,title,tags,category,canComments,canReact } = req.body;
	let poster = req.files?.file;
	if (!post_content && !poster && !category) throw new BadRequestError('Expected a title or image or category');

	const user = await User.findById(req.user.id);
	if (poster) {
		const result = await cloudinary.uploader.upload(poster.tempFilePath, {
			use_filename: true,
			folder: 'CMS-poster',
		});
		fs.unlinkSync(poster.tempFilePath);
		const { secure_url: src, public_id } = result;
		poster = { src, publicID: public_id };
	}
	const tagsArray =[]
	const tagsValue = tags.split(',');
	if(tagsValue.length>0){
		for(i=0;i<=tagsValue.length-1;i++){
			let tagNameValue = tagsValue[i];
			const presentTag = await Tags.findOne({tagName:tagNameValue})
			if(!presentTag) {

				const tags = await Tags.create({
					tagName:tagsValue[i],
				});
				console.log(tags)
				tagsArray.push(tags._id)
			}
			else{
				tagsArray.push(presentTag._id)
			}
		}
	}
	const post = await Post.create({
		post_content,
		poster,
		title,
		category,
		canComments,
		canReact,
		tags:tagsArray,
		createdBy: user._id,
		author_details: { name: user.first_Name+" "+user.last_Name, image: user.picture_image },
	});
	if(post){
		for(j=0;j<=tagsArray.length-1;j++){
			const getTag = await Tags.findByIdAndUpdate(
				{_id:tagsArray[j]},
				{
					$push:{post_id:post._id}
				});
		}
	}
	res.status(StatusCodes.CREATED).json({ post });
};

const getPosts = async (req, res) => {
	const posts = await Post.find().sort('-createdAt')
	res.status(StatusCodes.OK).json({ posts });
};

const getPostByUserId = async (req,res)=>{
	console.log(req.user)
	const posts = await Post.find({createdBy:req.user.id});
	res.status(StatusCodes.OK).json({ posts });
}

const getOtherPostByUserId = async (req,res)=>{
	console.log(req.params)
	const posts = await Post.find({createdBy:req.params.id});
	res.status(StatusCodes.OK).json({ posts });
}


const getPost = async (req, res) => {
	const { id } = req.params;
	const post = await Post.findById(id);
	const postTags = post.tags;
	const tagLength = post.tags.length;
	const tags=[];
	for(i=0;i<=tagLength-1;i++){
		const value = await Tags.findById(postTags[i]);
		tags.push(value.tagName);
	}
	if (!post) throw new NotFoundError(`No Post with id${id}`);
	res.status(StatusCodes.OK).json({ post,tags });
};

const likePost = async (req, res) => {
	const { add } = req.query;
	let Posts = await Post.findById(req.body.id);
	if (!Posts) throw new NotFoundError(`No post with id${req.body.id}`);
	if (add === 'true' && Posts.likes.includes(req.user.id))
		throw new BadRequestError('Already liked');
	const action = add === 'true' ? '$push' : '$pull';
	let checkdislike = Posts.unlikes.includes(req.user.id)
	if(checkdislike) {
		Posts = await Post.findByIdAndUpdate(
			req.body.id,
			{
				$pull:{unlikes:req.user.id},
				[action]: { likes: req.user.id },
			},
			{ new: true, runValidators: true }
		)
	}
	else{
		Posts = await Post.findByIdAndUpdate(
			req.body.id,
			{
				[action]: { likes: req.user.id },
			},
			{ new: true, runValidators: true }
		);
	}
	res.status(StatusCodes.OK).json({ Posts });
};

const dislikePost = async (req, res) => {
	const { add } = req.query;
	let Posts = await Post.findById(req.body.id);
	if (!Posts) throw new NotFoundError(`No post with id${req.body.id}`);
	if (add === 'true' && Posts.unlikes.includes(req.user.id))
		throw new BadRequestError('Already disliked');
	const action = add === 'true' ? '$push' : '$pull';
	let checklike = Posts.likes.includes(req.user.id)
	if(checklike) {
		Posts = await Post.findByIdAndUpdate(
			req.body.id,
			{
				$pull:{likes:req.user.id},
				[action]: { unlikes: req.user.id },
			},
			{ new: true, runValidators: true }
		)
	}
	else{
		Posts = await Post.findByIdAndUpdate(
			req.body.id,
			{
				[action]: { unlikes: req.user.id },
			},
			{ new: true, runValidators: true }
		);
	}
	
	res.status(StatusCodes.OK).json({ Posts });
};

const getReactions = async(req,res)=>{
	const Posts = await Post.findById(req.params.id);
	const likeArray= [];
	const dislikeArray  = []
	const likes = Posts.likes
	if(likes.length>0){
		for(let i=0;i<=likes.length-1;i++)
		{
			user = await User.findOne({_id:likes[i]}).select({ password: 0 });
			likeArray.push(user)
		}
	}
	const unlikes = Posts.unlikes
	if(unlikes.length>0){
		for(let j=0;j<=unlikes.length-1;j++){
			console.log(j)
			user = await User.findOne({_id:unlikes[j]}).select({ password: 0 });
			console.log(user)
			dislikeArray.push(user)
		}
	}
	res.status(StatusCodes.OK).json({ likeArray,dislikeArray });
}

const commentPost = async (req, res) => {
	const user = await User.findOne({_id:req.user.id}).select({first_Name:1,last_Name:1,picture_image:1})
	const posts = await Post.findByIdAndUpdate(
		req.body.id,
		{
			$push: { comments: { commentedBy: req.user.id, comment: req.body.comment,author_Name:user.first_Name+' '+user.last_Name,image:user.picture_image } },
		},
		{ new: true, runValidators: true }
	);

	if (!posts) throw new NotFoundError(`No post with id${req.body.id}`);
	res.status(StatusCodes.OK).json({ posts });
};

const deletePost = async (req, res) => {
	const { id } = req.params;
	const postDetails = await Post.findById({_id:id})
	const length = postDetails.tags.length;
	for(i=0;i<=postDetails.tags.length-1;i++){
		const getTag = await Tags.findByIdAndUpdate(
			{_id:postDetails.tags[i]},
			{
				$pull:{post_id:postDetails._id}
			});
			console.log(getTag)
	};
	
	const post = await Post.findOneAndDelete({ _id: id, createdBy: req.user.id });
	post.poster.publicID && (await cloudinary.uploader.destroy(post.poster.publicID));
	res.status(StatusCodes.OK).json(post);
};

const updatePost = async(req,res)=>{
	const { post_content,title,category } = req.body;
	const post = await Post.findByIdAndUpdate(
		req.body._id,
		{
		post_content:post_content,
		title:title,
		category:category,
		}
	)	
	console.log(Post)
	res.status(StatusCodes.CREATED).json({ post });
}


const getPostByTags = async (req,res) =>{
	const tag = req.params.tag
    try{
        const posts = await Tags.findOne({tagName:tag}).populate('post_id').select({post_id:1})
        res.status(201).json({tag,posts})
    } catch(err){
        res.status(500).json({ message: "Something went wrong" });
        console.log(err)
    }
}

module.exports = { createPost, getPosts, commentPost, getPost, deletePost,getPostByTags,likePost,dislikePost,getReactions,updatePost,getPostByUserId,getOtherPostByUserId };
