import express from 'express';
import cors from 'cors';
import { adminController, chatController, metaController } from './controllers';


const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// controllers
app.use(metaController);
app.use(adminController);
app.use(chatController);


export default app;