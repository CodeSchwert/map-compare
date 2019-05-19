require('dotenv').config('.env');
const cors = require('cors');
const version = require('./package.json').version;

const { CORS_METHODS, CORS_ALLOWED_HEADERS } = process.env;

const { routePrefix } = require('./lib');
const { 
  itl_getAll, 
  itl_getArrayByDate, 
  itl_getArrayByNumbers, 
  itl_getOneByNumber 
} = require('./lib/routes/itl');
const { project_getAll } = require('./lib/routes/project');
const { date_getAll } =require('./lib/routes/date');

module.exports = (app) => {
  // configure cors before adding routes!
  app.use(cors({
    // origin: true,
    methods: CORS_METHODS,
    credentials: true,
    allowedHeaders: CORS_ALLOWED_HEADERS,
    optionsSuccessStatus: 200
  }));

  /**
   * @name / (Root Route)
   * @description Root route for debug purposes only.
   * @path {GET} /api/v0/
   * @code {200} Should always succeed!
   * @code {400} There's probably something wrong with the server/application!!
   * @response {Object} response - { "Delta": "Server!", "version": "1.0.0", "yourIP": "::1" }
   * @example GET http://localhost:9000/api/v0/
   */
  app.get(routePrefix('/'), (req, res) => {
    res.status(200).send({ "Delta": "Server", "version": version, "yourIP": req.ip });
  });

  /**
   * ITL routes - see the route handler files for function descriptions
   */
  app.get(routePrefix('/itl'), itl_getAll);
  app.get(routePrefix('/itl/number/:itlnumber/'), itl_getOneByNumber);
  app.get(routePrefix('/itl/array'), itl_getArrayByNumbers);
  app.get(routePrefix('/itl/date/:date'), itl_getArrayByDate);

  /**
   * Project routes
   */
  app.get(routePrefix('/projects'), project_getAll);

  /**
   * Date reoutes
   */
  app.get(routePrefix('/dates'), date_getAll);

};
