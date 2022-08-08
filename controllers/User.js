const User = require("../models/User");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError, AuthenticationError } = require("../errors");
const Post = require("../models/Post");


const getUser = async (req, res) => {
    //const { id } = req.user.id;
    const user = await User.findOne({ _id: req.user.id }).populate('following').select({ password: 0 });

    if (!user) {
        throw new NotFoundError(`No user exist with id ${req.user.id}`);
    }

    res.status(StatusCodes.OK).json({ user });
};

const getUsers = async (req, res) => {
    const { search } = req.query;
    if (search) {
        const regex = new RegExp(search, "i");
        const user = await User.find({ name: regex }).select({ password: 0 });
        res.status(StatusCodes.OK).json({ user });
    } else {
        const user = await User.find().select({ password: 0 });
        res.status(StatusCodes.OK).json({ user });
    }
};

const getUsersByIDs = async (req, res) => {
    const ids = Object.values(req.query);
    if (!ids) throw new BadRequestError("Expected atleast one id");
    const user = await User.find({ _id: { $in: ids } }).select({ password: 0 });
    res.status(StatusCodes.OK).json({ user });
};

const getUserProfile = async (req, res) => {
    const { id } = req.params
    try {
        const userDetails = await User.findById(id).select({ password: 0 });
        const userFollowList = await User.findById(id).populate('following').populate('followers').select({ first_Name:0,last_Name:0,email_id:0,_id:0,password: 0,createdAt:0,updatedAt:0,picture_image:0 });
        // const post = await Post.find({createdBy:id}).populate({tags})
        res.status(StatusCodes.OK).json({ userDetails,userFollowList });
    } catch (err) {
        res.status(StatusCodes.CONFLICT).json("Error occured");
    }
}

const updateUser = async (req, res) => {
    const { id } = req.user;
    const user = await User.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    }).select({ password: 0 });

    await Post.updateMany({ createdBy: req.user.id }, { userDetails: { name: user.name, image: user.profileImage } });

    const posts = await Post.find({ createdBy: req.user.id }).sort("-createdAt");

    if (!user) {
        throw new NotFoundError(`No user exist with id ${id}`);
    }
    const token = user.createJWT();

    res.status(StatusCodes.OK).json({ user, token, posts });
};

const updateProfile = async (req, res) => {
    const image = req.files?.picture_image;
    if (!image) {
        throw new BadRequestError("Expected an image");
    }
    const result = await cloudinary.uploader.upload(image.tempFilePath, {
        use_filename: true,
        folder: "CMS",
    });
    fs.unlinkSync(image.tempFilePath);
    const { secure_url: src } = result;

    const user = await User.findByIdAndUpdate(req.user.id, { picture_image: src }, { new: true, runValidators: true }).select({ password: 0 });

    await Post.updateMany({ createdBy: req.user.id }, { userDetails: { name: user.first_Name + user.last_Name, image: user.picture_image } });

    const posts = await Post.find({ createdBy: req.user.id });

    if (!user) throw new NotFoundError(`No user exist with id ${req.user.id}`);

    res.status(StatusCodes.OK).json({ user, posts });
};


const following = async (req, res) => {
    let user = await User.findById(req.body.id);
    if (!user) throw new NotFoundError(`No user with id${req.params.id}`);
    if (user.followers.includes(req.user.id)) throw new BadRequestError('Already following');

    	userA = await User.findByIdAndUpdate(
    		req.body.id,
    		{
    			$push: { followers: req.user.id },
    		},
    		{ new: true, runValidators: true }
    	);
        console.log(userA)
        userB = await User.findByIdAndUpdate(
    		req.user.id,
    		{
    			$push: { following: req.body.id },
    		},
    		{ new: true, runValidators: true }
    	);
        res.status(StatusCodes.OK).json({ userA,userB });
};

const unfollowing = async (req, res) => {
    let user = await User.findById(req.body.id);
    if (!user) throw new NotFoundError(`No user with id${req.params.id}`);
    if (!user.followers.includes(req.user.id)) throw new BadRequestError('no following record');

    	userA = await User.findByIdAndUpdate(
    		req.body.id,
    		{
    			$pull: { followers: req.user.id },
    		},
    		{ new: true, runValidators: true }
    	);
        console.log(userA)
        userB = await User.findByIdAndUpdate(
    		req.user.id,
    		{
    			$pull: { following: req.body.id },
    		},
    		{ new: true, runValidators: true }
    	);
        res.status(StatusCodes.OK).json({ userA,userB });
};

module.exports = { getUser, updateUser, updateProfile, getUsers, getUsersByIDs, getUserProfile, following,unfollowing };