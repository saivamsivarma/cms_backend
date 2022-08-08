require('dotenv').config()
require('express-async-errors');
const fileupload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const xss = require('xss-clean')
const helmet = require('helmet')
const cors = require('cors');
const express = require('express');
const authRouter = require('./routes/Auth');
const userRouter = require('./routes/User');
const postRouter = require('./routes/Post');
const tagRouter = require('./routes/Tags');


// //middlewares

const errorHandlerMiddleware = require('./middlewares/error-handler');
const authorizationMiddleware = require('./middlewares/authorization');
const notFoundMiddleware = require('./middlewares/not-found');
const app = express();
app.use(xss());
app.use(helmet());
app.use(express.json());
app.use(fileupload({ useTempFiles: true }));
app.use(cors());

const PORT =  process.env.PORT ||4000;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_API_KEY,
	api_secret: process.env.CLOUD_API_SECRET,
});

app.get('/',(req,res)=>{
    res.status(200).send("CMS");
})


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', authorizationMiddleware, userRouter);
app.use('/api/v1/posts',authorizationMiddleware, postRouter);
app.use('/api/v1/tags',authorizationMiddleware, tagRouter);
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));