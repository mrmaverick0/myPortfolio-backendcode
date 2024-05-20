import mongoose from "mongoose";

const dbConnection = ()=>{
    mongoose.connect(process.env.MONGO_URL,{
        dbName:"PORTFOLIO"
    }).then(()=>{
        console.log('Connected to database');
    }).catch((err)=>{
        console.log(`Some error occured : ${err}`);
    })
}
export default dbConnection