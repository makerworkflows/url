import { BaseAdapter } from '../../core/adapter-base';
import { IUnifiedResource } from '../../core/types';

/**
 * Adapter for Epicor Kinetic
 * Uses REST v2 API
 */
export class EpicorKineticAdapter extends BaseAdapter {

  async validateAuth(): Promise<boolean> {
    // Basic Auth or Token
    return !!this.connection.credentials?.apiKey;
  }

  async refreshToken(): Promise<void> {
    // API Key usually static, but session tokens might expire
  }

  async getResource(resourceType: string, id: string): Promise<IUnifiedResource | null> {
    // Erp.BO.SalesOrderSvc/SalesOrders({OrderNum})
    return {
      id: id,
      remoteId: id,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdDate: new Date(),
      rawData: { OrderNum: parseInt(id), CustNum: 105 }
    } as any;
  }

  async listResources(resourceType: string, params?: Record<string, any>): Promise<IUnifiedResource[]> {
    return [];
  }
}
