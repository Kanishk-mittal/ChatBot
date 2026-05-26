import type { Request, Response, NextFunction } from 'express';
import type { ITokenVerifier } from '../interfaces/ITokenVerifier.js';

/**
 * Custom Request interface to include the verified userID.
 */
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class AuthMiddleware {
  private verifier: ITokenVerifier;

  constructor(verifier: ITokenVerifier) {
    this.verifier = verifier;
  }

  /**
   * Express middleware to authenticate requests using a token.
   * Expects an 'Authorization: Bearer <token>' header.
   */
  public authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid Authorization header' });
        return;
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        res.status(401).json({ error: 'Invalid Authorization header format' });
        return;
      }
      const userId = await this.verifier.verifyToken(token);

      // Attach the verified userID to the request object
      req.userId = userId;

      next();
    } catch (error) {
      console.error('Authentication middleware error:', error);
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };
}
