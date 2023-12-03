const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://shokalash21016:Cljia1I7pLgFIBgv@has01.veerjhz.mongodb.net/?retryWrites=true&w=majority', { // Replace with your MongoDB connection string
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;