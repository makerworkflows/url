
import { eventBus } from "../event-bus";
// In a real app, this would use the AWS QLDB driver.
// For the pilot/demo, we mock the ledger interactions but keep the structure.

export interface ILedgerTransaction {
  transactionId: string;
  timestamp: string;
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  data: any;
  hash: string; // Cryptographic hash of the data
}

export class LedgerService {
  private transactions: ILedgerTransaction[] = [];
  
  constructor() {
      // Listen to EVERYTHING for the Audit Trail
      eventBus.subscribe((event) => {
          this.recordTransaction(event.type, event.payload);
      });
  }

  public async recordTransaction(table: string, data: any): Promise<ILedgerTransaction> {
    const transaction: ILedgerTransaction = {
      transactionId: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      type: "INSERT",
      table,
      data,
      hash: this.generateHash(data),
    };

    this.transactions.push(transaction);
    console.log(`[QLDB Ledger] Recorded: ${table}`, transaction);
    return transaction;
  }

  public async getHistory(table: string): Promise<ILedgerTransaction[]> {
    return this.transactions.filter((t) => t.table === table);
  }
  
  public getAllTransactions(): ILedgerTransaction[] {
      return this.transactions;
  }

  private generateHash(data: any): string {
    // Simple mock hash for demo
    return Buffer.from(JSON.stringify(data)).toString("base64").substring(0, 16);
  }
  
  // Backwards compatibility for original code
  public async execute(statement: string) {
      console.log(`[QLDB] Execute: ${statement}`);
      return [];
  }

  public async recordEntry(data: any) {
      return this.recordTransaction('LEGACY_ENTRY', data);
  }
}

export const ledgerService = new LedgerService();
