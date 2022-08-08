const { AuthenticationError } = require("../errors");
const jwt = require("jsonwebtoken");

const authorize = (req, res, next) => {
   const authHeader = req.headers.authorization;
   try {
      const payload = jwt.verify(authHeader, process.env.JWT_SECRET);
      req.user = { id: payload.user._id, fullname: payload.user.first_Name+' '+payload.user.last_Name };
      next();
   } catch (error) {
      throw new AuthenticationError("Authentication Invalid");
   }
};

module.exports = authorize;
