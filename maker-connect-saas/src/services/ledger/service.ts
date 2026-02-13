import { createHash, createSign, createVerify, generateKeyPairSync } from 'crypto';

export interface ILedgerEntry {
  id: string;
  previousHash: string;
  dataHash: string;
  timestamp: Date;
  signature: string;
  signerId: string;
  data: any;
}

export class LedgerService {
  private ledger: ILedgerEntry[] = [];
  private privateKey: string;
  private publicKey: string;
  private signerId: string = 'system_signer';

  constructor() {
    // Generate a key pair for the system signer (mocking a secure wallet/KMS)
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });
    this.privateKey = privateKey;
    this.publicKey = publicKey;

    // Genesis block
    this.recordEntry({ event: 'GENESIS_BLOCK', note: 'Ledger initialized' });
  }

  /**
   * Calculates SHA-256 hash of any data object
   */
  public calculateHash(data: any): string {
    const dataString = JSON.stringify(data, Object.keys(data).sort()); // Sort keys for deterministic hashing
    return createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Records an entry to the immutable ledger
   */
  public async recordEntry(data: any, signerId?: string): Promise<ILedgerEntry> {
    const previousEntry = this.ledger[this.ledger.length - 1];
    const previousHash = previousEntry ? this.calculateHash(previousEntry) : '0';
    const dataHash = this.calculateHash(data);
    const timestamp = new Date();

    const entryPayload = {
      previousHash,
      dataHash,
      timestamp,
      signerId: signerId || this.signerId,
      data
    };

    // Sign the entry hash to prove authenticity
    const entryHash = this.calculateHash(entryPayload);
    const sign = createSign('SHA256');
    sign.update(entryHash);
    sign.end();
    const signature = sign.sign(this.privateKey, 'hex');

    const newEntry: ILedgerEntry = {
      id: entryHash,
      ...entryPayload,
      signature
    };

    // In a real system, this would write to QLDB via AWS SDK
    // await this.qldbDriver.executeLambda(...)
    this.ledger.push(newEntry);
    
    console.log(`[Ledger] Recorded entry ${newEntry.id.substring(0, 8)}...`);
    return newEntry;
  }

  /**
   * Verifies the integrity of the entire ledger chain
   */
  public async verifyChain(): Promise<boolean> {
    for (let i = 1; i < this.ledger.length; i++) {
      const currentEntry = this.ledger[i];
      const previousEntry = this.ledger[i - 1];

      // 1. Verify previous hash link
      const recalculatedPrevHash = this.calculateHash(previousEntry);
      if (currentEntry.previousHash !== recalculatedPrevHash) {
        console.error(`[Ledger] Chain broken at index ${i}: Previous hash mismatch`);
        return false;
      }

      // 2. Verify signature
      const entryPayload = {
        previousHash: currentEntry.previousHash,
        dataHash: currentEntry.dataHash,
        timestamp: currentEntry.timestamp,
        signerId: currentEntry.signerId,
        data: currentEntry.data
      };
      const entryHash = this.calculateHash(entryPayload);
      
      const verify = createVerify('SHA256');
      verify.update(entryHash);
      verify.end();
      
      if (!verify.verify(this.publicKey, currentEntry.signature, 'hex')) {
        console.error(`[Ledger] Invalid signature at index ${i}`);
        return false;
      }
    }
    return true;
  }

  public getChain(): ILedgerEntry[] {
    return this.ledger;
  }
}

// Singleton instance
export const ledgerService = new LedgerService();
