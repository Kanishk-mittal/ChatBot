import express from 'express';
import type { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { AuthMiddleware } from './middlewares/AuthMiddleware.js';
import { GoogleAuthService } from './services/GoogleAuthService.js';
import { getChatRoutes } from './routes/chatRoutes.js';

class App {
  public app: Application;
  public auth: AuthMiddleware;
  private port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;

    // Initialize Layers
    const googleAuthService = new GoogleAuthService();
    this.auth = new AuthMiddleware(googleAuthService);

    this.initMiddlewares();
    this.setupRoutes();
  }

  private initMiddlewares() {
    this.app.use(helmet());
    this.app.use(morgan('dev'));
    this.app.use(cors({
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    this.app.use(express.json());
  }

  private setupRoutes() {
    this.app.get('/', (req, res) => {
      res.send('ChatBot Backend is running');
    });

    // Chat routes
    this.app.use('/api/chat', getChatRoutes(this.auth));
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`Server is listening on port ${this.port}`);
    });
  }
}

export default App;
