export class PeerUnavailableError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'PeerUnavailableError';
  }
}