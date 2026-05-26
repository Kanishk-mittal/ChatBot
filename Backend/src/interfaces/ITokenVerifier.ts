export interface ITokenVerifier {
  /**
   * Verifies the provided token and returns the extracted userID.
   * @param token The token to verify (e.g., Google ID Token).
   * @returns A Promise that resolves to the userID string.
   */
  verifyToken(token: string): Promise<string>;
}
