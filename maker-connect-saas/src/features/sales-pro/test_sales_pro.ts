
import { salesAgent } from "./agent/service";

async function testSalesPro() {
  console.log('🤖 Testing SalesPro AI Agent...');
  
  // 1. Fetch Leads
  const leads = salesAgent.getLeads();
  console.log(`✅ Fetched ${leads.length} leads from disparate sources.`);
  
  // 2. Analyze Lead
  const hotLead = leads.find(l => (l.score || 0) > 80);
  if (hotLead) {
    const analysis = await salesAgent.analyzeLead(hotLead.id);
    console.log(`✅ Analysis for ${hotLead.name}:\n${analysis}`); // analysis is now a string
  } else {
    console.warn('⚠️ No hot leads found to test qualification.');
  }
}

testSalesPro();
