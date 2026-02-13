
import { v4 as uuidv4 } from "uuid";
import { eventBus } from "../../../services/event-bus"; // Import Event Bus

export interface ILead {
  id: string;
  name: string;
  company: string;
  source: "HubSpot" | "Salesforce" | "Dynamics 365";
  status: "New" | "Qualified" | "Negotiation" | "Closed Won";
  score: number;
  lastContact: string; // ISO date
  emailDraft?: string;
}

const MOCK_LEADS: ILead[] = [
  {
    id: "LEAD-001",
    name: "Alice Johnson",
    company: "BioLife Pharmaceuticals",
    source: "Salesforce",
    status: "Qualified",
    score: 85,
    lastContact: "2024-03-10T10:00:00Z",
  },
  {
    id: "LEAD-002",
    name: "Bob Smith",
    company: "NutraPure Inc.",
    source: "HubSpot",
    status: "New",
    score: 45,
    lastContact: "2024-03-09T14:30:00Z",
  },
   {
    id: "LEAD-003",
    name: "Charlie Davis",
    company: "Peak Performance Labs",
    source: "Dynamics 365",
    status: "Negotiation",
    score: 92,
    lastContact: "2024-03-12T09:15:00Z",
  },
];

export class SalesAgentService {
  private leads: ILead[] = [...MOCK_LEADS];

  public getLeads(): ILead[] {
    return this.leads;
  }

  public analyzeLead(leadId: string): string {
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) return "Lead not found.";

    // Mock AI Analysis Logic
    if (lead.score > 80) {
      return `High Intent Detected. Recommend immediate demo scheduling. Key interest: 'Regulatory Compliance'.`;
    } else if (lead.score > 50) {
      return `Medium Intent. Nurture with case studies on ROI.`;
    } else {
      return `Low Intent. Verify contact details and revisit in Q3.`;
    }
  }

  public generateOutreach(leadId: string): string {
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) return "";

    return `Subject: Transforming ${lead.company}'s compliance workflow\n\nHi ${lead.name},\n\nI noticed ${lead.company} is scaling production...`;
  }
  
  public async chatWithAgent(query: string): Promise<string> {
      // Mock Natural Language Query Response
      if (query.toLowerCase().includes("top leads")) {
          return "Based on scoring, your top leads are Alice Johnson (85) and Charlie Davis (92). Charlie is in negotiation stage.";
      }
      if (query.toLowerCase().includes("follow up")) {
          return "I've drafted 3 follow-up emails for leads in 'New' status. Would you like to review them?";
      }
      return "I can help you analyze leads, draft emails, or forecast revenue. Try asking 'Who should I contact today?'";
  }

  // NEW: Trigger 'Closed Won' to start manufacturing
  public closeDeal(leadId: string) {
      const lead = this.leads.find(l => l.id === leadId);
      if(lead) {
          lead.status = "Closed Won";
          // Emit event to start production workflow
          eventBus.publish({ 
              type: 'SALES_DEAL_WON', 
              payload: { 
                  dealId: lead.id, 
                  product: 'Protein Bar - Chocolate', // Mock product for demo
                  quantity: 50000 
              } 
          });
      }
  }
}

export const salesAgent = new SalesAgentService();
