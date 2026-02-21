export type UserRole = "superadmin" | "manager" | "sales";

export type SystemUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team: string;
  lastActive: string;
};

export const sampleUsers: SystemUser[] = [
  {
    id: "user_1",
    name: "Ashiq Rahman",
    email: "ashiq@yadhurtech.com",
    role: "superadmin",
    team: "Leadership",
    lastActive: "5m ago",
  },
  {
    id: "user_2",
    name: "Misha Patel",
    email: "misha@yadhurtech.com",
    role: "manager",
    team: "Enterprise",
    lastActive: "18m ago",
  },
  {
    id: "user_3",
    name: "Diego Ochoa",
    email: "diego@yadhurtech.com",
    role: "sales",
    team: "Growth",
    lastActive: "1h ago",
  },
  {
    id: "user_4",
    name: "Wen Lin",
    email: "wen@yadhurtech.com",
    role: "sales",
    team: "Growth",
    lastActive: "2h ago",
  },
];
