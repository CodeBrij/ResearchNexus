import mongoose from 'mongoose';

// defining the connection - 
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MONGODB connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection error: " + error);   
    }
}
