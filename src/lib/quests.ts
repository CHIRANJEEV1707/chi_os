
export type Task = {
    id: string;
    label: string;
    hint: string;
};

export type Quest = {
    id: string;
    title: string;
    desc: string;
    icon: string;
    tasks: Task[];
    reward: {
        achievement?: string;
        message: string;
        special?: 'unlocks_secret_message';
    };
    locked?: (isQuestComplete: (questId: string) => boolean) => boolean;
};

export const QUESTS: Quest[] = [
  {
    id: 'orientation',
    title: 'ORIENTATION',
    desc: 'Get familiar with CHIRU-OS',
    icon: '🖥️',
    tasks: [
      { id: 'open_about', label: 'Read the About page', 
        hint: 'Double-click ABOUT.exe' },
      { id: 'open_projects', label: 'Browse the Projects', 
        hint: 'Double-click PROJECTS/' },
      { id: 'open_terminal', label: 'Open the Terminal', 
        hint: 'Double-click TERMINAL.exe' },
    ],
    reward: { message: 'You know your way around!' }
  },
  {
    id: 'get_to_know_me',
    title: 'GET TO KNOW ME',
    desc: 'Learn about Chiranjeev',
    icon: '👤',
    tasks: [
      { id: 'chat_bot', label: 'Ask CHIRU-BOT a question', 
        hint: 'Open CHIRU-BOT.ai and send a message.' },
      { id: 'read_experience', label: 'Check out my experience', 
        hint: 'Open EXPERIENCE/' },
      { id: 'view_resume', label: 'View my resume', 
        hint: 'Open RESUME.pdf' },
    ],
    reward: { achievement: 'interviewer', message: 'Now you know the founder behind the OS!' }
  },
  {
    id: 'arcade',
    title: 'ARCADE INITIATION',
    desc: 'Play some games',
    icon: '🕹️',
    tasks: [
      { id: 'play_snake', label: 'Play Snake', hint: 'Open GAMES/ and select Snake.' },
      { id: 'play_any_2', label: 'Play 2 more games', 
        hint: 'Try Tetris or Pong, or any other game.' },
      { id: 'get_score', label: 'Score 50+ in any game', 
        hint: 'Practice makes perfect!' },
    ],
    reward: { achievement: 'gamer', message: 'Gamer detected!' }
  },
  {
    id: 'secret_hunter',
    title: 'SECRET HUNTER',
    desc: 'Find the hidden secrets',
    icon: '🔍',
    tasks: [
      { id: 'find_terminal_secret', label: 'Find a secret terminal command', 
        hint: 'Try something unusual in TERMINAL.exe like "matrix" or "hire me".' },
      { id: 'trigger_screensaver', label: 'Trigger the screensaver', 
        hint: 'Stop moving your mouse or typing for 60 seconds.' },
      { id: 'right_click_secret', label: 'Find the desktop secret', 
        hint: 'Right-click the desktop background and see what you find.' },
    ],
    locked: (isQuestComplete) => !isQuestComplete('get_to_know_me'),
    reward: { message: 'Nothing gets past you!' }
  },
  {
    id: 'final_mission',
    title: 'FINAL MISSION',
    desc: 'Complete the portfolio experience',
    icon: '🏆',
    tasks: [
      { id: 'sign_guestbook', label: 'Sign the guestbook', 
        hint: 'Open GUESTBOOK.log and leave a message.' },
      { id: 'generate_card', label: 'Get my business card', 
        hint: 'Find and open the BIZCARD.exe application.' },
      { id: 'contact_me', label: 'Send me a message', 
        hint: 'Open CONTACT.sh and fill out the form.' },
    ],
    locked: (isQuestComplete) => !isQuestComplete('get_to_know_me'),
    reward: { 
      message: 'Quest complete! Chiranjeev would love to hear from you.',
      special: 'unlocks_secret_message',
      achievement: 'completionist'
    }
  }
];
