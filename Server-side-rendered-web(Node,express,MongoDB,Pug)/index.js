const app = require('express')();
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const userRouter = require('./routes/users');
const tourRouter = require('./routes/tours');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitizer = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const reviewRouter = require('./routes/reviews');
const viewRouter = require('./routes/views');
const cookieParser = require('cookie-parser');

//Views:
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//GLOBAL MIDDLEWARES:
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],

      baseUri: ["'self'"],

      fontSrc: ["'self'", 'https:', 'data:'],

      scriptSrc: ["'self'", 'https://*.cloudflare.com'],

      scriptSrc: ["'self'", 'https://*.stripe.com'],

      scriptSrc: ["'self'", 'http:', 'https://*.mapbox.com', 'data:'],

      frameSrc: ["'self'", 'https://*.stripe.com'],

      objectSrc: ["'none'"],

      styleSrc: ["'self'", 'https:', 'unsafe-inline'],

      workerSrc: ["'self'", 'data:', 'blob:'],

      childSrc: ["'self'", 'blob:'],

      imgSrc: ["'self'", 'data:', 'blob:'],

      connectSrc: ["'self'", 'blob:', 'https://*.mapbox.com'],

      upgradeInsecureRequests: [],
    },
  })
);
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from same IP, PLease try again in an hour!',
});
app.use('/api', limiter);

console.log(process.env.NODE_ENV);
app.use(require('express').json({ limit: '10kb' }));
app.use(cookieParser());

//Data sanitization:against NoSQL query
app.use(mongoSanitizer());

//Data sanitization:against XSS(html contents)
app.use(xss());

//prevent parameter pollution:
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//serving static files
app.use(require('express').static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  req.request_timinggggggg = new Date().toISOString();
  next();
});

//HTTP METHODS:
//get- just to read(to send data to client
//post- create a new thing in our db(to get in the component and create the corresponding resource)
//put- update and send the again entire object to the client
//patch- update and send only the modified part of the object to the client
//delete-delete the object

//API ROUTES:
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//Handling unaccessble routes:
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'unaccessble',
  //   message: `cant find ${req.originalUrl}`,
  // });
  next(new AppError(`cant find ${req.originalUrl}`, 404));
});

//Global error middleware:can be accessed by calling next(err); in the corresponding funcs.
app.use(errorController);

module.exports = app;
