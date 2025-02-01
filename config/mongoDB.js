const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/multiDBoards`, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('Connection error', err.message);
    }
};

connectDB();

mongoose.connection
.on('connected', ()=>{   //when mongoose connected
    console.log('Mongoose connected to db')
})
.on('error', (err)=>{    //on mongoose connection error
    console.log(err.message)
})
.on('disconnected', ()=>{    //on mongoose disconnection
    console.log('Mongoose connection is disconnected')
});

process.on('SIGINT', async()=>{
    await mongoose.connection.close();
    process.exit(0)
});