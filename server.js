const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname)); // HTML files serve karne ke liye

let botStatus = "Offline";
let botProcess = null;
let startTime = null;

// Default Bot Settings (Aapke zip data ke mutabiq)
let currentBotConfig = {
    uid: "848492002",
    name: "TAHA-TRICKER",
    owner: "Admin",
    appState: "appstate.json",
    prefix: "."
};

// Uptime Calculator Function
function getUptime() {
    if (!startTime) return "0s";
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const hrs = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = diff % 60;
    return `${hrs}h ${mins}m ${secs}s`;
}

// 1. Bot Status aur Uptime API
app.get('/api/bot-status', (req, res) => {
    res.json({
        status: botStatus,
        uptime: getUptime(),
        config: currentBotConfig
    });
});

// 2. Real Bot Execution API (Live Run)
app.post('/api/run-bot', (req, res) => {
    const { uid, name, owner, appState, prefix } = req.body;
    
    if (botStatus === "Online") {
        return res.json({ success: false, message: "Bot pehle se hi live chal raha hai!" });
    }

    currentBotConfig = { uid, name, owner, appState, prefix: prefix || "!" };
    
    // Yahan aapki file chalane ki command (e.g., node index.js ya node main.js)
    // Aapke CHAND-TRICKER-BOT ke folder ke main script ke mutabiq ise badlein
    botProcess = exec('npm start', (error, stdout, stderr) => {
        if (error) {
            console.error(`Bot Error: ${error}`);
            botStatus = "Offline";
            startTime = null;
            return;
        }
    });

    botStatus = "Online";
    startTime = Date.now();
    
    res.json({ success: true, message: "Bot successfully backend par start ho gaya hai!" });
});

// 3. Bot Stop API
app.post('/api/stop-bot', (req, res) => {
    if (botProcess) {
        botProcess.kill();
        botStatus = "Offline";
        startTime = null;
        res.json({ success: true, message: "Bot process terminated!" });
    } else {
        res.json({ success: false, message: "Koyi active bot process nahi mila." });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
