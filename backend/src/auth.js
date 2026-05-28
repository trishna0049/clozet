const jwt = require("jsonwebtoken");

function createToken(user) {
  // Support both _id (from old mongo data) and id (from Supabase)
  const userId = user.id || user._id;
  return jwt.sign({ id: userId, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = jwt.verify(header.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

module.exports = {
  createToken,
  requireAuth
};

