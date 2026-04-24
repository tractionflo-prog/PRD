export type FindLead = {
  source: string;
  title: string;
  snippet: string;
  url: string;
  why: string;
  reply: string;
};

export type FindUsersResponse = {
  leads: FindLead[];
};
