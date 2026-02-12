import { IConnection, IUnifiedResource } from './types';

export abstract class BaseAdapter {
  protected connection: IConnection;

  constructor(connection: IConnection) {
    this.connection = connection;
  }

  /**
   * Validates if the current connection credentials are valid.
   */
  abstract validateAuth(): Promise<boolean>;

  /**
   * Refreshes the access token if applicable.
   */
  abstract refreshToken(): Promise<void>;

  /**
   * Generic method to fetch a resource by ID.
   * @param resourceType The type of resource to fetch (e.g., 'customer', 'order')
   * @param id The remote ID of the resource
   */
  abstract getResource(resourceType: string, id: string): Promise<IUnifiedResource | null>;

  /**
   * Generic method to list resources.
   * @param resourceType The type of resource to list
   * @param params Optional query parameters
   */
  abstract listResources(resourceType: string, params?: Record<string, any>): Promise<IUnifiedResource[]>;
  
  // Helper to handle API requests (could be replaced by specific library)
  protected async request(method: string, endpoint: string, data?: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
