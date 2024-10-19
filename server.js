const dotenv = require('dotenv');
const mongoose = require('mongoose');
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION ✨ server shutting down...');
  console.log(err.name, err.message);

  process.exit(1);
});
dotenv.config({ path: './config.env' });

const app = require('./app');
const port = process.env.PORT || 3000;

const dB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASS
);

mongoose
  .connect(dB, {
    serverSelectionTimeoutMS: 30000,
  })
  .then((con) => {
    console.log('connected');
  });

const server = app.listen(port, () => {
  console.log(`localhost:${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDELED ERROR ✨ server shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
