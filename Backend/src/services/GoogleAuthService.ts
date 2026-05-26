import { OAuth2Client } from 'google-auth-library';
import type { ITokenVerifier } from '../interfaces/ITokenVerifier.js';
import dotenv from 'dotenv';

dotenv.config();

export class GoogleAuthService implements ITokenVerifier {
  private client: OAuth2Client;
  private clientID: string;

  constructor() {
    this.clientID = process.env.GOOGLE_CLIENT_ID || '';
    if (!this.clientID) {
      throw new Error('GOOGLE_CLIENT_ID is not defined in environment variables');
    }
    this.client = new OAuth2Client(this.clientID);
  }

  /**
   * Verifies the Google ID Token and returns the user's unique Google ID (sub).
   * @param token The ID token from the client-side Google login.
   */
  async verifyToken(token: string): Promise<string> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.clientID,
      });
      const payload = ticket.getPayload();

      if (!payload || !payload.sub) {
        throw new Error('Invalid token payload: missing sub (userID)');
      }

      // 'sub' is the unique identifier for the user in Google
      return payload.sub;
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new Error('Authentication failed: Invalid Google token');
    }
  }
}
