const router = require('express').Router();
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');

router.get('/view', authController.isLoggedIn, viewController.get);
router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLogin);
router.get('/me', authController.authenticate, viewController.getMe);
router.get('/signup',authController.SIGNUP,)

module.exports = router;
