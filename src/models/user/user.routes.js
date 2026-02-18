const express = require('express');
const controller = require('./user.controller');
const { authenticateUser, authorizeRoles } = require('../../middlewares/auth.middleware')

const router = express.Router();

router.post(
    '/', 
    authenticateUser,
    authorizeRoles('admin'),
    controller.createUser
);     
router.get(
    '/', 
    authenticateUser,
    authorizeRoles('admin'),
    controller.getAllUsers
); 
router.get(
    '/profile',
    authenticateUser,
    controller.getProfile
)  
router.get(
    '/:id',
    authenticateUser, 
    authorizeRoles('admin'),
    controller.getUserById
); 

module.exports = router;
