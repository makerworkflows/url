import { IConnection, IntegrationCategory } from './types';

export class ConnectionManager {
  private connections: Map<string, IConnection> = new Map();

  /**
   * Retrieves a connection by its ID.
   */
  async getConnection(id: string): Promise<IConnection | undefined> {
    // TODO: Fetch from database
    return this.connections.get(id);
  }

  /**
   * Registers a new connection.
   */
  async registerConnection(connection: IConnection): Promise<void> {
    // TODO: Save to database encrypted
    this.connections.set(connection.id, connection);
  }

  /**
   * Updates an existing connection's settings or credentials.
   */
  async updateConnection(id: string, updates: Partial<IConnection>): Promise<void> {
    const existing = await this.getConnection(id);
    if (!existing) {
      throw new Error(`Connection ${id} not found`);
    }
    const updated = { ...existing, ...updates };
    this.connections.set(id, updated);
  }

  /**
   * Lists all active connections for a specific category.
   */
  async listActiveConnections(category?: IntegrationCategory): Promise<IConnection[]> {
    const all = Array.from(this.connections.values());
    return all.filter(c => c.isActive && (!category || c.category === category));
  }
}
