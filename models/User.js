const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    first_Name: {
        type: String
    },
    last_Name: {
        type: String
    },
    email_id: {
        type: String,
        required: [true, "please provide email"],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email",
        ],
        unique: true,
    },
    picture_image: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        required: [true, "Please Provide Password"],
        minlenght: 8,
    },
     followers: [{
        type: mongoose.Types.ObjectId,
        ref: "User",
    }],
    following: [{
        type: mongoose.Types.ObjectId,
        ref: "User",
    }]
}, { timestamps: true });

userSchema.pre("save", async function () {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (password) {
    const isPassword = await bcrypt.compare(password, this.password);
    return isPassword;
};

module.exports = mongoose.model("User", userSchema);