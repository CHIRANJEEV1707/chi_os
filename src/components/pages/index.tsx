
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
  terminal: Terminal,
  trash: Trash,
  'about-os': AboutOS,
  achievements: Achievements,
};

export const getPageComponent = (id: string): React.ComponentType | null => {
  return pageMap[id] || null;
};
