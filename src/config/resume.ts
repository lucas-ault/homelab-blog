/**
 * Structured career data for the About page.
 */

export interface ExperienceItem {
  company: string;
  position: string;
  start: string;
  end: string | null;
  location: string;
  mode?: "Remote" | "On-Site" | "Hybrid";
  description: string;
  technologies: string[];
  /** Shows a pulsing "current" badge next to the entry */
  current?: boolean;
}

export interface EducationItem {
  institution: string;
  degree: string;
  start: string;
  end: string;
  description?: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  /** Issue date label, e.g. "Jan 2023" */
  issuedDate?: string;
  /** Expiration date label; omit when the cert does not expire */
  expirationDate?: string;
  /** Path to issuer logo in /public, e.g. "/images/certs/zscaler.svg" */
  logo?: string;
  /** Credential ID shown on the card */
  credentialId?: string;
  /** Public verification URL */
  url?: string;
}

export const experience: ExperienceItem[] = [
  {
    company: "RTX",
    position: "Principal Specialist, AI/Cyber Defense",
    start: "Sept 2026",
    end: null,
    location: "Greater Los Angeles, CA",
    mode: "Remote",
    current: true,
    description:
      "Research, design, and operationalize enterprise AI solutions spanning generative AI, RAG, conversational AI, autonomous/agentic workflows, and multi-agent systems. Architect AI applications that combine foundation models with enterprise data, retrieval, APIs, tools, and deterministic application logic to support complex technical workflows and decision-making. Develop advanced retrieval architectures including vectorless RAG, iterative retrieval, query refinement, reranking, and evidence selection. Design agent workflows capable of planning, retrieving information, invoking tools, evaluating intermediate results, and iterating toward a validated outcome. Build production AI infrastructure and MLOps processes — automated evaluation, model and prompt versioning, deployment, monitoring, and rollback. Continue supporting cybersecurity and automation initiatives, applying AI to improve operational workflows and engineering efficiency.",
    technologies: [
      "Generative AI",
      "RAG",
      "Agentic Workflows",
      "MLOps",
      "Python",
      "CI/CD",
      "Model Evaluation",
      "Production AI Infrastructure",
    ],
  },
  {
    company: "RTX",
    position: "Senior Analyst, Cyber Defense",
    start: "Oct 2022",
    end: "Sept 2026",
    location: "Greater Los Angeles, CA",
    mode: "Remote",
    description:
      "Engineered and supported enterprise Zscaler services (ZIA, ZDX, Client Connector) for approximately 250,000 global users as part of a six-person team in a 24x7 production environment. Owned secure web gateway and PAC policy, connectivity troubleshooting, incident response, user-impact analysis, and service reliability. Developed a CI/CD platform for ZIA PAC management across four enterprise tenants using GitLab, Python, YAML, and JavaScript, automating validation, peer review, deployment, and rollback to reduce configuration risk. Led the U.S. deployment of Zscaler Digital Experience (ZDX), coordinating security-control and ATO alignment, approvals, rollout planning, and stakeholder presentations. Authored engineering procedures, troubleshooting runbooks, and operational directives; cross-trained audiences of 150+ on secure web gateway technologies, architecture, disaster recovery, and DevOps practices.",
    technologies: [
      "Zscaler ZIA",
      "Zscaler ZDX",
      "Zscaler Client Connector",
      "PAC Policy",
      "Python",
      "GitLab CI/CD",
      "YAML",
      "JavaScript",
    ],
  },
  {
    company: "Tucson Roadrunners",
    position: "Game and Event Photographer",
    start: "Jul 2023",
    end: "May 2024",
    location: "Tucson, AZ",
    mode: "On-Site",
    description:
      "Captured in-game photography (players, fans, attendees, mascots, and staff) and provided coverage of events outside the Tucson Arena attended by the team for charitable and community purposes.",
    technologies: ["Sports Photography", "Event Coverage"],
  },
  {
    company: "Sprocket.Dog",
    position: "Founder and Owner",
    start: "Jan 2021",
    end: "Dec 2023",
    location: "La Verne, CA",
    description:
      "Founded and operated Sprocket.Dog LLC, a mountain-focused cycling apparel company. Managed product design, e-commerce operations, marketing, and fulfillment.",
    technologies: ["E-Commerce", "Product Design", "Apparel"],
  },
  {
    company: "Specialized Bicycle Components / Incycle Bicycles",
    position: "IT Systems Administrator & Digital Operations",
    start: "May 2019",
    end: "Oct 2022",
    location: "San Dimas, CA",
    mode: "On-Site",
    description:
      "Overseen and maintained company-wide IT systems including servers, point-of-sale systems, and network hardware across five retail locations and one warehouse. Managed the development of e-commerce procedures and platforms, ensuring efficiency and customer satisfaction throughout the order process. Administered IT and network security infrastructure including firewalls, VPNs, endpoint security, and network segmentation. Managed a team of three data entry, marketing, and e-commerce support specialists to build and develop the online catalog and presence.",
    technologies: [
      "Firewalls",
      "VPN",
      "Endpoint Security",
      "Network Segmentation",
      "POS Systems",
      "E-Commerce",
      "Team Management",
    ],
  },
];

export const education: EducationItem[] = [
  {
    institution: "California State Polytechnic University, Pomona",
    degree:
      "Bachelor's, Computer and Information Systems Security / Information Assurance",
    start: "2018",
    end: "Dec 2021",
    description: "Emphasis on cybersecurity and forensics.",
  },
];

export const certifications: CertificationItem[] = [
  {
    name: "Amazon Web Services Cloud Practitioner",
    issuer: "Amazon Web Services (AWS)",
    logo: "/images/certs/aws.jpeg",
    issuedDate: "November 2025",
    expirationDate: "November 2028",
  },
  {
    name: "CompTIA Security+",
    issuer: "CompTIA",
    logo: "/images/certs/comptia.jpeg",
    issuedDate: "May 2024",
    expirationDate: "May 2027",
  },
  {
    name: "Zscaler Certified Cloud Administrator - Private Access",
    issuer: "Zscaler",
    logo: "/images/certs/zscaler.jpeg",
    issuedDate: "November 2022",
    expirationDate: "November 2024",
  },
  {
    name: "Zscaler Certified Cloud Administrator - Security Specialist",
    issuer: "Zscaler",
    logo: "/images/certs/zscaler.jpeg",
    issuedDate: "October 2022",
    expirationDate: "October 2024",
  },
  {
    name: "Zscaler Certified Cloud Administrator - Zscaler Digital Experience",
    issuer: "Zscaler",
    logo: "/images/certs/zscaler.jpeg",
    issuedDate: "October 2022",
    expirationDate: "October 2024",
  },
  {
    name: "Zscaler Certified Cloud Administrator - Internet Access",
    issuer: "Zscaler",
    logo: "/images/certs/zscaler.jpeg",
    issuedDate: "October 2022",
    expirationDate: "October 2024",
  },
  {
    name: "DevNet Associate",
    issuer: "Cisco",
    logo: "/images/certs/cisco.jpeg",
    issuedDate: "December 2021",
  },
];

export const philosophy = `
Security is a delivery problem. The best defense is the one your team can
operate at 3 a.m. without a hero — so I design for automation: CI/CD pipelines
with validation and rollback make policy changes safe, and boring, documented
infrastructure beats clever setups that only one person understands.

I default to Zero Trust: verify every identity, every connection, every time.
Now I'm applying the same engineering rigor to AI — grounded retrieval,
observable agent behavior, and evaluation pipelines that catch regressions
before users do. The goal is the same: systems you can trust in production.

And I keep a homelab because the best way to learn is to break something
real, observe the failure, and write it down so the next breakage is cheaper.
`;
