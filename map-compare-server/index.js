require('dotenv').config('.env');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const models = require('./models');
const router = require('./router');

/**
 * Environment Variable Constants
 */
const { API_PORT, MONGO_URI } = process.env;

/**
 * Mongoose!
 */
const connectOpts = {
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 1000,
  useNewUrlParser: true
};
mongoose.Promise = global.Promise;
mongoose.connection
  .once('open', () => { 
    console.log('\n\tConnected to MongoDB instance:', MONGO_URI, '\n')
  })
  .on('error', error => { 
    console.log('\n\tError connecting to MongoDB:', error, '\n')
  })
  .on('close', () => { 
    console.log('\n\tMongoDB connection closed', '\n')
  });
mongoose.connect(MONGO_URI, connectOpts);

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cookieParser());

// configure routes
router(app);

/**
 * Start the web server
 */
const port = API_PORT || 5000;
const server = app.listen(port, () => {
  console.log(`\n\tServer listening on port: ${API_PORT}`);
});

module.exports = server;
