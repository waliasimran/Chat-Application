const express=require('express')
const {registerUser,authUser,allUsers}=require('../controllers/userControllers');
const {protect}=require("../middleware/authMiddleware")
//creating an instance of router from express
const router=express.Router();  
//we will use this router to create different routers

//see the difference between router.route and router.get

//router.route can be changed while router.get cannot

//authUser,allUsers,registerUser all are found in userController file

//before going to allUsers it goes to protect to check whether the user is authorized or not with the help of jwt token.
//this statement searches for user
router.route('/').post(registerUser).get(protect,allUsers);
router.post('/login',authUser)
module.exports=router;