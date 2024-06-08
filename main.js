import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';

import { tokenDecodeMiddware } from './middlewares/tokenDecodeMiddware.js';
import { notfoundMiddleware } from './middlewares/notfoundMiddleware.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { rootRouter } from './routers/routers.js';
import { initSwagger } from './swagger.js'

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(morgan(':method :url :status - :response-time ms'));
app.use(express.json());

app.use(tokenDecodeMiddware);
app.use(rootRouter);
initSwagger(app);

app.use(notfoundMiddleware);
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});