import type { UserRole } from "./users";

export type LeadStage = string;

export const leadStages: LeadStage[] = [
  "New",
  "Contacted",
  "Qualified",
  "Negotiation",
  "Won",
  "Lost",
];

export type LeadOwner = {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
  role?: UserRole;
  team?: string;
};

export type Lead = {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: LeadStage;
  owner: LeadOwner;
  priority: "High" | "Medium" | "Low";
  lastContacted: string;
  nextAction: string;
  notes: string;
  channel: string;
  quoteUrl?: string;
  is_archived?: boolean;
  phone?: string;
};

export const sampleOwners: LeadOwner[] = [
  {
    id: "owner_1",
    name: "Priya Desai",
    email: "priya@yadhurtech.com",
    initials: "PD",
    color: "#f97316",
    role: "superadmin",
    team: "Leadership",
  },
  {
    id: "owner_2",
    name: "Marcus Rivera",
    email: "marcus@yadhurtech.com",
    initials: "MR",
    color: "#3b82f6",
    role: "manager",
    team: "Enterprise",
  },
  {
    id: "owner_3",
    name: "Lena Ortiz",
    email: "lena@yadhurtech.com",
    initials: "LO",
    color: "#14b8a6",
    role: "sales",
    team: "Growth",
  },
];

export const sampleLeads: Lead[] = [
  {
    id: "lead_1",
    name: "Apollo Health",
    company: "Apollo Health",
    value: 48000,
    stage: "New",
    owner: sampleOwners[0],
    priority: "High",
    lastContacted: "2 days ago",
    nextAction: "Schedule discovery",
    notes: "AI-assisted diagnostics for rural clinics",
    channel: "Email",
    quoteUrl: undefined,
  },
  {
    id: "lead_2",
    name: "Aster Retail",
    company: "Aster Retail",
    value: 16000,
    stage: "Contacted",
    owner: sampleOwners[1],
    priority: "Medium",
    lastContacted: "Today",
    nextAction: "Send updated proposal",
    notes: "Waiting on budget approval",
    channel: "LinkedIn",
  },
  {
    id: "lead_3",
    name: "Velox Supply",
    company: "Velox Supply",
    value: 32000,
    stage: "Qualified",
    owner: sampleOwners[2],
    priority: "High",
    lastContacted: "Yesterday",
    nextAction: "Finalize contract",
    notes: "Need to coordinate with procurement",
    channel: "Phone",
  },
  {
    id: "lead_4",
    name: "Northwind Labs",
    company: "Northwind Labs",
    value: 21500,
    stage: "Negotiation",
    owner: sampleOwners[0],
    priority: "Medium",
    lastContacted: "4 days ago",
    nextAction: "Send NDA",
    notes: "Legal review in progress",
    channel: "Email",
  },
  {
    id: "lead_5",
    name: "Azure Mobility",
    company: "Azure Mobility",
    value: 55000,
    stage: "Won",
    owner: sampleOwners[1],
    priority: "High",
    lastContacted: "1 week ago",
    nextAction: "Kickoff meeting",
    notes: "Pilot location: Denver",
    channel: "Referral",
  },
  {
    id: "lead_6",
    name: "Helix Education",
    company: "Helix Education",
    value: 9800,
    stage: "Lost",
    owner: sampleOwners[2],
    priority: "Low",
    lastContacted: "3 weeks ago",
    nextAction: "Re-engage in Q3",
    notes: "Budget declined",
    channel: "Conference",
  },
];
