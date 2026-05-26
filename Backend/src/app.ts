import express from 'express';
import type { Application } from 'express';
import { AuthMiddleware } from './middlewares/AuthMiddleware.js';
import { GoogleAuthService } from './services/GoogleAuthService.js';

class App {
  public app: Application;
  public auth: AuthMiddleware;
  private port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;

    // Initialize Auth Layer
    const googleAuthService = new GoogleAuthService();
    this.auth = new AuthMiddleware(googleAuthService);

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

    // Example of a protected route
    this.app.get('/api/protected', this.auth.authenticate, (req, res) => {
      res.json({ message: 'You have accessed a protected route', userId: (req as any).userId });
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`Server is listening on port ${this.port}`);
    });
  }
}

export default App;
