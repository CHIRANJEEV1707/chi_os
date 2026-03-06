

import About from './About';
import Projects from './Projects';
import Skills from './Skills';
import Experience from './Experience';
import Resume from './Resume';
import Contact from './Contact';
import Guestbook from './Guestbook';
import Games from './Games';
import Terminal from './Terminal';
import Trash from './Trash';
import React from 'react';
import AboutOS from './AboutOS';
import ChiruBot from './ChiruBot';
import Achievements from './Achievements';
import Quests from './Quests';
import Bizcard from './Bizcard';
import SecretMessage from './SecretMessage';
import Startups from './Startups';
import PitchDeck from './PitchDeck';
import CaseStudies from './CaseStudies';
import Thoughts from './Thoughts';

const pageMap: { [key: string]: React.ComponentType } = {
  about: About,
  projects: Projects,
  skills: Skills,
  experience: Experience,
  resume: Resume,
  'chiru-bot': ChiruBot,
  contact: Contact,
  guestbook: Guestbook,
  games: Games,
  achievements: Achievements,
  quests: Quests,
  bizcard: Bizcard,
  startups: Startups,
  'case-studies': CaseStudies,
  'secret-message': SecretMessage,
  terminal: Terminal,
  trash: Trash,
  'about-os': AboutOS,
  pitch: PitchDeck,
  thoughts: Thoughts,
};

export const getPageComponent = (id: string): React.ComponentType | null => {
  const cleanId = id.replace('.exe', '').replace('/', '').replace('.pdf', '').replace('.sh', '').replace('.sys', '').replace('.log', '').replace('.ai', '').replace('.deck', '');
  return pageMap[cleanId] || null;
};
