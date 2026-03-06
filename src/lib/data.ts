
export const DESKTOP_ICONS = [
    { "id": "about", "label": "ABOUT.exe", "icon": "👤" },
    { "id": "projects", "label": "PROJECTS/", "icon": "📁" },
    { "id": "skills", "label": "SKILLS.sys", "icon": "⚙️" },
    { "id": "experience", "label": "EXPERIENCE/", "icon": "💼" },
    { "id": "resume", "label": "RESUME.pdf", "icon": "📄" },
    { "id": "contact", "label": "CONTACT.sh", "icon": "📡" },
    { "id": "chiru-bot", "label": "CHIRU-BOT.ai", "icon": "🤖" },
    { "id": "games", "label": "GAMES/", "icon": "🕹️" },
    { "id": "achievements", "label": "AWARDS.log", "icon": "🏆" },
    { "id": "quests", "label": "QUESTS.exe", "icon": "📜" },
    { "id": "bizcard", "label": "BIZCARD.exe", "icon": "💳" },
    { "id": "terminal", "label": "TERMINAL.exe", "icon": ">_" },
    { "id": "trash", "label": "RECYCLE.bin", "icon": "🗑️" },
    { "id": "guestbook", "label": "GUESTBOOK.log", "icon": "✍️" }
];

export const INITIAL_ICON_POSITIONS = [
    // This is now just a configuration array used by IconManagerProvider
    // It is NOT intended to be used directly for rendering.
    // Left column
    { id: 'about', position: { x: 24, y: 24 } },
    { id: 'projects', position: { x: 24, y: 136 } },
    { id: 'skills', position: { x: 24, y: 248 } },
    { id: 'experience', position: { x: 24, y: 360 } },
    { id: 'resume', position: { x: 24, y: 472 } },
    // Second column
    { id: 'chiru-bot', position: { x: 120, y: 24 } },
    { id: 'contact', position: { x: 120, y: 136 } },
    { id: 'guestbook', position: { x: 120, y: 248 } },
    // Right side (negative values are offsets from right/bottom)
    { id: 'games', position: { x: -120, y: 24 } },
    { id: 'achievements', position: { x: -120, y: 136 } },
    { id: 'quests', position: { x: -120, y: 248 } },
    { id: 'terminal', position: { x: -120, y: 360 } },
    { id: 'bizcard', position: { x: -120, y: 472 } },
    // Far bottom right
    { id: 'trash', position: { x: -120, y: -180 } },
];


export const START_MENU_ITEMS = [
    { id: "about", "label": "About Chiranjeev", "icon": "user", "action": "open_window" },
    { id: "projects", "label": "Projects", "icon": "folder", "action": "open_window" },
    { id: "skills", "label": "Skills", "icon": "chip", "action": "open_window" },
    { id: "chiru-bot", "label": "AI Interview", "icon": "bot", "action": "open_window" },
    { id: "games", "label": "Games", "icon": "gamepad", "action": "open_window" },
    { id: "achievements", "label": "Achievements", "icon": "trophy", "action": "open_window" },
    { id: "quests", "label": "Quests", "icon": "scroll", "action": "open_window" },
    { id: "terminal", "label": "Terminal", "icon": "prompt", "action": "open_window" },
    { "divider": true },
    { id: "settings", "label": "Settings", "icon": "gear", "action": "open_window" },
    { id: "reboot", "label": "Reboot OS", "icon": "refresh", "action": "reboot" },
    { id: "shutdown", "label": "Shutdown", "icon": "power", "action": "shutdown" }
]
