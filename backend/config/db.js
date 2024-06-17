const mongoose=require('mongoose')

const connectDB=async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_URI,{
           
           

        });
        console.log('Mongodb connected',conn.connection.host);
    }
    catch(error){
        console.log('Error is',error.message);
        process.exit();

    }
};

module.exports=connectDB;