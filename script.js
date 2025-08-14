const morseMap = {
    "A": ".-",
    "B": "-...",
    "C": "-.-.",
    "D": "-..",
    "E": ".",
    "F": "..-.",
    "G": "--.",
    "H": "....",
    "I": "..",
    "J": ".---",
    "K": "-.-",
    "L": ".-..",
    "M": "--",
    "N": "-.",
    "O": "---",
    "P": ".--.",
    "Q": "--.-",
    "R": ".-.",
    "S": "...",
    "T": "-",
    "U": "..-",
    "V": "...-",
    "W": ".--",
    "X": "-..-",
    "Y": "-.--",
    "Z": "--..",
    "0": "-----",
    "1": ".----",
    "2": "..---",
    "3": "...--",
    "4": "....-",
    "5": ".....",
    "6": "-....",
    "7": "--...",
    "8": "---..",
    "9": "----.",
    ".": ".-.-.-",
    ",": "--..--",
    "?": "..--..",
    "'": ".----.",
    "!": "-.-.--",
    "/": "-..-.",
    "(": "-.--.",
    ")": "-.--.-",
    "&": ".-...",
    ":": "---...",
    ";": "-.-.-.",
    "=": "-...-",
    "+": ".-.-.",
    "-": "-....-",
    "_": "..--.-",
    "\"": ".-..-.",
    "$": "...-..-",
    "@": ".--.-.",
    " ": "/"
};

const invMorseMap = {};
for (const key in morseMap) {
    invMorseMap[morseMap[key]] = key;
}

function encode() {
    const text = document.getElementById('textInput').value.toUpperCase();
    const result = [];
    for (const ch of text) {
        if (morseMap[ch]) {
            result.push(morseMap[ch]);
        }
    }
    document.getElementById('textOutput').value = result.join(' ');
}

function decode() {
    const code = document.getElementById('codeInput').value.trim().split(' ');
    const result = [];
    for (const token of code) {
        if (invMorseMap[token]) {
            result.push(invMorseMap[token]);
        }
    }
    document.getElementById('codeOutput').value = result.join('');
}

// Audio parameters
let wpm = 20;
let tone = 600;
let volume = 0.5;

// Play beep for dot or dash using Web Audio API
function playBeep(char) {
    return new Promise(resolve => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.frequency.value = tone;
        oscillator.type = 'sine';
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = volume;
        const unit = 1.2 / wpm;
        const duration = char === '.' ? unit : 3 * unit;
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
        setTimeout(() => {
            resolve();
        }, (duration + unit) * 1000);
    });
}

async function playBeepSequence(morseString) {
    for (const char of morseString) {
        if (char === '.' || char === '-') {
            await playBeep(char);
        } else if (char === ' ') {
            await new Promise(r => setTimeout(r, 3 * (1.2 / wpm) * 1000));
        } else if (char === '/') {
            await new Promise(r => setTimeout(r, 7 * (1.2 / wpm) * 1000));
        }
    }
}

function updateWPM(value) {
    wpm = parseInt(value, 10);
}

function updateTone(value) {
    tone = parseInt(value, 10);
}

function updateVolume(value) {
    volume = parseFloat(value);
}

// Practice mode
let practiceRunning = false;

function startPractice() {
    if (practiceRunning) return;
    practiceRunning = true;
    const resultDiv = document.getElementById('practiceResult');
    resultDiv.innerText = '';
    const type = document.getElementById('practiceType').value;
    const duration = parseInt(document.getElementById('practiceDuration').value, 10) * 60000;
    const startTime = Date.now();

    async function generateItem() {
        if (!practiceRunning || Date.now() - startTime >= duration) {
            practiceRunning = false;
            resultDiv.innerText += '\nPractice finished.';
            return;
        }
        let item;
        if (type === 'letter') {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            item = letters[Math.floor(Math.random() * letters.length)];
        } else {
            const words = ['HELLO', 'WORLD', 'CODE', 'TEST', 'MORSE', 'PRACTICE', 'GPT'];
            item = words[Math.floor(Math.random() * words.length)];
        }
        resultDiv.innerText += `\nSent: ${item}`;
        await playBeepSequence(item.split('').map(ch => morseMap[ch] || '').join(' '));
        const answer = prompt('Enter what you heard:');
        resultDiv.innerText += ` -> You wrote: ${answer}`;
        setTimeout(generateItem, 500);
    }
    generateItem();
}

function stopPractice() {
    practiceRunning = false;
}

// Account functions
const API_BASE_URL = 'http://localhost:3000'; // replace with your VPS API endpoint

async function registerUser() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    if (!username || !password) {
        alert('Please enter username and password.');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (response.ok) {
            alert('Registration successful.');
        } else {
            const data = await response.json();
            alert('Registration failed: ' + (data.message || response.statusText));
        }
    } catch (err) {
        // local fallback
        const accounts = JSON.parse(localStorage.getItem('accounts') || '{}');
        if (accounts[username]) {
            alert('User already exists locally.');
        } else {
            accounts[username] = password;
            localStorage.setItem('accounts', JSON.stringify(accounts));
            alert('Registered locally.');
        }
    }
}

async function loginUser() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    if (!username || !password) {
        alert('Please enter username and password.');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (response.ok) {
            alert('Login successful.');
        } else {
            const data = await response.json();
            alert('Login failed: ' + (data.message || response.statusText));
        }
    } catch (err) {
        const accounts = JSON.parse(localStorage.getItem('accounts') || '{}');
        if (accounts[username] === password) {
            alert('Logged in locally.');
        } else {
            alert('Login failed locally.');
        }
    }
}
