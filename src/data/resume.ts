// Structured portfolio content, sourced from public/resume/Atul_Goel_Resume_final.pdf
// Copy is written for a general (non-developer) audience first.

export const profile = {
  name: 'Atul Goel',
  tagline: 'I build games, fintech products, and the teams behind them.',
  location: 'India',
  email: 'atul.goel.126@gmail.com',
  links: {
    github: 'https://github.com/atulgoel126',
    linkedin: 'https://www.linkedin.com/in/atulgoel126',
  },
  resumePdf: '/resume/Atul_Goel_Resume_final.pdf',
  about: [
    "Hi, I'm Atul. I've spent 8 years building things people actually touch — mobile games played by millions, a fintech app that went from whiteboard to launch in five months, and the engineering teams behind them.",
    "I started in games and AR/VR, studied entertainment technology at Carnegie Mellon, shipped story games in Mountain View, then led the tech team at a fintech startup in India. These days I'm co-founding something new.",
    'This room is my corner of the internet. Everything in it is clickable — poke around.',
  ],
  quickFacts: [
    '8 years across games, fintech & cloud',
    'Led teams of engineers as tech lead',
    'Took ZeroPe from zero to launch in 5 months',
    'CMU Entertainment Technology grad',
  ],
};

export interface Role {
  company: string;
  title: string;
  location?: string;
  period: string;
  summary?: string;
  highlights: string[];
}

export const roles: Role[] = [
  {
    company: 'Stealth Startup',
    title: 'Co-Founder',
    location: 'India',
    period: 'Jul 2024 — present',
    summary:
      'Embracing the chaos of a startup — tinkering, pivoting, and figuring things out as we build.',
    highlights: [],
  },
  {
    company: 'Third Unicorn',
    title: 'Technical Lead',
    location: 'Chandigarh, India',
    period: 'Jul 2023 — May 2024',
    highlights: [
      'Built and launched ZeroPe, a fintech app, from a blank page to market in 5 months — 2 months of planning and partnerships, 3 months of focused building.',
      'The result grew ~30% month over month while an optimized architecture cut server costs by 60%.',
      'Joined to fix severe peak-time scaling problems on Crickpe, a real-money gaming platform — then grew into leading the entire tech team.',
      'Introduced the habits of a healthy team: SCRUM, CI/CD pipelines, monitoring (ELK, SonarQube), and standardized code reviews.',
    ],
  },
  {
    company: 'Pixelberry Studios',
    title: 'Senior Software Engineer',
    location: 'Mountain View, CA',
    period: 'Jan 2020 — Jul 2023',
    highlights: [
      'Made game builds 30–70% faster and supported hundreds of simultaneous jobs by rebuilding the CI/CD infrastructure on AWS.',
      "Built a serverless pipeline that turns artists' Photoshop files into game-ready assets automatically.",
      'Co-designed the sign-in system (AWS Cognito) used by millions of players.',
      'Led the Automation & Tools team and created "Pixelberry PhD", the studio\'s onboarding program for new developers.',
    ],
  },
  {
    company: 'Big Huge Games',
    title: 'Associate Software Engineer',
    period: 'Jan 2019 — Dec 2019',
    highlights: [
      'Cut feature-testing time in half by redesigning the internal admin tool — and eliminated QA data-entry errors along the way.',
      'Built a ledger for in-game resources to prevent cheating, plus tools to fix live gameplay issues.',
      "Built real-time monitoring for the game's chat system so server failures were caught in minutes, not hours.",
    ],
  },
  {
    company: 'Carnegie Mellon University · Dept. of Psychology',
    title: 'Game Programmer',
    location: 'Pittsburgh, PA',
    period: 'May 2018 — Aug 2021',
    highlights: [
      'Redesigned a Space Invaders research game with custom analytics that earned international academic recognition.',
      'Built a live "control center" so researchers could tune the game for specific players in real time.',
    ],
  },
  {
    company: 'Param Labs',
    title: 'AR/VR Game Programmer',
    period: 'Dec 2016 — May 2017',
    highlights: [
      'Re-engineered and shipped a VR title for Google Daydream — featured on the store at launch.',
      'Shipped a mobile VR racing game with Google to test VR ads, and prototyped launch demos for the Asus Zenfone.',
    ],
  },
];

export const skills: { group: string; items: string[] }[] = [
  {
    group: 'Languages',
    items: [
      'Java',
      'TypeScript / JavaScript',
      'Python',
      'C#',
      'C / C++',
      'Shell',
    ],
  },
  {
    group: 'Frameworks & tools',
    items: ['Spring', 'Node.js', 'Unity', 'AWS CDK & SDK', 'JUnit', 'Jest'],
  },
  {
    group: 'Cloud & DevOps',
    items: [
      'AWS (EC2, Lambda, CloudFormation, API Gateway, CDN)',
      'Serverless architectures',
      'CI/CD pipelines',
      'Git · SVN · Perforce',
    ],
  },
  {
    group: 'Data',
    items: ['SQL', 'DynamoDB', 'Redis', 'Memcache', 'RabbitMQ'],
  },
  {
    group: 'APIs',
    items: ['REST', 'GraphQL', 'Pub/Sub', 'Protocol Buffers'],
  },
  {
    group: 'Leading & shipping',
    items: [
      'Team leadership & mentoring',
      'System architecture',
      'Agile / SCRUM',
      'Performance tuning',
      'Security & data privacy',
    ],
  },
];

export const education = [
  {
    school: 'Carnegie Mellon University',
    degree: 'Master of Entertainment Technology',
    place: 'Pittsburgh, PA',
    year: '2019',
    note: 'Where games, art and engineering meet.',
  },
  {
    school: 'VIT University',
    degree: 'B.Tech in Information Technology',
    place: 'Vellore, India',
    year: '2017',
    note: 'Where it all started.',
  },
];

export interface Demo {
  slug: string;
  title: string;
  blurb: string;
}

// Playable experiments living in /public/demos
export const demos: Demo[] = [
  {
    slug: 'fluid_simulation',
    title: 'Fluid Simulation',
    blurb: 'Swirl glowing smoke with your cursor.',
  },
  {
    slug: 'game_of_life',
    title: 'Game of Life',
    blurb: "Conway's classic cellular automaton.",
  },
  {
    slug: 'falling_sand',
    title: 'Falling Sand',
    blurb: 'A tiny physics toy — pour, pile, play.',
  },
  {
    slug: 'flocking_algorithm',
    title: 'Flocking',
    blurb: 'Hundreds of birds, three simple rules.',
  },
  {
    slug: 'wave_function_collapse',
    title: 'Wave Function Collapse',
    blurb: 'Tiles that solve themselves into circuit maps.',
  },
  {
    slug: 'procedurally_generated_terrain_perlin_noise',
    title: 'Perlin Terrain',
    blurb: 'Endless rolling landscapes from noise.',
  },
  {
    slug: 'approximating_pi',
    title: 'Approximating π',
    blurb: 'Estimating π by throwing random darts.',
  },
  {
    slug: 'ascii_video',
    title: 'ASCII Video',
    blurb: 'Your webcam, repainted in text characters.',
  },
];
