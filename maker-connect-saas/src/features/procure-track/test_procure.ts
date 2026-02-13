
import { procureTrackService } from "./service";

async function testProcureTrack() {
  console.log('🛒 Testing ProcureTrack AI...');
  
  // 1. List Requisitions
  const reqs = await procureTrackService.getRequisitions();
  console.log(`✅ Loaded ${reqs.length} active requisitions.`);
  
  const pendingReq = reqs.find(r => r.status === 'PENDING_APPROVAL');
  if (!pendingReq) {
      console.warn('⚠️ No PENDING_APPROVAL requisitions to test PO generation.');
      return;
  }
  
  console.log(`👉 Found pending requisition: ${pendingReq.id} for ${pendingReq.items[0].name}`);

  // 2. Generate PO
  const po = await procureTrackService.generatePO(pendingReq.id);
  if (po && po.poNumber && po.poNumber.startsWith('PO-')) {
      console.log(`✅ PO Generated: ${po.poNumber}`);
      console.log(`   - Vendor: ${po.vendorId}`);
  } else {
      console.error('❌ Failed to generate PO or missing PO Number');
  }
}

testProcureTrack();
