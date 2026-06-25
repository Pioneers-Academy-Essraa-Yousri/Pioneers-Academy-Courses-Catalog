function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message || err);
  if (err.stack) {
    console.error(err.stack);
  }
  res.status(500).json({ error: 'حدث خطأ غير متوقع في الخادم' });
}

module.exports = errorHandler;
