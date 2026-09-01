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
    docs: boolean;
    search: boolean;
    githubActivity: boolean;
    newsletter: boolean;
    comments: boolean;
  };
}

export const siteConfig: SiteConfig = {
  name: 'Lucas Ault',
  title: 'Lucas Ault — Senior Cybersecurity Engineer',
  description:
    'Senior cybersecurity engineer driving secure access modernization with Zero Trust and automation. Writing about SASE, Zscaler, DevSecOps, and homelab experiments.',
  url: 'https://lucasault.com',
  locale: 'en_US',

  author: {
    name: 'Lucas Ault',
    email: 'lucas@lucasault.com',
    avatar: '/images/avatar.svg',
    role: 'Senior Cybersecurity Engineer',
    location: 'La Verne, CA',
  },

  social: {
    github: 'https://github.com/lucas-ault',
    linkedin: 'https://www.linkedin.com/in/lucas-ault',
  },

  github: {
    username: 'lucas-ault',
    repoUrl: 'https://github.com/lucas-ault',
  },

  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Projects', href: '/projects' },
    { label: 'Docs', href: '/docs' },
    { label: 'About', href: '/about' },
  ],

  hero: {
    tagline: 'Zero Trust architect by day, homelab operator by night.',
    intro:
      'I secure enterprise environments at scale — 4 years engineering Zscaler for 250,000 global users in 24x7 production — and automate the boring parts with CI/CD so changes ship safely.',
    primaryCta: { label: 'View Projects', href: '/projects' },
    secondaryCta: { label: 'Read Blog', href: '/blog' },
    status: null,
  },

  stats: [
    { label: 'Years in cybersecurity', value: '7+' },
    { label: 'Users secured', value: '250k' },
    { label: 'Enterprise tenants', value: '4' },
    { label: 'Certifications', value: '7' },
  ],

  skills: [
    {
      category: 'Zero Trust & SASE',
      items: ['Zscaler ZIA', 'Zscaler ZPA', 'Zscaler ZDX', 'PAC Policy', 'Secure Web Gateway'],
    },
    {
      category: 'Cloud & DevOps',
      items: ['Kubernetes', 'Docker', 'Helm', 'FluxCD', 'GitLab CI/CD', 'GHCR'],
    },
    { category: 'Languages', items: ['Python', 'JavaScript', 'YAML'] },
    {
      category: 'Infrastructure',
      items: ['Proxmox', 'ESXi', 'K3s', 'Networking', 'DNS', 'VPNs'],
    },
    {
      category: 'Homelab Stack',
      items: ['Home Assistant', 'TrueNAS', 'Immich', 'Tailscale', 'Self-hosted AI inference'],
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
    pdfFile: '/resume.pdf',
  },

  footer: {
    text: 'Cybersecurity engineering, Zero Trust architecture, and homelab experiments. Built with Astro.',
  },

  features: {
    blog: true,
    projects: true,
    docs: true,
    search: true,
    githubActivity: true,
    newsletter: false,
    comments: false,
  },
};
