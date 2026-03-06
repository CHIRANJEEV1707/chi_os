
export interface Achievement {
    id: string;
    icon: string;
    title: string;
    desc: string;
    secret: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Explorer achievements
  { id: 'first_boot', icon: '💾', title: 'BOOTED UP', desc: 'Survived the boot sequence', secret: false },
  { id: 'explorer', icon: '🗺️', title: 'EXPLORER', desc: 'Opened every application', secret: false },
  { id: 'window_hoarder', icon: '🪟', title: 'WINDOW HOARDER', desc: 'Had 5 windows open at once', secret: false },
  
  // Game achievements  
  { id: 'gamer', icon: '🕹️', title: 'GAMER', desc: 'Played every game in the arcade', secret: false },
  { id: 'snake_master', icon: '🐍', title: 'SNAKE MASTER', desc: 'Scored 100+ in Snake', secret: false },
  { id: 'minesweeper_god', icon: '💣', title: 'LUCKY ESCAPE', desc: 'Won Minesweeper on Hard', secret: false },
  { id: 'tetris_line', icon: '🧱', title: 'TETRIS!', desc: 'Cleared 4 lines at once in Tetris', secret: false },
  { id: 'invader_slayer', icon: '👾', title: 'INVADER SLAYER', desc: 'Cleared Wave 1 in Invaders', secret: false },

  // Easter egg achievements
  { id: 'roasted', icon: '🔥', title: 'ROASTED', desc: 'Asked CHIRU-BOT to roast the portfolio', secret: true },
  { id: 'hacker', icon: '💻', title: 'HACKER', desc: 'Found the terminal', secret: true },
  { id: 'hired', icon: '🤝', title: 'GOOD TASTE', desc: 'Typed "hire me" in the terminal', secret: true },
  { id: 'matrix', icon: '🟢', title: 'NEO', desc: 'Entered the Matrix', secret: true },
  { id: 'konami', icon: '🎮', title: 'CHEAT CODE', desc: 'You know what you did', secret: true },
  { id: 'recycler', icon: '🗑️', title: 'DUMPSTER DIVER', desc: 'Checked the recycle bin', secret: true },
  { id: 'insomniac', icon: '🌙', title: 'INSOMNIAC', desc: 'Triggered the screensaver', secret: true },
  { id: 'signed', icon: '✍️', title: 'YOU WERE HERE', desc: 'Signed the guestbook', secret: true },
  { id: 'interviewer', icon: '🎤', title: 'INTERVIEWER', desc: 'Asked CHIRU-BOT 5+ questions', secret: false },
  { id: 'printer', icon: '🖨️', title: 'OLD SCHOOL', desc: 'Used the print feature on the resume', secret: true },
  { id: 'shutdown', icon: '⚡', title: 'GOODBYE', desc: 'Tried to shut down the OS', secret: true },
  { id: 'business_card', icon: '💼', title: 'NETWORKER', desc: 'Discovered the foldable resume card', secret: true },
];
