const express=require('express');
const router=express.Router();
const {protect}=require("../middleware/authMiddleware")
const {accessChat,fetchChats,createGroupChat,renameGroup,addToGroup,removeFromGroup}=require('../controllers/chatControllers');


//for creating a one on one chat
 router.route('/').post(protect,accessChat);

 //fetching all chats for a particular user
router.route('/').get(protect,fetchChats);

//creation of group
router.route("/group").post(protect,createGroupChat);

//for renaming the group
 router.route("/rename").put(protect,renameGroup);

 router.route("/groupadd").put(protect,addToGroup);

 router.route("/groupremove").put(protect,removeFromGroup);

 

module.exports=router;