/**
 * Central site configuration.
 *
 * Every theme-level setting lives here — change values in this file to
 * customize the site without touching any component.
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteConfig {
  /** Site name, shown in the header and metadata */
  name: string;
  /** Default <title> for the homepage */
  title: string;
  /** Default meta description */
  description: string;
  /** Absolute production URL (no trailing slash) */
  url: string;
  /** Default locale for Open Graph */
  locale: string;

  author: {
    name: string;
    email: string;
    /** Path to avatar image (in /public) or remote URL */
    avatar: string;
    role: string;
    location: string;
  };

  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    mastodon?: string;
  };

  /** GitHub settings for the contribution graph + header link */
  github: {
    /** Username used for the contribution heatmap (build-time fetch) */
    username: string;
    /** Repository URL used in the header/footer GitHub links */
    repoUrl?: string;
  };

  navigation: NavItem[];

  hero: {
    /** Short one-line introduction under your name */
    tagline: string;
    /** Longer supporting sentence */
    intro: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    /** Small availability badge, e.g. "Available for work" — set to null to hide */
    status: string | null;
  };

  /** Configurable stats — no third-party API required */
  stats: Array<{ label: string; value: string }>;

  /** Skills shown on the homepage and about page, grouped by category */
  skills: Array<{ category: string; items: string[] }>;

  blog: {
    postsPerPage: number;
    /** Include full rendered post HTML in the RSS feed */
    rssFullContent: boolean;
  };

  contact: {
    /** Optional form endpoint (Formspree, Basin, your own API...). null hides the form. */
    formAction: string | null;
  };

  resume: {
    /** Optional downloadable file placed in /public. null hides the download button. */
    pdfFile: string | null;
  };

  footer: {
    /** Short description shown in the footer */
    text: string;
  };

  /** Toggle whole features on/off */
  features: {
    blog: boolean;
    projects: boolean;
    search: boolean;
    githubActivity: boolean;
    newsletter: boolean;
    comments: boolean;
  };
}

export const siteConfig: SiteConfig = {
  name: "Lucas Ault",
  title: "Lucas Ault — Principal Specialist, AI/Cyber Defense at RTX",
  description:
    "Lucas Ault. Dev Ops, security and AI at work. At home, a homelab, photography, too many unfinished projects, and whatever else piques my interest..",
  url: "https://lucas.ault.cc",
  locale: "en_US",

  author: {
    name: "Lucas Ault",
    email: "lucas@lucasault.com",
    avatar: "/images/avatar.jpeg",
    role: "Principal Specialist, AI/Cyber Defense at RTX",
    location: "Greater Los Angeles, CA",
  },

  social: {
    github: "https://github.com/lucas-ault",
    linkedin: "https://www.linkedin.com/in/lucas-ault",
  },

  github: {
    username: "lucas-ault",
    repoUrl: "https://github.com/lucas-ault",
  },

  navigation: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
  ],

  hero: {
    tagline: "Some guy with too many projects and not enough time.",
    intro:
      "I am a CIS graduate from Cal Poly Pomona that loves to tinker with tech. I focus on AI, Cyber Defense, and Dev Ops at my day job - and for some reason, I do the same thing at home. When I am not overcomplicating my home network, I like to ride mountain and gravel bikes, shoot photos, and work on too many projects that I might never fully finish (I am talking about you, shelf of raspberry pis and LoRa radios etc...)",
    primaryCta: { label: "View Projects", href: "/projects" },
    secondaryCta: { label: "Read Blog", href: "/blog" },
    status: null,
  },

  stats: [
    { label: "Years in technology", value: "7+" },
    { label: "Zscaler users", value: "250k" },
    { label: "Enterprise tenants", value: "4" },
    { label: "Certifications", value: "7" },
  ],

  skills: [
    {
      category: "AI & ML",
      items: [
        "Generative AI",
        "RAG",
        "Agentic Workflows",
        "Multi-Agent Systems",
        "MLOps",
        "Model Evaluation",
        "Prompt Engineering",
        "Vectorless RAG",
      ],
    },
    {
      category: "Zero Trust & SASE",
      items: [
        "Zscaler ZIA",
        "Zscaler ZPA",
        "Zscaler ZDX",
        "PAC Policy",
        "Secure Web Gateway",
      ],
    },
    {
      category: "Cloud & DevOps",
      items: ["Kubernetes", "Docker", "Helm", "FluxCD", "GitLab CI/CD", "GHCR"],
    },
    { category: "Languages", items: ["Python", "JavaScript", "YAML"] },
    {
      category: "Infrastructure",
      items: ["Proxmox", "ESXi", "K3s", "Networking", "DNS", "VPNs"],
    },
    {
      category: "Homelab Stack",
      items: [
        "Home Assistant",
        "TrueNAS",
        "Immich",
        "Tailscale",
        "Self-hosted AI inference",
      ],
    },
  ],

  blog: {
    postsPerPage: 10,
    rssFullContent: true,
  },

  contact: {
    formAction: null,
  },

  resume: {
    pdfFile: "/resume.pdf",
  },

  footer: {
    text: "Notes on security, AI, and the homelab.",
  },

  features: {
    blog: true,
    projects: true,
    search: true,
    githubActivity: true,
    newsletter: false,
    comments: false,
  },
};
