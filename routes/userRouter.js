const express = require('express');
const userController = require('./../controllers/userController');
const routers = express.Router();
const authController = require('./../controllers/authController');

routers.post('/signup', authController.signup);
routers.post('/login', authController.login);
routers.get('/logout', authController.logOut);
routers.post('/forgotPassword', authController.forgotpassword);
routers.patch('/resetPassword/:token', authController.resetPassword);

//rigth now every route bellow this code just use protect midlle ware
routers.use(authController.protect);

routers.route('/me').get(userController.getMe, userController.getUser);
routers.patch('/changepassword', authController.changePassword);
routers.patch(
  '/updateMe',
  userController.uploadPhoto,
  userController.resizeUser,
  userController.updateMe
);
routers.patch('/deleteMe', userController.deleteMe);

//rigth now every route bellow this code just use verifyRole middle ware
routers.use(authController.verifyRole('admin'));

routers
  .route('/')
  .get(userController.getAllusers)
  .post(userController.createUser);

routers
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.DeleteUser);

module.exports = routers;
