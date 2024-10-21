import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import songRouter from './src/routes/songRoute.js';
import connectDB from './src/config/mongodb.js';
import connectCloudinary from './src/config/cloudinary.js';
import albumRouter from './src/routes/albumRoute.js';
import userRouter from './src/routes/userRoute.js';
import roleRouter from './src/routes/roleRoute.js';
import categoryRouter from './src/routes/categoryRoute.js';
import playlistRouter from './src/routes/playlistRoute.js';
import libraryRouter from './src/routes/libraryRoute.js';

//app config
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();


// middlewares
app.use(express.json());
app.use(cors());


//initializing routes
app.use("/api/role", roleRouter)
app.use("/api/user", userRouter)
app.use("/api/song", songRouter)
app.use("/api/album", albumRouter)
app.use("/api/category", categoryRouter)
app.use("/api/playlist", playlistRouter)
app.use("/api/library", libraryRouter)

app.get('/', (req, res) => res.send("API Working"))

app.listen(port, () => console.log(`Server started on http://localhost:${port}`))