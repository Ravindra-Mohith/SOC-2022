//order matters
const mongoose = require('mongoose');
const dotenv = require('dotenv');

//Error outside Express:
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception: Shutting down..');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const server = require('./index');

mongoose
  .connect(process.env.DB_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  });

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
//Errors outside Express:
process.on('unhandledRejection', (err) => {
  console.log('Unhandled rejection: Shutting down..');
  console.log(err.name, err.message);
  process.exit(1);
  // server.close(() => {
  //   process.exit(1);
  // });
});
