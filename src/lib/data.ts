export const DESKTOP_ICONS = [
    { "id": "about", "label": "ABOUT.exe", "icon": "👤" },
    { "id": "projects", "label": "PROJECTS/", "icon": "📁" },
    { "id": "skills", "label": "SKILLS.sys", "icon": "⚙️" },
    { "id": "experience", "label": "EXPERIENCE/", "icon": "💼" },
    { "id": "resume", "label": "RESUME.pdf", "icon": "📄" },
    { "id": "contact", "label": "CONTACT.sh", "icon": "📡" },
    { "id": "guestbook", "label": "GUESTBOOK.txt", "icon": "📖" },
    { "id": "games", "label": "GAMES/", "icon": "🕹️" },
    { "id": "terminal", "label": "TERMINAL.exe", "icon": ">_" },
    { "id": "trash", "label": "RECYCLE.bin", "icon": "🗑️" }
];

export const INITIAL_ICON_POSITIONS = DESKTOP_ICONS.map((icon, index) => ({
    ...icon,
    position: {
        x: (index % 2) === 0 ? 24 : 120,
        y: Math.floor(index / 2) * 96 + 24
    }
}));

export const START_MENU_ITEMS = [
    { id: "about", "label": "About Chiranjeev", "icon": "user", "action": "open_window" },
    { id: "projects", "label": "Projects", "icon": "folder", "action": "open_window" },
    { id: "skills", "label": "Skills", "icon": "chip", "action": "open_window" },
    { id: "experience", "label": "Experience", "icon": "briefcase", "action": "open_window" },
    { id: "games", "label": "Games", "icon": "gamepad", "action": "open_window" },
    { id: "terminal", "label": "Terminal", "icon": "prompt", "action": "open_window" },
    { "divider": true },
    { id: "settings", "label": "Settings", "icon": "gear", "action": "open_window" },
    { id: "reboot", "label": "Reboot OS", "icon": "refresh", "action": "reboot" },
    { id: "shutdown", "label": "Shutdown", "icon": "power", "action": "shutdown" }
]
