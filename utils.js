const jwt = require('jsonwebtoken');
const secret = process.env.secret;

const catchError = async (next, callback) => {
  try {
    await callback();
  }
  catch (err) {
    next(err);
  }
}

// Middleware for auth
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization;
  try {
    const decoded = jwt.verify(token, secret);
    req.userId = decoded._id;
    return next();
  }
  catch (err) {
    console.log({ err });
    return res.status(401).json({
      success: false,
      message: "Authentication error!"
    })
  }
}

const getArrayOfUniqueIds = (arr, id) => {
  if (arr.some(val => val.toString() === id)) {
    return arr;
  }
  return arr.concat(id)
}

module.exports = { catchError, authenticateUser, getArrayOfUniqueIds };
