const jwt = require('jsonwebtoken');

// In production, this should come from process.env
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_development_only';

function checkAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: Missing Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Token Format' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains { username, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Token or Session Expired' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Requires Full Admin role' });
  }
  next();
}

function requireEditor(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'editor') {
    return res.status(403).json({ error: 'Forbidden: Requires Editor or Admin permissions' });
  }
  next();
}

module.exports = {
  checkAuth,
  requireAdmin,
  requireEditor,
  JWT_SECRET
};
