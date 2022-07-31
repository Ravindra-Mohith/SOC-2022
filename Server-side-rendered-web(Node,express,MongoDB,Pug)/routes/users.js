const userController = require(`${__dirname}/../controllers/userscontrollers`);
const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');

//Param Middleware:

router.param('id', (req, res, next, val) => {
  console.log(`User id is ${val}`);
  next();
});

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotpassword', authController.forgotpassword);
router.patch('/resetpassword/:token', authController.resetpassword);

router.use(authController.authenticate);
// from here on router uses authController.authenticate FOR protecting routes in the following

router.patch('/updateMyPassword', authController.updatePassword);
router.route('/me').get(userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

//the following should be used only by admins:
router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getallUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
