import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = 8080;

var path = require('path');

app.get('/', (req: Request, res: Response) => {
  
  res.sendFile(path.resolve('../frontend/out/index.html'));

  app.use('/', express.static(path.resolve('../frontend/out')));
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
