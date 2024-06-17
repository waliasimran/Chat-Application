const asyncHandler=require("express-async-handler");
const Chat=require("../Models/chatModel");
const User=require('../Models/userModel')


// in elase block we are creating a new chat and then storing it

//this router is responsible for creating or fetching a one on one chat
const accessChat=asyncHandler(async(req,res)=>{
    //in this function we are going to take the user id with whom we will be creating a chat,so current user who is logged in will send us the email id
    //here the logged in person is providing the id of the person with whom he want to chat
    //this is the id of the user that we are requesting
    //req.user._id is the id of the logged in person
    const {userId}=req.body;

    if(!userId)
        {
            console.log("UserId param not sent with request");
            return res.sendStatus(400);
        }
        //if chat exists with this user 
        var isChat=await Chat.find({
            isGroupChat:false,
            //because it is a one to one chat
            $and:[
                //for a chat to exist it should satisfy both these conditions
                {users:{$elemMatch: {$eq:req.user._id}}},
                {users: {$elemMatch: {$eq:userId}}},
            ],
        }).populate("users","-password")
        .populate("latestMessages");

        isChat=await User.populate(isChat,{
            path:"latestMessages.sender",
            select:"name pic email",
        });

        if(isChat.length>0)
            {
                res.send(isChat[0]);
                //other way also only one chat exists between the two users
            }
            else{
                //create a new chat

                var chatData={
                    chatName:"sender",
                    isGroupChat:false,
                    users:[req.user._id,userId],
                };
                try{
                    //creating the chat
                    const createdChat=await Chat.create(chatData);
                    //sending this chat to the user
                    const FullChat=await Chat.findOne({_id:createdChat._id}).populate("users","-password");
                    res.status(200).send(FullChat);
                }
                    catch(error){
                        res.status(400);
                        throw new Error(error.message);

                    }
                }
            
});

const fetchChats=asyncHandler(async(req,res)=>{
    try{
        // find the id of the person for whom all chats have to find out
        Chat.find({users:{$elemMatch:{ $eq:req.user._id}}})
        .populate("users","-password")
        .populate("latestMessages")
        .populate("groupAdmin","-password")
        .sort({updatedAt:-1})
        .then(async(results)=>{
            results=await User.populate(results,{
                path:"latestMessages.sender",
                select:"name pic email",
            });
            res.status(200).send(results);
        });
        
    }
    catch(error)
    {
         res.status(400);
         throw new Error(error.message);
    }
})

const createGroupChat=asyncHandler(async(req,res)=>{
    //requires a chat name and users to be added to the group
   if(!req.body.users || !req.body.name)
    {
        return res.status(400).send({message:"Please Fill all the Fields"})
    }
    //By parsing,data becomes a javascript object.
    var users=JSON.parse(req.body.users);
    if(users.length<2)
        {
            return res.status(400).send("More than 2 users are required to form a group chat")
        }
        //add the logged in person to the group chat
        users.push(req.user);

        try{
            const groupChat=await Chat.create({
                chatName:req.body.name,
                users:users,
                isGroupChat:true,
                groupAdmin:req.user,
            });
            //now we will fetch the group chat from the database and send it back to the user.

            const fullGroupChat=await Chat.findOne({_id:groupChat._id})
            .populate("users","-password")
            .populate("groupAdmin","-password");

            res.status(200).json(fullGroupChat);

        }catch(error)
        {
              res.status(400);
              throw new Error(error.message);
        }
})

const renameGroup=asyncHandler(async(req,res)=>{
    const {chatId,chatName}=req.body;

    const updatedChat=await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName,
        },
        {
            new:true,
        }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");

    if(!updatedChat)
        {
            res.status(404);
            throw new Error("Chat not found");
        } else {
              res.json(updatedChat);
        }

});

const addToGroup=asyncHandler(async(req,res)=>{
    const {chatId,userId}=req.body;

    const added=await Chat.findByIdAndUpdate(
        chatId,
        {
            $push:{users:userId},
        },
        
            {new:true}
        
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");

    if(!added)
        {
            res.status(404);
            throw new Error("Chat Not Found");
        }
        else{
            res.json(added);
            //res.json() Sends data in JSON format and ends the request
        }


});

const removeFromGroup=asyncHandler(async(req,res)=>{
    const {chatId,userId}=req.body;

    const removed=await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull:{users:userId},
        },
        
            {new:true}
        
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");

    if(!removed)
        {
            res.status(404);
            throw new Error("Chat Not Found");
        }
        else{
            res.json(removed);
            //res.json() Sends data in JSON format and ends the request
        }


});

module.exports={accessChat,fetchChats,createGroupChat,renameGroup,addToGroup,removeFromGroup};


