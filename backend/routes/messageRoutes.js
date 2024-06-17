const express=require('express')
const router=express.Router();
const {sendMessage,allMessages}=require('../controllers/messageControllers');
const {protect}=require('../middleware/authMiddleware')

//there will be 2 routers-one for sending the messages and other for fetching all the messages in a particular chat

 router.route('/').post(protect,sendMessage);
 router.route('/:chatId').get(protect,allMessages);

module.exports=router;