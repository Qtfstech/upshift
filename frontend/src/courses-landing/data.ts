import {
  BrainCircuit,
  BarChart3,
  Cloud,
  Database,
  Workflow,
  Landmark,
  Code2,
  Coffee,
  type LucideIcon,
} from 'lucide-react';

export interface CourseItem {
  id: string;
  Icon: LucideIcon;
  title: string;
  category: string;
  tagline: string;
  level: string;
  duration: string;
  mentor: string;
  ctc: string;
  format: string;
  highlights: string[];
}

export const CATEGORIES = ['Cloud, Data & AI (IT)', 'Software Development (IT)', 'Business & Finance (Non-IT)'];

export const COURSES: CourseItem[] = [
  {
    id: 'ai-ml',
    Icon: BrainCircuit,
    title: 'AI/ML Engineering',
    category: 'Cloud, Data & AI (IT)',
    tagline: 'Build and deploy real machine-learning systems, not just notebooks.',
    level: 'Beginner → Job-ready',
    duration: '16 weeks',
    mentor: 'Mr. Arjun',
    ctc: '₹8-20L',
    format: '100% Live · Instructor-led',
    highlights: ['Applied ML & GenAI projects', 'MLOps & deployment pipelines', 'Mock interviews with mentors'],
  },
  {
    id: 'power-bi',
    Icon: BarChart3,
    title: 'Full Stack Power BI',
    category: 'Cloud, Data & AI (IT)',
    tagline: 'Go from raw data to boardroom-ready dashboards, end to end.',
    level: 'Beginner → Job-ready',
    duration: '10 weeks',
    mentor: 'Ms. Priya',
    ctc: '₹6-14L',
    format: '100% Live · Instructor-led',
    highlights: ['DAX, data modelling & Power Query', 'Real client-style dashboard builds', 'Mock interviews with mentors'],
  },
  {
    id: 'azure-fabric',
    Icon: Cloud,
    title: 'Azure & MS Fabric',
    category: 'Cloud, Data & AI (IT)',
    tagline: 'Cloud and data-platform skills built around Microsoft’s fastest-growing stack.',
    level: 'Intermediate → Job-ready',
    duration: '12 weeks',
    mentor: 'Mr. Ritesh',
    ctc: '₹7-14L',
    format: '100% Live · Instructor-led',
    highlights: ['Azure infra & governance', 'End-to-end Fabric data platform', 'Mock interviews with mentors'],
  },
  {
    id: 'snowflake',
    Icon: Database,
    title: 'Snowflake Data Engineering',
    category: 'Cloud, Data & AI (IT)',
    tagline: 'Design and pipeline data at scale on the cloud data platform employers ask for.',
    level: 'Intermediate → Job-ready',
    duration: '12 weeks',
    mentor: 'Mr. Karthik',
    ctc: '₹7-16L',
    format: '100% Live · Instructor-led',
    highlights: ['Pipelines, warehousing & performance', 'Real dataset engineering projects', 'Mock interviews with mentors'],
  },
  {
    id: 'power-platform',
    Icon: Workflow,
    title: 'Power Platform Development',
    category: 'Cloud, Data & AI (IT)',
    tagline: 'Ship apps, automations and bots on the low-code stack enterprises run on.',
    level: 'Beginner → Job-ready',
    duration: '10 weeks',
    mentor: 'Ms. Divya',
    ctc: '₹6-12L',
    format: '100% Live · Instructor-led',
    highlights: ['Power Apps, Automate & Copilot Studio', 'Enterprise workflow projects', 'Mock interviews with mentors'],
  },
  {
    id: 'python',
    Icon: Code2,
    title: 'Full Stack Python',
    category: 'Software Development (IT)',
    tagline: 'Backend-to-frontend Python development, taught the way product teams build.',
    level: 'Beginner → Job-ready',
    duration: '16 weeks',
    mentor: 'Mr. Sandeep',
    ctc: '₹6-18L',
    format: '100% Live · Instructor-led',
    highlights: ['Django/FastAPI + React projects', 'Deployment & system design basics', 'Mock interviews with mentors'],
  },
  {
    id: 'java',
    Icon: Coffee,
    title: 'Full Stack Java',
    category: 'Software Development (IT)',
    tagline: 'Enterprise-grade Java development from core fundamentals to deployed apps.',
    level: 'Beginner → Job-ready',
    duration: '16 weeks',
    mentor: 'Mr. Vikram',
    ctc: '₹6-16L',
    format: '100% Live · Instructor-led',
    highlights: ['Spring Boot + React projects', 'Deployment & system design basics', 'Mock interviews with mentors'],
  },
  {
    id: 'enrolled-agent',
    Icon: Landmark,
    title: 'Enrolled Agent (Non-IT)',
    category: 'Business & Finance (Non-IT)',
    tagline: 'A US taxation credential track for non-IT learners looking to break into finance.',
    level: 'Beginner → Certified',
    duration: '14 weeks',
    mentor: 'Ms. Anitha',
    ctc: '₹5-10L',
    format: '100% Live · Instructor-led',
    highlights: ['IRS Enrolled Agent exam prep', 'US tax practice case studies', 'Career guidance for non-IT switchers'],
  },
];

export interface DemoDateItem {
  courseId: string;
  date: string;
  day: string;
  time: string;
  mode: string;
}

export const DEMO_DATES: DemoDateItem[] = [
  { courseId: 'ai-ml', date: 'Sep 27, 2026', day: 'Sunday', time: '11:00 AM IST', mode: 'On-site + Live stream' },
  { courseId: 'power-bi', date: 'Sep 30, 2026', day: 'Wednesday', time: '6:00 PM IST', mode: 'On-site + Live stream' },
  { courseId: 'python', date: 'Oct 3, 2026', day: 'Saturday', time: '11:00 AM IST', mode: 'On-site + Live stream' },
  { courseId: 'java', date: 'Oct 6, 2026', day: 'Tuesday', time: '6:00 PM IST', mode: 'On-site + Live stream' },
];

export interface BatchItem {
  courseId: string;
  startDate: string;
  seatsLeft: number;
  cohortSize: number;
  mode: string;
}

// startDate must be a Date-parseable string ("Mon DD, YYYY") — used to drive the batches calendar.
export const BATCHES: BatchItem[] = [
  { courseId: 'ai-ml', startDate: 'Sep 26, 2026', seatsLeft: 5, cohortSize: 30, mode: 'Hyderabad + Online' },
  { courseId: 'power-bi', startDate: 'Sep 28, 2026', seatsLeft: 8, cohortSize: 30, mode: 'Hyderabad + Online' },
  { courseId: 'python', startDate: 'Sep 29, 2026', seatsLeft: 6, cohortSize: 30, mode: 'Hyderabad + Online' },
  { courseId: 'java', startDate: 'Sep 30, 2026', seatsLeft: 9, cohortSize: 30, mode: 'Hyderabad + Online' },
  { courseId: 'azure-fabric', startDate: 'Oct 6, 2026', seatsLeft: 7, cohortSize: 25, mode: 'Hyderabad + Online' },
  { courseId: 'snowflake', startDate: 'Oct 13, 2026', seatsLeft: 10, cohortSize: 25, mode: 'Hyderabad + Online' },
  { courseId: 'power-platform', startDate: 'Oct 14, 2026', seatsLeft: 12, cohortSize: 25, mode: 'Hyderabad + Online' },
  { courseId: 'enrolled-agent', startDate: 'Oct 20, 2026', seatsLeft: 15, cohortSize: 25, mode: 'Online only' },
];

export interface StatItem {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
}

export const STATS: StatItem[] = [
  { to: 20000, suffix: '+', label: 'Learners trained since 2017' },
  { to: 82, suffix: '%', label: 'Placement rate, interviews guaranteed within 60 days' },
  { to: 60, prefix: '₹', suffix: 'L', label: 'Highest salary achieved by an alumnus' },
  { to: 4.9, decimals: 1, label: 'Student rating across 2,400+ verified reviews' },
];

export const RECOGNITIONS = ['NASSCOM', 'ISO 9001:2015', 'Startup India', 'FutureSkills Prime'];

export const FEATURES = [
  '100% Live, Instructor-led Classes',
  'Placement Support on Every Track',
];
