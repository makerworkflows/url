
import { ledgerService } from "./service";

export async function testLedger() {
  console.log('🔗 Testing TraceGuard Ledger...');
  
  try {
    // 1. Record an entry
    console.log('Recording entry 1...');
    const entry1 = await ledgerService.recordEntry({
      action: 'LOGIN',
      user: 'test_user_1'
    });
    console.log('Entry 1 recorded:', entry1.transactionId);

    // 2. Record another entry
    console.log('Recording entry 2...');
    const entry2 = await ledgerService.recordEntry({
      action: 'UPDATE_PROFILE',
      user: 'test_user_1'
    });
    console.log('Entry 2 recorded:', entry2.transactionId);
    
    // 3. Verify history
    const history = await ledgerService.getHistory('LEGACY_ENTRY');
    console.log(`✅ History check: Found ${history.length} entries.`);
    
    if (history.length >= 2) {
        console.log('✅ Ledger persistence verified (in-memory).');
    } else {
        console.error('❌ Ledger persistence failed.');
    }

  } catch (error) {
    console.error('❌ Ledger Test Failed:', error);
  }
}

// Allow standalone execution if called directly
// if (require.main === module) {
//     testLedger();
// }
