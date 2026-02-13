import { BaseAdapter } from '../../core/adapter-base';
import { IUnifiedResource } from '../../core/types';

/**
 * Adapter for ValuAdder
 */
export class ValuAdderAdapter extends BaseAdapter {
  
  async validateAuth(): Promise<boolean> {
    return !!this.connection.credentials?.licenseKey;
  }

  async refreshToken(): Promise<void> {}
  
  async listResources(resourceType: string, params?: Record<string, any>): Promise<IUnifiedResource[]> {
     return [];
  }

  async getResource(resourceType: string, id: string): Promise<IUnifiedResource | null> {
    return null;
  }
}
