import { BaseAdapter } from '../../core/adapter-base';
import { IUnifiedResource } from '../../core/types';

/**
 * Adapter for Paperless Parts
 * Focus on quoting and estimation for manufacturing
 */
export class PaperlessPartsAdapter extends BaseAdapter {
  
  async validateAuth(): Promise<boolean> {
    return !!this.connection.credentials?.apiToken;
  }

  async refreshToken(): Promise<void> {}

  async fetchData(endpoint: string): Promise<any> {
    return {};
  }

  async listResources(resourceType: string, params?: Record<string, any>): Promise<IUnifiedResource[]> {
     return [];
  }

  async getResource(resourceType: string, id: string): Promise<IUnifiedResource | null> {
    return null;
  }
}
