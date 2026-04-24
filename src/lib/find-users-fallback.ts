import type { FindLead, FindUsersResponse } from "./find-users-types";

function pickVertical(product: string): "landlord" | "saas" | "generic" {
  const t = product.toLowerCase();
  if (/landlord|tenant|rental|lease|property|realt/i.test(t)) {
    return "landlord";
  }
  if (/saas|crm|api|workflow|founder|startup|b2b|dashboard/i.test(t)) {
    return "saas";
  }
  return "generic";
}

function enc(q: string) {
  return encodeURIComponent(q.slice(0, 200));
}

/** High-intent preview leads when Reddit fetch or OpenAI is unavailable or fails. */
export function getFallbackLeads(product: string): FindUsersResponse {
  const v = pickVertical(product);
  const q = product.trim().slice(0, 80) || "your product";

  if (v === "landlord") {
    const leads: FindLead[] = [
      {
        source: "Reddit",
        title: "Any tools for managing tenants without spreadsheets?",
        snippet:
          "I only manage a few units but spreadsheets are getting messy. Looking for something lightweight I can actually stick with.",
        url: `https://www.reddit.com/search/?q=${enc("landlord tenant management spreadsheet alternative tool")}`,
        why: "They are asking directly for tools to replace spreadsheets, which is a concrete workflow swap—not a growth theory thread.",
        reply:
          "Hey — saw your post about tenant tracking. Built something for this. Happy to share if useful.",
      },
      {
        source: "Reddit",
        title: "Recommendations for tracking maintenance requests (small landlord)?",
        snippet:
          "Texts + notes aren’t scaling. I want something simple—what do you use for work orders and tenant messages?",
        url: `https://www.reddit.com/search/?q=${enc("small landlord maintenance requests tracking tool recommend")}`,
        why: "They are explicitly asking what others use to handle maintenance and messages—clear tool-seeking intent.",
        reply:
          "Thanks for spelling out the workflow — I’m working on something adjacent. If you want a quick look, I can share a short demo.",
      },
      {
        source: "Reddit",
        title: "Is there a lightweight rent collection tool that doesn’t feel corporate?",
        snippet:
          "I’m tired of cobbling Venmo + reminders. Looking for a simple way to track what’s paid and what’s late.",
        url: `https://www.reddit.com/search/?q=${enc("lightweight rent collection tool landlord simple")}`,
        why: "They describe a current billing/reminder pain and ask for a simpler tool—not generic landlord chat.",
        reply:
          "Totally get the cobbled-stack fatigue. I built something focused on small portfolios — happy to compare notes if helpful.",
      },
    ];
    return { leads };
  }

  if (v === "saas") {
    const leads: FindLead[] = [
      {
        source: "Reddit",
        title: "What’s the smallest CRM you’d actually use daily?",
        snippet:
          "Everything feels bloated. Small team (4 people) — need follow-ups without admin overhead. Recommendations welcome.",
        url: `https://www.reddit.com/search/?q=${enc("lightweight CRM small team recommend daily use")}`,
        why: "They are asking for a usable product category with constraints—daily use, small team—which is classic buying language.",
        reply:
          "Your post resonated — I’m building around this problem. Happy to share what we’re seeing if useful.",
      },
      {
        source: "Reddit",
        title: "Looking for a simple ops workflow tool",
        snippet:
          "Notion + email isn’t cutting it for handoffs. What do you use for lightweight approvals and status?",
        url: `https://www.reddit.com/search/?q=${enc("simple ops workflow tool what do you use lightweight")}`,
        why: "They ask what others use for a workflow—an active search for a replacement, not a strategy brainstorm.",
        reply:
          "Totally get the ‘too heavy’ problem. I built something focused here — happy to compare notes.",
      },
      {
        source: "Reddit",
        title: "Is there a tool for shared inboxes that doesn’t turn into a ticketing monster?",
        snippet:
          "We’re 6 people. Need something between Gmail labels and Zendesk. Any recommendations?",
        url: `https://www.reddit.com/search/?q=${enc("shared inbox tool small team not zendesk recommend")}`,
        why: "They state team size, what failed, and ask for alternatives—strong solution-shopping intent.",
        reply:
          "If you’re comparing a few tools, I can point you to a one-page walkthrough — no pressure either way.",
      },
    ];
    return { leads };
  }

  const leads: FindLead[] = [
    {
      source: "Reddit",
      title: "What do you use for customer support before you can justify Intercom?",
      snippet:
        "Early SaaS, ~30 paying users. Inbox is chaos. Looking for something simple with shared replies and snippets.",
      url: `https://www.reddit.com/search/?q=${enc("what do you use customer support early SaaS simple tool")}`,
      why: "They are asking for a concrete stack choice tied to a real stage and inbox pain—not ‘how to grow’.",
      reply:
        `Hey — this sounded close to what we’re solving around “${q}”. Happy to share what we use / built if it helps.`,
    },
    {
      source: "Reddit",
      title: "Looking for a tool to turn messy CSVs into a simple internal dashboard",
      snippet:
        "Non-technical team keeps asking for views. I don’t want a BI suite—just something quick and maintainable.",
      url: `https://www.reddit.com/search/?q=${enc("looking for tool CSV internal dashboard simple non technical")}`,
      why: "They describe a recurring internal workflow and ask for a maintainable tool—actionable and product-shaped.",
      reply:
        "If you’re still exploring options, I can answer a few specifics — no pitch deck, just what we learned building something similar.",
    },
    {
      source: "Reddit",
      title: "Recommendations for scheduling interviews across time zones?",
      snippet:
        "Calendly is fine but we need something that handles round-robin + reminders without enterprise pricing.",
      url: `https://www.reddit.com/search/?q=${enc("recommend scheduling tool round robin reminders not enterprise")}`,
      why: "They ask for recommendations with clear constraints (round-robin, reminders, pricing)—classic evaluation intent.",
      reply:
        "Thanks for the constraints — I might have a fit. Want me to share a short note on what we do for scheduling + reminders?",
    },
  ];
  return { leads };
}
