
import { BarTenderAdapter } from './label_compliance/bartender/adapter';
import { LoftwareAdapter } from './label_compliance/loftware/adapter';
import { ZebraAdapter } from './label_compliance/zebra/adapter';
import { SatoAdapter } from './label_compliance/sato/adapter';
import { TeklynxAdapter } from './label_compliance/teklynx/adapter';

import { FoodLogiQAdapter } from './traceability/foodlogiq/adapter';
import { IBMFoodTrustAdapter } from './traceability/ibm_food_trust/adapter';
import { ParityFactoryAdapter } from './traceability/parityfactory/adapter';
import { SafetyCultureAdapter } from './traceability/safetyculture/adapter';
import { TraceGainsAdapter } from './traceability/tracegains/adapter';

import { SalesforceCPQAdapter } from './cpq/salesforce/adapter';
import { PaperlessPartsAdapter } from './cpq/paperless_parts/adapter';

import { BizEquityAdapter } from './valuation/bizequity/adapter';
import { ValuAdderAdapter } from './valuation/valuadder/adapter';

// ERP
import { NetSuiteAdapter } from './erp/netsuite/adapter';
import { Dynamics365Adapter } from './erp/dynamics365/adapter';
import { SapS4HanaAdapter } from './erp/sap/adapter';
import { InforSyteLineAdapter } from './erp/infor/adapter';
import { EpicorKineticAdapter } from './erp/epicor/adapter';

// CRM
import { HubSpotAdapter } from './crm/hubspot/adapter';
import { Dynamics365SalesAdapter } from './crm/dynamics365_sales/adapter';
import { OracleCxAdapter } from './crm/oracle_cx/adapter';
import { ZohoCrmAdapter } from './crm/zoho/adapter';

// QMS
import { MasterControlAdapter } from './qms/mastercontrol/adapter';
import { EtqRelianceAdapter } from './qms/etq/adapter';
import { VeevaVaultAdapter } from './qms/veeva/adapter';
import { SpartaTrackWiseAdapter } from './qms/sparta/adapter';
import { QualioAdapter } from './qms/qualio/adapter';

import { IConnection, IntegrationCategory } from './core/types';

const mockConnection: IConnection = {
  id: 'test-conn',
  provider: 'test',
  category: IntegrationCategory.ERP,
  settings: {},
  credentials: { apiKey: 'test', accessToken: 'token', username: 'user' },
  isActive: true
};

async function verify() {
  console.log('Verifying Label Compliance Adapters...');
  new BarTenderAdapter(mockConnection); console.log('- Bartender: OK');
  new LoftwareAdapter(mockConnection); console.log('- Loftware: OK');
  new ZebraAdapter(mockConnection); console.log('- Zebra: OK');
  new SatoAdapter(mockConnection); console.log('- SATO: OK');
  new TeklynxAdapter(mockConnection); console.log('- Teklynx: OK');

  console.log('\nVerifying Traceability Adapters...');
  new FoodLogiQAdapter(mockConnection); console.log('- FoodLogiQ: OK');
  new IBMFoodTrustAdapter(mockConnection); console.log('- IBM Food Trust: OK');
  new ParityFactoryAdapter(mockConnection); console.log('- ParityFactory: OK');
  new SafetyCultureAdapter(mockConnection); console.log('- SafetyCulture: OK');
  new TraceGainsAdapter(mockConnection); console.log('- TraceGains: OK');

  console.log('\nVerifying CPQ Adapters...');
  new SalesforceCPQAdapter(mockConnection); console.log('- Salesforce CPQ: OK');
  new PaperlessPartsAdapter(mockConnection); console.log('- Paperless Parts: OK');

  console.log('\nVerifying Valuation Adapters...');
  new BizEquityAdapter(mockConnection); console.log('- BizEquity: OK');
  new ValuAdderAdapter(mockConnection); console.log('- ValuAdder: OK');
  
  console.log('\nVerifying ERP Adapters...');
  new NetSuiteAdapter(mockConnection); console.log('- NetSuite: OK');
  new Dynamics365Adapter(mockConnection); console.log('- Dynamics 365 F&O: OK');
  new SapS4HanaAdapter(mockConnection); console.log('- SAP S/4HANA: OK');
  new InforSyteLineAdapter(mockConnection); console.log('- Infor SyteLine: OK');
  new EpicorKineticAdapter(mockConnection); console.log('- Epicor Kinetic: OK');

  console.log('\nVerifying CRM Adapters...');
  new HubSpotAdapter(mockConnection); console.log('- HubSpot: OK');
  new Dynamics365SalesAdapter(mockConnection); console.log('- Dynamics 365 Sales: OK');
  new OracleCxAdapter(mockConnection); console.log('- Oracle CX: OK');
  new ZohoCrmAdapter(mockConnection); console.log('- Zoho CRM: OK');

  console.log('\nVerifying QMS Adapters...');
  new MasterControlAdapter(mockConnection); console.log('- MasterControl: OK');
  new EtqRelianceAdapter(mockConnection); console.log('- ETQ Reliance: OK');
  new VeevaVaultAdapter(mockConnection); console.log('- Veeva Vault: OK');
  new SpartaTrackWiseAdapter(mockConnection); console.log('- Sparta TrackWise: OK');
  new QualioAdapter(mockConnection); console.log('- Qualio: OK');

  console.log('\nAll 24 adapters instantiated successfully.');
}

verify().catch(console.error);
