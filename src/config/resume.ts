/**
 * Structured career data shared by the About and Resume pages.
 */

export interface ExperienceItem {
  company: string;
  position: string;
  start: string;
  end: string | null;
  location: string;
  mode?: 'Remote' | 'On-Site' | 'Hybrid';
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
  year: string;
  url?: string;
}

export const experience: ExperienceItem[] = [
  {
    company: 'Raytheon Technologies',
    position: 'Senior Analyst, Cyber Defense',
    start: 'Oct 2022',
    end: null,
    location: 'Remote, CA',
    mode: 'Remote',
    current: true,
    description:
      'Engineer and support enterprise Zscaler services (ZIA, ZDX, Client Connector) for 250,000 global users as part of a six-person team, owning PAC policy, connectivity troubleshooting, incident response, and user-impact analysis in a 24x7 production environment. Developed a CI/CD platform for ZIA PAC management across four enterprise tenants, automating validation, peer review, deployment, and rollback workflows to reduce configuration errors and enable safer change processes. Led the U.S. deployment of Zscaler Digital Experience (ZDX), coordinating security-control and ATO alignment, approvals, and stakeholder presentations. Automate repetitive security workflows using Python, GitLab CI/CD, and AI tools, author engineering procedures and runbooks, and cross-train audiences of 150+ on secure web gateway fundamentals, architecture, and disaster recovery.',
    technologies: ['Zscaler ZIA', 'Zscaler ZDX', 'Zscaler Client Connector', 'PAC Policy', 'Python', 'GitLab CI/CD', 'YAML', 'JavaScript'],
  },
  {
    company: 'Bolt Box AI',
    position: 'Technical Consultant',
    start: 'Nov 2025',
    end: null,
    location: 'Remote, CA',
    mode: 'Remote',
    current: true,
    description:
      'Architect a multi-tenant AI communications platform focused on security, tenant isolation, and reliability, translating business requirements into cloud-native infrastructure and operational designs. Designed a cloud-native architecture for eight production services using Kubernetes, PostgreSQL, Redis, Next.js, Node.js, FastAPI, Twilio, and AI model APIs, implementing role-based access control, API authentication, and data encryption to secure multi-tenant environments. Implement GitOps and CI/CD practices using FluxCD, Helm, GHCR, encrypted configuration management, structured validation, and distinct development and production release workflows.',
    technologies: ['Kubernetes', 'PostgreSQL', 'Redis', 'Next.js', 'Node.js', 'FastAPI', 'Twilio', 'FluxCD', 'Helm', 'GHCR'],
  },
  {
    company: 'Specialized Bicycle Components / Incycle Bicycles',
    position: 'Assistant, Digital Operations & IT Systems Administrator',
    start: 'May 2019',
    end: 'Oct 2022',
    location: 'Pomona & San Dimas, CA',
    mode: 'On-Site',
    description:
      'Implemented integrations between internal and vendor systems to improve product data consistency and reduce manual workflows across retail and warehouse environments. Administered IT and network security infrastructure across multiple retail locations, including firewalls, VPNs, endpoint security, and network segmentation, and delivered cross-functional projects to harden POS systems and secure remote access. Managed a team of three data entry, marketing, and e-commerce support specialists to build and develop Incycle\u2019s online catalog and presence.',
    technologies: ['Firewalls', 'VPN', 'Endpoint Security', 'Network Segmentation', 'POS Hardening', 'Integrations'],
  },
];

export const education: EducationItem[] = [
  {
    institution: 'California State Polytechnic University, Pomona',
    degree: 'Bachelor of Science, Computer Information Systems',
    start: '2018',
    end: 'Dec 2021',
    description: 'Emphasis on cybersecurity and forensics.',
  },
];

export const certifications: CertificationItem[] = [
  {
    name: 'Zscaler ZCCA — Private Access',
    issuer: 'Zscaler',
    year: '',
  },
  {
    name: 'Zscaler ZCCA — Internet Access',
    issuer: 'Zscaler',
    year: '',
  },
  {
    name: 'Zscaler ZCCA — Security Specialist',
    issuer: 'Zscaler',
    year: '',
  },
  {
    name: 'Zscaler ZCCA — Zscaler Digital Experience',
    issuer: 'Zscaler',
    year: '',
  },
  {
    name: 'CompTIA Security+',
    issuer: 'CompTIA',
    year: '',
  },
  {
    name: 'AWS Cloud Practitioner',
    issuer: 'Amazon Web Services',
    year: '',
  },
  {
    name: 'Cisco DevNet Associate',
    issuer: 'Cisco',
    year: '',
  },
];

export const philosophy = `
Security is a delivery problem. The best defense is the one your team can
operate at 3 a.m. without a hero — so I design for automation: CI/CD pipelines
with validation and rollback make policy changes safe, and boring, documented
infrastructure beats clever setups that only one person understands.

I default to Zero Trust: verify every identity, every connection, every time.
And I keep a homelab because the best way to learn is to break something
real, observe the failure, and write it down so the next breakage is cheaper.
`;
