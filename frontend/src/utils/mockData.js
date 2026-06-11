/**
 * Mock data for demo mode.
 * All 15 candidates are pre-parsed as if the CV parser API ran on them.
 */

export const DEMO_JD_TEXT = `Senior Full Stack Engineer — Nexus Pay

About Nexus Pay:
Nexus Pay is a Series B fintech startup ($45M raised) building real-time cross-border payment infrastructure for SMBs in emerging markets. We're a remote-first team of 80 across 12 countries, and we move fast.

Role Overview:
We're looking for a Senior Full Stack Engineer to own critical payment flow features end-to-end — from the React UI that merchants interact with daily to the Node.js services processing millions of transactions. You'll work closely with our product and ML teams and have significant architectural influence.

Required Skills:
- React (hooks, context, performance optimization) — 4+ years
- Node.js (Express or Fastify, REST + GraphQL) — 4+ years
- PostgreSQL (schema design, query optimization, indexing)
- Git, CI/CD, code review culture
- Strong system design fundamentals (distributed systems, event-driven architecture)
- 5+ years total software engineering experience

Nice to Have:
- TypeScript (strong preference)
- AWS (Lambda, SQS, RDS, CloudFront)
- Redis (caching, pub/sub)
- Experience in fintech, payments, or regulated industries
- Kafka or other message queue experience

What You'll Do:
- Own features from design doc to production monitoring
- Design and implement APIs consumed by our mobile apps and partner integrations
- Collaborate with our ML team on real-time fraud detection pipeline integration
- Mentor 2-3 mid-level engineers
- Participate in on-call rotation (low volume, good escalation paths)

What We Offer:
- $140,000–$175,000 USD + equity
- Fully remote, async-first culture
- 35 days PTO, home office stipend, learning budget
- Strong focus on shipping — no unnecessary meetings

We value diverse backgrounds. Fintech experience is helpful but not required — we care more about engineering craft and curiosity.`;

export const DEMO_CANDIDATES = [
  // 1. Perfect match — senior, all skills
  {
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    phone: "+1-415-555-0192",
    location: "San Francisco, CA",
    totalYearsExperience: 7,
    currentRole: "Senior Full Stack Engineer",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "AWS", "Redis", "GraphQL", "Kafka", "Docker", "Kubernetes"],
    education: [{ degree: "B.S. Computer Science", institution: "UC Berkeley", year: 2017 }],
    workHistory: [
      { role: "Senior Full Stack Engineer", company: "Stripe", years: 4, highlights: ["Led React performance overhaul reducing P95 load time by 62%", "Designed Node.js payment webhook system handling 2M events/day", "Owned PostgreSQL schema migrations for 500GB production database"] },
      { role: "Full Stack Engineer", company: "Square", years: 3, highlights: ["Built merchant dashboard in React serving 300K+ daily active users", "Implemented TypeScript migration across 80K LOC codebase"] }
    ],
    careerTrajectory: "ascending",
    nonTraditionalBackground: false,
    nonTraditionalReason: ""
  },

  // 2. Strong match — missing TypeScript
  {
    name: "Marcus Johnson",
    email: "marcus.j@protonmail.com",
    phone: "+1-312-555-0847",
    location: "Chicago, IL",
    totalYearsExperience: 5,
    currentRole: "Full Stack Engineer",
    skills: ["React", "Node.js", "PostgreSQL", "GraphQL", "Docker", "Jenkins", "MongoDB"],
    education: [{ degree: "B.S. Software Engineering", institution: "University of Illinois", year: 2019 }],
    workHistory: [
      { role: "Full Stack Engineer", company: "Braintree", years: 3, highlights: ["Developed React merchant onboarding flow processing $50M+ daily volume", "Built Node.js/Express APIs for payment method tokenization", "Optimized PostgreSQL queries — reduced dashboard load by 45%"] },
      { role: "Junior Developer", company: "Groupon", years: 2, highlights: ["React component library contributing to 20+ product teams"] }
    ],
    careerTrajectory: "ascending",
    nonTraditionalBackground: false,
    nonTraditionalReason: ""
  },

  // 3. Overqualified — 12 years, wants staff
  {
    name: "Dr. Priya Nair",
    email: "priya.nair@techcorp.io",
    phone: "+1-650-555-0334",
    location: "Palo Alto, CA",
    totalYearsExperience: 12,
    currentRole: "Staff Engineer",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "AWS", "Redis", "Kafka", "gRPC", "Terraform", "System Design", "Technical Leadership"],
    education: [
      { degree: "Ph.D. Distributed Systems", institution: "Stanford University", year: 2014 },
      { degree: "B.Tech Computer Science", institution: "IIT Bombay", year: 2010 }
    ],
    workHistory: [
      { role: "Staff Engineer", company: "Google Pay", years: 5, highlights: ["Architected real-time settlement system processing $8B annually", "Led team of 12 engineers across 3 time zones"] },
      { role: "Senior Engineer", company: "Plaid", years: 4, highlights: ["Designed bank connection infrastructure serving 5,000 fintech apps", "Built TypeScript SDK with 2M+ weekly downloads"] },
      { role: "Engineer", company: "PayPal", years: 3, highlights: ["Full stack development on merchant checkout flow"] }
    ],
    careerTrajectory: "ascending",
    nonTraditionalBackground: false,
    nonTraditionalReason: ""
  },

  // 4. Career changer — 3yr coding, 6yr fintech ops
  {
    name: "David Okonkwo",
    email: "d.okonkwo@gmail.com",
    phone: "+1-929-555-0615",
    location: "New York, NY",
    totalYearsExperience: 9,
    currentRole: "Software Engineer",
    skills: ["React", "Node.js", "Python", "PostgreSQL", "SQL", "REST APIs", "Tableau", "Excel VBA"],
    education: [
      { degree: "B.Sc. Finance", institution: "Howard University", year: 2015 },
      { degree: "Full Stack Certificate", institution: "Flatiron School", year: 2020 }
    ],
    workHistory: [
      { role: "Software Engineer", company: "Remitly", years: 3, highlights: ["Built React dashboard for compliance team — first engineering role", "Developed Node.js microservice for FX rate aggregation", "PostgreSQL reporting queries for regulatory filings"] },
      { role: "Senior Operations Analyst", company: "Western Union", years: 4, highlights: ["Managed cross-border transfer compliance for $2B corridor", "Automated reporting with Excel VBA saving 30 hours/week"] },
      { role: "Analyst", company: "JPMorgan", years: 2, highlights: ["FX settlements desk, deep knowledge of SWIFT and correspondent banking"] }
    ],
    careerTrajectory: "ascending",
    nonTraditionalBackground: true,
    nonTraditionalReason: "6 years in fintech operations/compliance before transitioning to software engineering"
  },

  // 5. Bootcamp grad — 2yr exp, strong portfolio
  {
    name: "Zoe Martinez",
    email: "zoe.builds@gmail.com",
    phone: "+1-305-555-0273",
    location: "Miami, FL",
    totalYearsExperience: 2,
    currentRole: "Frontend Developer",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "GraphQL", "Tailwind CSS", "Prisma", "Next.js"],
    education: [
      { degree: "Full Stack Development Bootcamp", institution: "App Academy", year: 2022 },
      { degree: "B.A. Graphic Design", institution: "Florida International University", year: 2019 }
    ],
    workHistory: [
      { role: "Frontend Developer", company: "Checkout.com", years: 2, highlights: ["React payment UI components used by 200+ enterprise clients", "TypeScript migration of legacy checkout flow (15K LOC)", "Built internal Node.js tooling for QA automation"] }
    ],
    careerTrajectory: "ascending",
    nonTraditionalBackground: true,
    nonTraditionalReason: "Transitioned from design to engineering via bootcamp — 2 years professional experience"
  },

  // 6. Keyword-stuffed — thin descriptions
  {
    name: "Ryan Foster",
    email: "ryanfoster.dev@outlook.com",
    phone: "+1-614-555-0891",
    location: "Columbus, OH",
    totalYearsExperience: 6,
    currentRole: "Full Stack Developer",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "AWS", "Redis", "Kafka", "Docker", "Kubernetes", "GraphQL", "MongoDB", "Python", "Java", "Go"],
    education: [{ degree: "B.S. Information Technology", institution: "Ohio State University", year: 2018 }],
    workHistory: [
      { role: "Full Stack Developer", company: "Accenture", years: 4, highlights: ["Used React and Node.js on various client projects", "Worked with PostgreSQL databases", "AWS deployments"] },
      { role: "Developer", company: "Infosys", years: 2, highlights: ["Full stack development", "Agile methodology", "REST APIs"] }
    ],
    careerTrajectory: "lateral",
    nonTraditionalBackground: false,
    nonTraditionalReason: ""
  },

  // 7. Senior backend, weak frontend
  {
    name: "Aleksei Volkov",
    email: "a.volkov@techmail.ru",
    phone: "+7-495-555-0449",
    location: "Berlin, Germany",
    totalYearsExperience: 8,
    currentRole: "Backend Engineer",
    skills: ["Node.js", "PostgreSQL", "TypeScript", "Redis", "Kafka", "Docker", "gRPC", "AWS", "Go", "Python"],
    education: [{ degree: "M.S. Computer Science", institution: "Moscow State University", year: 2016 }],
    workHistory: [
      { role: "Senior Backend Engineer", company: "N26", years: 5, highlights: ["Node.js microservices handling 50M transactions/month", "PostgreSQL performance: reduced p99 query time from 800ms to 12ms", "Kafka event streaming pipeline for real-time notifications"] },
      { role: "Backend Engineer", company: "Klarna", years: 3, highlights: ["Payment risk scoring service in TypeScript", "Redis caching layer reducing DB load by 70%"] }
    ],
    careerTrajectory: "ascending",
    nonTraditionalBackground: false,
    nonTraditionalReason: ""
  },

  // 8. Recent CS grad — strong education, internships only
  {
    name: "Aisha Thompson",
    email: "aisha.t@mit.edu",
    phone: "+1-617-555-0156",
    location: "Boston, MA",
    totalYearsExperience: 1,
    currentRole: "Software Engineer",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Python", "AWS", "GraphQL"],
    education: [
      { degree: "M.Eng. Electrical Engineering & CS", institution: "MIT", year: 2025 },
      { degree: "B.S. Computer Science", institution: "MIT", year: 2024 }
    ],
    workHistory: [
      { role: "Software Engineer", company: "Ripple", years: 1, highlights: ["First fulltime role — React dashboard for XRP Ledger analytics", "Node.js API for blockchain transaction monitoring"] },
      { role: "SWE Intern", company: "Coinbase", years: 0.5, highlights: ["React UI improvements for trading interface"] },
      { role: "Research Intern", company: "MIT CSAIL", years: 1, highlights: ["Distributed systems research — 2 published papers"] }
    ],
    careerTrajectory: "early-career",
    nonTraditionalBackground: false,
    nonTraditionalReason: ""
  },

  // 9. Strong frontend, minimal backend
  {
    name: "Lena Schmidt",
    email: "lena.schmidt@frontend.io",
    phone: "+49-30-555-0782",
    location: "Munich, Germany",
    totalYearsExperience: 6,
    currentRole: "Senior Frontend Engineer",
    skills: ["React", "TypeScript", "Next.js", "CSS/SASS", "GraphQL", "Testing Library", "Storybook", "Webpack", "Performance"],
    education: [{ degree: "B.Sc. Media Informatics", institution: "TU Munich", year: 2018 }],
    workHistory: [
      { role: "Senior Frontend Engineer", company: "Trade Republic", years: 4, highlights: ["Led React migration of monolithic trading UI to micro-frontends", "Performance optimization — Core Web Vitals green across all metrics", "Mentored 4 junior engineers on React patterns"] },
      { role: "Frontend Developer", company: "Celonis", years: 2, highlights: ["TypeScript component library with 98% test coverage"] }
    ],
    careerTrajectory: "ascending",
    nonTraditionalBackground: false,
    nonTraditionalReason: ""
  },

  // 10. International — equal skills, non-Western name/location
  {
    name: "Rajesh Krishnamurthy",
    email: "rajesh.k@wipro.com",
    phone: "+91-80-555-0334",
    location: "Bangalore, India",
    totalYearsExperience: 6,
    currentRole: "Senior Software Engineer",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "AWS", "Redis", "Docker", "GraphQL", "Jest", "CI/CD"],
    education: [{ degree: "B.E. Computer Science", institution: "NIT Trichy", year: 2018 }],
    workHistory: [
      { role: "Senior Software Engineer", company: "Razorpay", years: 4, highlights: ["React dashboard for 500K+ merchant accounts", "Node.js payment orchestration layer — 99.99% uptime SLA", "PostgreSQL sharding strategy for 10x data growth"] },
      { role: "Software Engineer", company: "Freshworks", years: 2, highlights: ["Full stack features for CRM product — TypeScript + React"] }
    ],
    careerTrajectory: "ascending",
    nonTraditionalBackground: false,
    nonTraditionalReason: ""
  },

  // 11. Employment gap — 2yr break, returned strong
  {
    name: "Emma Larsson",
    email: "emma.larsson@gmail.com",
    phone: "+46-70-555-0223",
    location: "Stockholm, Sweden",
    totalYearsExperience: 7,
    currentRole: "Full Stack Engineer",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "AWS", "GraphQL", "Redis"],
    education: [{ degree: "M.Sc. Software Engineering", institution: "KTH Royal Institute of Technology", year: 2016 }],
    workHistory: [
      { role: "Full Stack Engineer", company: "Klarna", years: 2, highlights: ["React checkout experience — A/B tested improvements lifted conversion 12%", "Node.js API gateway serving 8M daily requests", "TypeScript rewrite of payment flow services"] },
      { role: "Career Break", company: "—", years: 2, highlights: ["Primary caregiver — parental leave and family relocation"] },
      { role: "Senior Engineer", company: "iZettle (acquired by PayPal)", years: 3, highlights: ["Full stack payment terminal software — React + Node.js", "PostgreSQL database design for point-of-sale analytics"] }
    ],
    careerTrajectory: "ascending",
    nonTraditionalBackground: true,
    nonTraditionalReason: "2-year intentional career break for family caregiving — strong re-entry at Klarna"
  },

  // 12. Job hopper — many companies, short tenures
  {
    name: "Kevin Park",
    email: "kevin.park.dev@gmail.com",
    phone: "+1-206-555-0567",
    location: "Seattle, WA",
    totalYearsExperience: 7,
    currentRole: "Software Engineer",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "MongoDB", "AWS", "Docker"],
    education: [{ degree: "B.S. Computer Science", institution: "University of Washington", year: 2017 }],
    workHistory: [
      { role: "Software Engineer", company: "Robinhood", years: 1, highlights: ["React trading UI components"] },
      { role: "Engineer", company: "Cash App", years: 1, highlights: ["Node.js microservices for peer-to-peer payments"] },
      { role: "Full Stack Engineer", company: "Mercury", years: 1.5, highlights: ["PostgreSQL schema design for business banking", "React dashboard for financial analytics"] },
      { role: "Developer", company: "Chime", years: 1, highlights: ["TypeScript API development"] },
      { role: "Frontend Engineer", company: "Venmo", years: 1.5, highlights: ["React mobile web features"] },
      { role: "Junior Developer", company: "Accenture", years: 1, highlights: ["Various fintech client projects"] }
    ],
    careerTrajectory: "lateral",
    nonTraditionalBackground: false,
    nonTraditionalReason: ""
  },

  // 13. Engineering + MBA
  {
    name: "Amara Diallo",
    email: "amara.diallo@hbs.edu",
    phone: "+1-212-555-0891",
    location: "New York, NY",
    totalYearsExperience: 8,
    currentRole: "Engineering Manager",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "AWS", "System Design", "Technical Leadership", "Product Strategy", "SQL"],
    education: [
      { degree: "MBA", institution: "Harvard Business School", year: 2021 },
      { degree: "B.S. Computer Engineering", institution: "Cornell University", year: 2015 }
    ],
    workHistory: [
      { role: "Engineering Manager", company: "Affirm", years: 3, highlights: ["Led 8-person full stack team — React + Node.js payment products", "Maintained technical contributions: 30% IC, 70% management"] },
      { role: "Senior Software Engineer", company: "Affirm", years: 2, highlights: ["Full stack development on loan origination platform", "TypeScript migration across checkout SDK"] },
      { role: "Software Engineer", company: "Goldman Sachs (Marcus)", years: 3, highlights: ["Consumer banking app — React Native + Node.js", "PostgreSQL data modeling for personal loan products"] }
    ],
    careerTrajectory: "ascending",
    nonTraditionalBackground: false,
    nonTraditionalReason: ""
  },

  // 14. Solid mid-level — no standout traits
  {
    name: "James O'Brien",
    email: "james.obrien@gmail.com",
    phone: "+353-1-555-0445",
    location: "Dublin, Ireland",
    totalYearsExperience: 4,
    currentRole: "Full Stack Developer",
    skills: ["React", "Node.js", "PostgreSQL", "AWS", "Docker", "REST APIs", "Git"],
    education: [{ degree: "B.Sc. Computer Science", institution: "University College Dublin", year: 2020 }],
    workHistory: [
      { role: "Full Stack Developer", company: "Wayflyer", years: 3, highlights: ["React merchant portal — standard CRUD features", "Node.js APIs for revenue-based financing product", "PostgreSQL queries for financial reporting"] },
      { role: "Junior Developer", company: "Accenture Ireland", years: 1, highlights: ["Full stack support on various projects"] }
    ],
    careerTrajectory: "ascending",
    nonTraditionalBackground: false,
    nonTraditionalReason: ""
  },

  // 15. Near miss — missing one critical must-have (PostgreSQL)
  {
    name: "Isabela Rocha",
    email: "isabela.rocha@dev.br",
    phone: "+55-11-555-0673",
    location: "São Paulo, Brazil",
    totalYearsExperience: 5,
    currentRole: "Senior Full Stack Engineer",
    skills: ["React", "Node.js", "TypeScript", "MongoDB", "DynamoDB", "AWS", "Redis", "GraphQL", "Docker"],
    education: [{ degree: "B.Sc. Systems Information", institution: "USP (University of São Paulo)", year: 2019 }],
    workHistory: [
      { role: "Senior Full Stack Engineer", company: "Nubank", years: 4, highlights: ["React customer-facing financial product UI — 80M+ users", "Node.js/TypeScript API layer for credit card features", "MongoDB + DynamoDB — PostgreSQL experience limited"] },
      { role: "Full Stack Developer", company: "PagSeguro", years: 1, highlights: ["React checkout components", "Node.js payment gateway integration"] }
    ],
    careerTrajectory: "ascending",
    nonTraditionalBackground: false,
    nonTraditionalReason: ""
  },
];
