const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError, AuthenticationError } = require("../errors");

const jwt = require("jsonwebtoken")

const register = async (req, res) => {
   console.log(req.body)
   let user = await User.findOne({ email_id: req.body.email_id });
   if (user) throw new BadRequestError("User already exists");
   user = await User.create({ ...req.body });
   const { _id: id, first_Name,last_Name, picture_image } = user;
   const token = jwt.sign(
      {user},
      process.env.JWT_SECRET,
      {
          expiresIn:process.env.JWT_LIFETIME,
      }
  );
   console.log(user)
   res.status(StatusCodes.CREATED).json({
      id,
      token,
      first_Name,
      last_Name,
      picture_image,
   });
};

const login = async (req, res) => {
   if (!req.body.email_id || !req.body.password) {
      throw new BadRequestError("Please provide email and password");
   }

   const user = await User.findOne({ email_id: req.body.email_id });

   if (!user) {
      throw new NotFoundError("Invalid credentials");
   }

   const isPasswordCorrect = await user.comparePassword(req.body.password);

   if (!isPasswordCorrect) {
      throw new AuthenticationError("Invalid credentials");
   }

   const { _id: id, first_Name,last_Name, picture_image } = user;
   const token = jwt.sign(
      {user},
      process.env.JWT_SECRET,
      {
          expiresIn:process.env.JWT_LIFETIME,
      }
  );

   res.status(StatusCodes.OK).json({
      id,
      token,
      first_Name,
      last_Name,
      picture_image,
   });
};


module.exports = { register, login};