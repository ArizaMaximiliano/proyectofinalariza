import dotenv from 'dotenv';

dotenv.config();

export default {
  persistence: process.env.PERSISTENCE || 'mongodb',
  db: {
    mongodbUri: process.env.DB_URI,
  },
  secret: process.env.SECRET,
  githubClientID: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  ENV: process.env.NODE_ENV || 'development',
  mail: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
};
