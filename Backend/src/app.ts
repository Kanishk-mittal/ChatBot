import express from 'express';
import type { Application } from 'express';

class App {
  public app: Application;
  private port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;

    this.initMiddlewares();
    this.setupRoutes();
  }

  private initMiddlewares() {
    this.app.use(express.json());
  }

  private setupRoutes() {
    this.app.get('/', (req, res) => {
      res.send('ChatBot Backend is running');
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`Server is listening on port ${this.port}`);
    });
  }
}

export default App;
