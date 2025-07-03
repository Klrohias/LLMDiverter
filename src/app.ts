import express from 'express';
import cors from 'cors';
import { adminController, chatController } from './controllers';


const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// controllers
app.use(chatController);
app.use(adminController);


export default app;