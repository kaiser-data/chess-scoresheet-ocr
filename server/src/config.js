require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  googleCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-cloud-key.json',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxBatchSize: 100
};
