const morseMap = {
  "A": ".-",    "B": "-...",  "C": "-.-.",  "D": "-..",
  "E": ".",     "F": "..-.",  "G": "--.",   "H": "....",
  "I": "..",    "J": ".---",  "K": "-.-",   "L": ".-..",
  "M": "--",    "N": "-.",    "O": "---",   "P": ".--.",
  "Q": "--.-",  "R": ".-.",   "S": "...",   "T": "-",
  "U": "..-",   "V": "...-",  "W": ".--",   "X": "-..-",
  "Y": "-.--",  "Z": "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...",
  "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.",
  "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-",
  "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-",
  "+": ".-.-.", "-": "-....-", "_": "..--.-", "\"": ".-..-.",
  "$": "...-..-", "@": ".--.-.", " ": "/"
};

const invMorseMap = {};
for (const key in morseMap) {
  invMorseMap[morseMap[key]] = key;
}

function encode() {
  const text = document.getElementById('textInput').value.toUpperCase();
  let result = [];
  for (let ch of text) {
    if (morseMap[ch]) {
      result.push(morseMap[ch]);
    }
  }
  document.getElementById('morseOutput').value = result.join(' ');
}

function decode() {
  const morse = document.getElementById('morseInput').value.trim().split(/\s+/);
  let result = '';
  for (let symbol of morse) {
    if (invMorseMap[symbol]) {
      result += invMorseMap[symbol];
    }
  }
  document.getElementById('textOutput').value = result;
}

function playMorse() {
  const morse = document.getElementById('morseOutput').value.trim().split(' ');
  const wpm = parseFloat(document.getElementById('wpm').value);
  const unit = 1200 / wpm;
  const freq = parseFloat(document.getElementById('freq').value);
  const vol  = parseFloat(document.getElementById('vol').value);
  let time = 0;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  for (let code of morse) {
    for (let char of code) {
      if (char === '.') {
        beep(ctx, time, unit, freq, vol);
        time += unit + unit;
      } else if (char === '-') {
        beep(ctx, time, unit * 3, freq, vol);
        time += unit * 3 + unit;
      }
    }
    time += unit * 2;
  }
}

function beep(ctx, startTime, duration, freq, vol) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.frequency.value = freq;
  gainNode.gain.value = vol;
  oscillator.connect(gainNode).connect(ctx.destination);
  oscillator.start(ctx.currentTime + startTime / 1000);
  oscillator.stop(ctx.currentTime + (startTime + duration) / 1000);
}

// Practice Mode
const practiceWords = ["SOS","HELP","MORSE","CODE","JAVA","PYTHON","HELLO","WORLD","TEST","AI"];
let currentPractice = '';
function startPractice() {
  const allKeys = Object.keys(morseMap).filter(k => k.length === 1 && /[A-Z0-9]/.test(k));
  const chooseWord = Math.random() < 0.5;
  if (chooseWord) {
    currentPractice = practiceWords[Math.floor(Math.random()*practiceWords.length)];
  } else {
    currentPractice = allKeys[Math.floor(Math.random()*allKeys.length)];
  }
  document.getElementById('practicePrompt').textContent = 'Listen...';
  document.getElementById('practiceInput').value = '';
  document.getElementById('practiceInput').disabled = false;
  document.getElementById('practiceResult').textContent = '';
  document.getElementById('morseOutput').value = currentPractice.split('').map(ch => morseMap[ch]).join(' ');
  playMorse();
  setTimeout(() => {
    document.getElementById('practicePrompt').textContent = 'Type what you heard:';
  }, 1000);
}

function checkPractice() {
  const input = document.getElementById('practiceInput').value.trim().toUpperCase();
  if (input.length === currentPractice.length) {
    if (input === currentPractice) {
      updatePracticeResult('Correct! The answer was ' + currentPractice, 'green');
    } else {
      updatePracticeResult('Incorrect. The correct answer was ' + currentPractice, 'red');
    }
    document.getElementById('practiceInput').disabled = true;
  }
}

function updatePracticeResult(message, color) {
  const resultDiv = document.getElementById('practiceResult');
  resultDiv.textContent = message;
  resultDiv.style.color = color;
}

// Account functionality
const API_BASE_URL = '';
async function registerUser() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  if (!username || !password) {
    updateAccountStatus('Please enter a username and password.', 'red');
    return;
  }
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
      });
      const data = await res.json();
      updateAccountStatus(data.message || 'Registered successfully.', 'green');
    } catch (err) {
      updateAccountStatus('Registration failed: ' + err.message, 'red');
    }
  } else {
    const users = JSON.parse(localStorage.getItem('morse_users') || '{}');
    if (users[username]) {
      updateAccountStatus('Username already exists.', 'red');
    } else {
      users[username] = password;
      localStorage.setItem('morse_users', JSON.stringify(users));
      updateAccountStatus('Registered locally.', 'green');
    }
  }
}

async function loginUser() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  if (!username || !password) {
    updateAccountStatus('Please enter a username and password.', 'red');
    return;
  }
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('morse_logged_in_user', username);
        updateAccountStatus('Logged in successfully.', 'green');
      } else {
        updateAccountStatus(data.message || 'Login failed.', 'red');
      }
    } catch (err) {
      updateAccountStatus('Login failed: ' + err.message, 'red');
    }
  } else {
    const users = JSON.parse(localStorage.getItem('morse_users') || '{}');
    if (users[username] && users[username] === password) {
      localStorage.setItem('morse_logged_in_user', username);
      updateAccountStatus('Logged in locally.', 'green');
    } else {
      updateAccountStatus('Invalid credentials.', 'red');
    }
  }
}

function updateAccountStatus(msg, color) {
  const statusDiv = document.getElementById('accountStatus');
  statusDiv.textContent = msg;
  statusDiv.style.color = color;
}
