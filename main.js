// Global Variables
let currentModule = '';
let score = 0; // Start from 0, will load from storage
let currentWord = '';
let settings = {
    tts: true,
    hints: true,
    sound: true,
    difficulty: 'easy'
};
let currentCategory = null; // No category selected by default
const GOOGLE_CLIENT_ID = '369705995460-d2f937r1bj3963upbmob113ngkf5v6og.apps.googleusercontent.com';
const AUTH_STORAGE_KEY = 'brightwords_google_user';
let currentUser = null;
let hasWelcomedUser = false;

// Daily Progress Tracking
let dailyProgress = {
    lessons: 0,
    points: 0,
    time: 0, // in minutes
    date: new Date().toDateString()
};

// Overall Progress Tracking
let overallProgress = {
    totalLessons: 0,
    totalAchievements: 0,
    totalTime: 0, // in minutes
    moduleProgress: {
        phonics: { completed: 0, total: 0 },
        spelling: { completed: 0, total: 0 },
        writing: { completed: 0, total: 0 },
        reading: { completed: 0, total: 0 },
        memory: { completed: 0, total: 0 },
        stories: { completed: 0, total: 0 }
    }
};

// Streak Tracking
let streakData = {
    currentStreak: 0,
    lastActivityDate: null,
    longestStreak: 0
};

// Helper function to get user-specific storage keys
function getUserStorageKey(baseKey) {
    if (!currentUser || !currentUser.email) {
        return baseKey; // Fallback to base key if no user
    }
    // Create a safe key from email (replace special chars)
    const userKey = currentUser.email.replace(/[^a-zA-Z0-9]/g, '_');
    return `${baseKey}_${userKey}`;
}

// Learning Tips
const learningTips = [
    "Take breaks every 15-20 minutes to keep your mind fresh!",
    "Practice a little bit every day - consistency beats intensity!",
    "Read out loud to improve both reading and speaking skills!",
    "Use the highlight feature to focus on difficult words!",
    "Try different games to keep learning fun and engaging!",
    "Set small goals and celebrate when you achieve them!",
    "Review what you learned yesterday before starting new lessons!",
    "Use the Read Aloud feature to hear proper pronunciation!",
    "Don't worry about mistakes - they're part of learning!",
    "Take your time and enjoy the learning journey!",
    "Connect new words with pictures or stories to remember better!",
    "Practice spelling by writing words in the air with your finger!"
];

const supportProfiles = {
    general: {
        message: 'General support mode active. Select another profile if needed.',
        announcement: 'General learner mode enabled.',
        settings: { tts: true, hints: true, sound: true, difficulty: 'easy' }
    },
    blind: {
        message: 'Blind / low vision mode enabled with richer speech feedback.',
        announcement: 'Blind support enabled. Speech guidance and audio cues boosted.',
        settings: { tts: true, hints: true, sound: true, difficulty: 'easy' }
    },
    deaf: {
        message: 'Deaf / hard of hearing mode enabled. Visual cues prioritized.',
        announcement: 'Deaf support enabled. Sound effects muted; visual guidance boosted.',
        settings: { tts: false, hints: true, sound: false, difficulty: 'medium' }
    },
    neurodiverse: {
        message: 'Games mode enabled. Have fun while learning!',
        announcement: 'Games mode enabled. Challenge yourself and have fun!',
        settings: { tts: true, hints: true, sound: true, difficulty: 'easy' }
    }
};

// Initialize Speech Synthesis
const synth = window.speechSynthesis;
const supportFeaturePanel = document.getElementById('supportFeaturePanel');
// Free API Configuration - Using Google Gemini API (Free Tier)
const HUGGINGFACE_IMAGE_MODEL = 'Salesforce/blip-image-captioning-base'; // Free image recognition (fallback)
const HUGGINGFACE_CHAT_MODEL = 'microsoft/DialoGPT-medium'; // Free chat model (fallback)
const HUGGINGFACE_API_ENDPOINT = 'https://api-inference.huggingface.co/models';
// Google Gemini API (Free tier) - Primary API
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_CHAT_MODEL = 'gemini-pro';
const GEMINI_VISION_MODEL = 'gemini-1.5-flash'; // Fast and reliable vision model
const API_STORAGE_KEY = 'brightwords_api_key'; // For Gemini API key
const DEFAULT_GEMINI_KEY = 'AIzaSyCdz0O0nfPEaIHRNGvHUlBdBPOU4URqCFE'; // Your Gemini API key
const USE_GEMINI = true; // Using Gemini API (faster and more reliable)
const FALLBACK_REPLIES = [
    'Try tracing the word while saying each letter in your head.',
    'Break the task into two tiny steps and celebrate in between.',
    'Need a hint? Tap the Highlight button beside any story.',
    'For live help, ping us on WhatsApp at +91-9004436043.'
];

// Text-to-Speech Function
function speak(text, rate = 0.8) {
    if (!settings.tts) return;

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.1;
    utterance.volume = 0.9;

    const voices = synth.getVoices();
    const preferredVoice = voices.find(voice => voice.lang.includes('en-'));
    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    synth.speak(utterance);
}

// Sound Effects
function playSound(type) {
    if (!settings.sound) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'success') {
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
    } else if (type === 'error') {
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(250, audioContext.currentTime + 0.1);
    } else if (type === 'click') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    }

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Time tracking
let moduleStartTime = null;
let timeTrackingInterval = null;

// Module Opening Function
function openModule(moduleName) {
    currentModule = moduleName;
    const learningArea = document.getElementById('learningArea');
    const gameContainer = document.getElementById('gameContainer');
    const moduleNameElement = document.getElementById('moduleName');

    // Update module name
    const moduleNames = {
        'phonics': '🔤 Phonics Fun',
        'spelling': '✏️ Spelling Wizard',
        'writing': '🎨 Writing Artist',
        'reading': '📖 Story Explorer',
        'memory': '🧠 Memory Master',
        'stories': '🚀 Story Creator'
    };

    moduleNameElement.textContent = moduleNames[moduleName] || moduleName;

    // Load module content
    switch(moduleName) {
        case 'phonics':
            loadPhonicsGame();
            break;
        case 'spelling':
            loadSpellingGame();
            break;
        case 'writing':
            loadWritingGame();
            break;
        case 'reading':
            loadReadingGame();
            break;
        case 'memory':
            loadMemoryGame();
            break;
        case 'stories':
            loadStoriesGame();
            break;
    }

    learningArea.classList.add('active');
    playSound('click');
    speak(`Welcome to ${moduleNames[moduleName]}! Let's have fun learning!`);
    
    // Update daily progress
    updateDailyProgress('lesson', 1);
    
    // Update streak when starting a lesson
    updateStreak();
    
    // Track module activity (increment total attempts)
    if (overallProgress.moduleProgress[moduleName]) {
        overallProgress.moduleProgress[moduleName].total += 1;
    }
    
    // Start time tracking
    moduleStartTime = Date.now();
    if (timeTrackingInterval) {
        clearInterval(timeTrackingInterval);
    }
    timeTrackingInterval = setInterval(() => {
        const timeSpent = Math.floor((Date.now() - moduleStartTime) / 60000); // in minutes
        if (timeSpent > 0) {
            updateDailyProgress('time', 1);
            overallProgress.totalTime += 1;
            saveOverallProgress();
            updateProgressUI();
        }
    }, 60000); // Update every minute

    // Smooth scroll
    learningArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Close Learning Area
function closeLearningArea() {
    const learningArea = document.getElementById('learningArea');
    learningArea.classList.remove('active');
    
    // Stop time tracking and save time spent
    if (timeTrackingInterval) {
        clearInterval(timeTrackingInterval);
        timeTrackingInterval = null;
    }
    if (moduleStartTime) {
        const timeSpent = Math.floor((Date.now() - moduleStartTime) / 60000); // in minutes
        if (timeSpent > 0) {
            updateDailyProgress('time', timeSpent);
            overallProgress.totalTime += timeSpent;
            saveOverallProgress();
            updateProgressUI();
        }
        moduleStartTime = null;
    }
    
    playSound('click');
}

// Phonics Game
function loadPhonicsGame() {
    const words = ['CAT', 'DOG', 'BIRD', 'FISH', 'TREE'];
    currentWord = words[Math.floor(Math.random() * words.length)];

    const gameContainer = document.getElementById('gameContainer');
    gameContainer.innerHTML = `
        <div style="text-align: center;">
            <p style="font-size: 24px; color: #6B7280; margin-bottom: 20px;">
                Click on each letter to hear its sound!
            </p>
            <div class="word-display" id="phonicsWord">${currentWord}</div>
            <div class="letter-grid" id="letterGrid"></div>
            <div class="control-panel">
                <button class="control-btn" onclick="speakFullWord()">
                    🔊 Hear Full Word
                </button>
                <button class="control-btn" onclick="nextPhonicsWord()">
                    Next Word →
                </button>
            </div>
            <div class="feedback-message feedback-success" id="feedbackMsg" style="display: none;">
                Great job! Keep practicing!
            </div>
        </div>
    `;

    // Create letter tiles with keyboard navigation
    const letterGrid = document.getElementById('letterGrid');
    currentWord.split('').forEach((letter, index) => {
        const tile = document.createElement('button');
        tile.className = 'letter-tile';
        tile.textContent = letter;
        tile.setAttribute('role', 'button');
        tile.setAttribute('aria-label', `Letter ${letter}, position ${index + 1} of ${currentWord.length}`);
        tile.setAttribute('tabindex', '0');
        tile.onclick = () => {
            speak(`Letter ${letter}`, 0.6);
            tile.classList.add('selected');
            setTimeout(() => tile.classList.remove('selected'), 500);
            playSound('click');
        };
        // Keyboard navigation
        tile.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                speak(`Letter ${letter}`, 0.6);
                tile.classList.add('selected');
                setTimeout(() => tile.classList.remove('selected'), 500);
                playSound('click');
            }
        });
        letterGrid.appendChild(tile);
    });

    // Enhanced audio feedback for blind/low vision users
    const isBlindMode = currentCategory === 'blind';
    if (isBlindMode) {
        setTimeout(() => {
            speak(`Phonics Fun activity. The word is ${currentWord}. Click or press Enter on each letter to hear its sound. Use Tab to navigate between letters.`, 0.7);
        }, 800);
    } else {
        setTimeout(() => speak(`Let's learn the word: ${currentWord}`), 500);
    }
}

function speakFullWord() {
    speak(currentWord, 0.7);
    playSound('click');
}

function nextPhonicsWord() {
    updateScore(10);
    loadPhonicsGame();
    showFeedback('Great job! Here\'s a new word!');
    // Track module completion after completing a word
    trackModuleCompletion('phonics');
}

// Spelling Game
function loadSpellingGame() {
    const words = ['HAPPY', 'SMILE', 'FRIEND', 'SUNNY', 'PLAY'];
    currentWord = words[Math.floor(Math.random() * words.length)];

    const gameContainer = document.getElementById('gameContainer');
    gameContainer.innerHTML = `
        <div style="text-align: center;">
            <p style="font-size: 24px; color: #6B7280; margin-bottom: 20px;">
                Listen to the word and spell it correctly!
            </p>
            <div class="control-panel">
                <button class="control-btn" onclick="playSpellingWord()">
                    🔊 Hear Word
                </button>
                <button class="control-btn" onclick="showSpellingHint()">
                    💡 Get Hint
                </button>
            </div>
            <div class="word-display" id="spellingDisplay">
                ${currentWord.split('').map(() => '_').join(' ')}
            </div>
            <input type="text" id="spellingInput"
                    class="spelling-input"
                    style="font-size: 32px; padding: 15px; text-align: center;
                           width: 80%; max-width: 400px; margin: 20px auto;
                           display: block; border: 3px solid var(--primary-purple);
                           border-radius: 15px; text-transform: uppercase;"
                    placeholder="Type here...">
            <div class="control-panel">
                <button class="control-btn" onclick="checkSpelling()">
                    ✓ Check Answer
                </button>
                <button class="control-btn" onclick="loadSpellingGame()">
                    Next Word →
                </button>
            </div>
            <div class="feedback-message" id="spellingFeedback" style="display: none;"></div>
        </div>
    `;

    setTimeout(() => playSpellingWord(), 1000);
}

function playSpellingWord() {
    speak(`Spell the word: ${currentWord}`, 0.6);
    playSound('click');
}

function showSpellingHint() {
    const display = document.getElementById('spellingDisplay');
    const hint = currentWord[0] + currentWord.slice(1).split('').map(() => '_').join(' ');
    display.textContent = hint;
    speak(`The word starts with ${currentWord[0]}`, 0.7);
    playSound('click');
}

function checkSpelling() {
    const input = document.getElementById('spellingInput').value.toUpperCase();
    const feedback = document.getElementById('spellingFeedback');

    if (input === currentWord) {
        feedback.className = 'feedback-message feedback-success';
        feedback.textContent = '🎉 Excellent! You spelled it correctly!';
        feedback.style.display = 'block';
        playSound('success');
        speak('Excellent! You spelled it correctly!');
        updateScore(20);
        createConfetti();
        // Track module completion
        trackModuleCompletion('spelling');
    } else {
        feedback.className = 'feedback-message feedback-error';
        feedback.textContent = `Not quite. The correct spelling is: ${currentWord}`;
        feedback.style.display = 'block';
        playSound('error');
        speak(`Not quite. The correct spelling is: ${currentWord}`);
    }
}

// Writing Game
function loadWritingGame() {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.innerHTML = `
        <div style="text-align: center;">
            <p style="font-size: 24px; color: #6B7280; margin-bottom: 20px;">
                Practice writing letters and words!
            </p>
            <canvas id="writingCanvas" width="600" height="300"
                    style="border: 3px dashed var(--primary-purple); border-radius: 15px;
                           background: white; cursor: crosshair;">
            </canvas>
            <div class="control-panel">
                <button class="control-btn" onclick="clearCanvas()">
                    🗑️ Clear
                </button>
                <button class="control-btn" onclick="saveDrawing()">
                    💾 Save
                </button>
            </div>
        </div>
    `;
    initializeCanvas();
}

// Reading Game
function loadReadingGame() {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.innerHTML = `
        <div class="reading-game-wrapper">
            <h3 class="story-title">The Magic Garden Adventure</h3>
            <div class="story-container" role="article" aria-label="Story: The Magic Garden Adventure">
                <p id="readingText" class="story-text">
                    Once upon a time, in a small village, there lived a curious girl named Maya. Every morning, Maya would visit the magical garden behind her house. The garden was filled with colorful flowers that seemed to dance in the gentle breeze. One sunny day, Maya discovered a tiny door hidden beneath a large oak tree. Her heart filled with excitement as she opened the door and stepped into a world of wonder. Inside, she met friendly animals who could talk and trees that sang beautiful melodies. Maya learned that kindness and curiosity could unlock the most amazing adventures. She spent the day exploring, making new friends, and discovering that magic exists when you believe in yourself. As the sun set, Maya returned home with a heart full of joy and memories that would last forever.
                </p>
            </div>
            <div class="control-panel">
                <button class="control-btn" onclick="readAloud()" aria-label="Read the entire story aloud">
                    🔊 Read Aloud
                </button>
                <button class="control-btn" onclick="highlightWords()" aria-label="Highlight words one by one with audio">
                    🖍️ Highlight Words
                </button>
            </div>
        </div>
    `;
    makeWordsClickable();
    
    // Enhanced audio feedback for blind/low vision users
    const isBlindMode = currentCategory === 'blind';
    if (isBlindMode) {
        setTimeout(() => {
            speak('Story Explorer activity. This is the story "The Magic Garden Adventure". Press the Read Aloud button to hear the entire story, or use the Highlight Words button to hear each word individually. You can also click on any word to hear it spoken.', 0.7);
        }, 800);
    }
}

function loadMemoryGame() {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.innerHTML = `
        <div style="text-align: center;">
            <p style="font-size: 24px; color: #6B7280; margin-bottom: 20px;">
                Remember the sequence!
            </p>
            <div class="word-display" id="memorySequence">Click Start to begin!</div>
            <div class="letter-grid" id="memoryCards"></div>
            <div class="control-panel">
                <button class="control-btn" onclick="startMemoryGame()">
                    ▶️ Start Game
                </button>
                <button class="control-btn" onclick="resetMemoryGame()">
                    🔄 Reset
                </button>
            </div>
        </div>
    `;
}

function loadStoriesGame() {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.innerHTML = `
        <div style="padding: 20px;">
            <h3 style="font-size: 28px; margin-bottom: 20px;">Create Your Story!</h3>
            <div style="margin-bottom: 20px;">
                <label style="font-size: 18px;">Choose a theme:</label>
                <select id="storyTheme" style="margin-left: 10px; padding: 10px; border-radius: 10px; border: 2px solid var(--primary-purple);">
                    <option value="adventure">🏔️ Adventure</option>
                    <option value="animals">🐾 Animals</option>
                    <option value="magic">✨ Magic</option>
                    <option value="space">🚀 Space</option>
                </select>
            </div>
            <div id="storyStarter" style="padding: 20px; background: white; border-radius: 15px; margin-bottom: 20px; font-size: 18px;">
                Once upon a time, in a magical forest...
            </div>
            <textarea id="storyInput" placeholder="Continue the story..."
                      style="width: 100%; height: 150px; font-size: 18px; padding: 15px;
                             border: 2px solid var(--primary-purple); border-radius: 15px;">
            </textarea>
            <div class="control-panel">
                <button class="control-btn" onclick="generateStoryIdea()">
                    💡 Get Idea
                </button>
                <button class="control-btn" onclick="readStory()">
                    🔊 Read Story
                </button>
                <button class="control-btn" onclick="saveStory()">
                    💾 Save Story
                </button>
            </div>
        </div>
    `;
}

// Canvas functions
function initializeCanvas() {
    const canvas = document.getElementById('writingCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let isDrawing = false;

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        // Use CSS variable for stroke color
        const root = getComputedStyle(document.documentElement);
        ctx.strokeStyle = root.getPropertyValue('--primary-purple').trim() || '#8B5CF6';
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    });

    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);
}

function clearCanvas() {
    const canvas = document.getElementById('writingCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        playSound('click');
    }
}

function saveDrawing() {
    showFeedback('Great job! Your drawing has been saved!');
    updateScore(15);
    playSound('success');
    // Track module completion
    trackModuleCompletion('writing');
}

// Reading functions
function makeWordsClickable() {
    const text = document.getElementById('readingText');
    if (!text) return;

    const words = text.textContent.split(' ');
    text.innerHTML = words.map((word, index) => {
        const cleanWord = word.replace(/[.,!?;:]/g, '');
        const punctuation = word.replace(/[^.,!?;:]/g, '');
        return `<span class="word-clickable" data-word="${cleanWord}" onclick="speakWord('${cleanWord}')">${cleanWord}</span>${punctuation}${index < words.length - 1 ? ' ' : ''}`;
    }).join('');
}

function speakWord(word) {
    speak(word, 0.6);
}

function readAloud() {
    const text = document.getElementById('readingText');
    if (text) {
        const isBlindMode = currentCategory === 'blind';
        if (isBlindMode) {
            speak('Reading the story: The Magic Garden Adventure. ' + text.textContent, 0.75);
        } else {
            speak(text.textContent, 0.8);
        }
        playSound('click');
    }
}

function highlightWords() {
    const spans = document.querySelectorAll('#readingText .word-clickable');
    let delay = 0;
    const wordDelay = 600; // Faster highlighting
    let wordsHighlighted = 0;

    spans.forEach((span) => {
        setTimeout(() => {
            span.style.backgroundColor = '#FEF3C7';
            span.style.color = '#1F2937';
            span.style.fontWeight = '600';
            const word = span.getAttribute('data-word') || span.textContent;
            speak(word, 0.7);
            wordsHighlighted++;

            setTimeout(() => {
                span.style.backgroundColor = 'transparent';
                span.style.color = '';
                span.style.fontWeight = '';
            }, 500);
            
            // Track completion when all words are highlighted
            if (wordsHighlighted === spans.length) {
                setTimeout(() => {
                    trackModuleCompletion('reading');
                    updateScore(15);
                }, 500);
            }
        }, delay);

        delay += wordDelay;
    });
}

// Memory game functions
let memorySequence = [];
let userSequence = [];

function startMemoryGame() {
    const words = ['CAT', 'DOG', 'SUN', 'TREE', 'BOOK'];
    memorySequence = [];
    userSequence = [];

    // Generate random sequence
    const sequenceLength = settings.difficulty === 'easy' ? 3 : settings.difficulty === 'medium' ? 4 : 5;
    for (let i = 0; i < sequenceLength; i++) {
        memorySequence.push(words[Math.floor(Math.random() * words.length)]);
    }

    // Show sequence
    const display = document.getElementById('memorySequence');
    display.textContent = 'Watch carefully...';

    memorySequence.forEach((word, index) => {
        setTimeout(() => {
            display.textContent = word;
            speak(word, 0.7);
        }, (index + 1) * 1500);
    });

    // After showing sequence, display cards
    setTimeout(() => {
        display.textContent = 'Now select the words in order!';
        showMemoryCards(words);
    }, (sequenceLength + 1) * 1500);
}

function showMemoryCards(words) {
    const cardsDiv = document.getElementById('memoryCards');
    cardsDiv.innerHTML = '';

    words.forEach(word => {
        const card = document.createElement('div');
        card.className = 'letter-tile';
        card.textContent = word;
        card.onclick = () => selectMemoryCard(word, card);
        cardsDiv.appendChild(card);
    });
}

function selectMemoryCard(word, cardElement) {
    userSequence.push(word);
    cardElement.classList.add('selected');
    cardElement.style.pointerEvents = 'none';

    if (userSequence.length === memorySequence.length) {
        checkMemorySequence();
    }
}

function checkMemorySequence() {
    const isCorrect = JSON.stringify(userSequence) === JSON.stringify(memorySequence);

    if (isCorrect) {
        showFeedback('🎉 Perfect! You remembered the sequence!');
        playSound('success');
        updateScore(25);
        createConfetti();
        // Track module completion
        trackModuleCompletion('memory');
    } else {
        showFeedback(`The correct sequence was: ${memorySequence.join(', ')}`);
        playSound('error');
    }
}

function resetMemoryGame() {
    memorySequence = [];
    userSequence = [];
    document.getElementById('memoryCards').innerHTML = '';
    document.getElementById('memorySequence').textContent = 'Click "Start Game" to begin!';
    playSound('click');
}

// Story functions
function generateStoryIdea() {
    const ideas = [
        "A friendly dragon appeared and offered to help...",
        "Suddenly, a magic door opened in the tree...",
        "The animals started to talk and had something important to say...",
        "A rainbow bridge appeared leading to a new world...",
        "The main character discovered they had a special power..."
    ];

    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    const currentStory = document.getElementById('storyInput').value;
    document.getElementById('storyInput').value = currentStory + ' ' + idea;
    speak(`Here's an idea: ${idea}`);
    playSound('click');
}

function readStory() {
    const starter = document.getElementById('storyStarter').textContent;
    const continuation = document.getElementById('storyInput').value;
    speak(starter + ' ' + continuation, 0.8);
}

function saveStory() {
    showFeedback('📚 Your story has been saved! Great creative writing!');
    updateScore(30);
    playSound('success');
    // Track module completion
    trackModuleCompletion('stories');
}

// Helper Functions
function updateScore(points) {
    score += points;
    saveOverallProgress();
    updateProgressUI();
    
    // Update daily progress
    updateDailyProgress('points', points);

    // Check for achievements
    if (score >= 500 && score - points < 500) {
        showAchievement('Master Learner!', 'You reached 500 points!');
    } else if (score >= 1000 && score - points < 1000) {
        showAchievement('Point Master!', 'You reached 1000 points!');
    } else if (score >= 2500 && score - points < 2500) {
        showAchievement('Point Champion!', 'You reached 2500 points!');
    }
}

function showFeedback(message) {
    const feedbackElements = document.querySelectorAll('.feedback-message');
    feedbackElements.forEach(elem => {
        if (elem.id === 'feedbackMsg' || elem.id === 'spellingFeedback') {
            elem.textContent = message;
            elem.style.display = 'block';
            elem.className = 'feedback-message feedback-success';
            setTimeout(() => {
                elem.style.display = 'none';
            }, 3000);
        }
    });
    speak(message);
}

function showAchievement(title, description) {
    const popup = document.getElementById('achievementPopup');
    document.getElementById('achievementTitle').textContent = title;
    document.getElementById('achievementDesc').textContent = description;
    popup.classList.add('show');
    playSound('success');
    speak(`Achievement unlocked: ${title}`);

    // Update achievement count
    overallProgress.totalAchievements += 1;
    saveOverallProgress();
    updateProgressUI();
}

function closeAchievement() {
    document.getElementById('achievementPopup').classList.remove('show');
    playSound('click');
}

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('open');
    playSound('click');
}

// Color Theme Functions
function changeColorTheme(theme) {
    const root = document.documentElement;
    const swatches = document.querySelectorAll('.theme-swatch');
    
    // Remove active state from all swatches
    swatches.forEach(swatch => {
        swatch.style.border = '3px solid transparent';
        swatch.style.transform = 'scale(1)';
    });
    
    // Apply theme based on selection
    switch(theme) {
        case 'purple':
            root.style.setProperty('--primary-purple', '#8B5CF6');
            root.style.setProperty('--primary-pink', '#EC4899');
            document.getElementById('theme-purple').style.border = '3px solid #1F2937';
            document.getElementById('theme-purple').style.transform = 'scale(1.1)';
            break;
        case 'blue':
            root.style.setProperty('--primary-purple', '#3B82F6');
            root.style.setProperty('--primary-pink', '#10B981');
            document.getElementById('theme-blue').style.border = '3px solid #1F2937';
            document.getElementById('theme-blue').style.transform = 'scale(1.1)';
            break;
        case 'orange':
            root.style.setProperty('--primary-purple', '#F59E0B');
            root.style.setProperty('--primary-pink', '#FB923C');
            document.getElementById('theme-orange').style.border = '3px solid #1F2937';
            document.getElementById('theme-orange').style.transform = 'scale(1.1)';
            break;
    }
    
    // Save theme preference (user-specific)
    const storageKey = getUserStorageKey('brightwords_color_theme');
    localStorage.setItem(storageKey, theme);
    
    speak(`Color theme changed to ${theme}`);
    playSound('click');
}

function loadColorTheme() {
    let themeToLoad = 'purple'; // Default theme
    
    if (currentUser && currentUser.email) {
        // Load user-specific theme
        const storageKey = getUserStorageKey('brightwords_color_theme');
        themeToLoad = localStorage.getItem(storageKey) || 'purple';
    } else {
        // No user logged in, use default or check for any saved theme
        themeToLoad = localStorage.getItem('brightwords_color_theme') || 'purple';
    }
    
    changeColorTheme(themeToLoad);
}

function startLearning() {
    // Scroll to support needs section first
    const supportSection = document.getElementById('support');
    if (supportSection) {
        supportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        speak('Choose your support needs to get started. Select a profile that matches your learning style, then choose an activity.');
        playSound('click');
    } else {
        // Fallback to modules if support section not found
        document.querySelector('.modules-section')?.scrollIntoView({ behavior: 'smooth' });
        speak('Choose a module to start learning!');
        playSound('click');
    }
}

// Feedback Form Functions
function openFeedbackForm(formType) {
    // Google Form links
    const feedbackForms = {
        'overall': 'https://forms.gle/gaCtLrhYftNxYFyN6',
        'activities': 'https://forms.gle/XbvrZtWcgpU6i6gG6',
        'accessibility': 'https://forms.gle/Q6AqrMv4G7ZtVJSNA',
        'ux': 'https://forms.gle/7NiAmqrt8AUibwfq6',
        'features': 'https://forms.gle/BpYkPWwx3jiUTxtV6'
    };
    
    const formUrl = feedbackForms[formType];
    
    if (formUrl) {
        window.open(formUrl, '_blank', 'noopener,noreferrer');
        speak('Opening feedback form');
        playSound('click');
    } else {
        alert('Feedback form not available. Please try again later.');
        speak('Feedback form not available');
        playSound('error');
    }
}

// Learning Tips Function
function getRandomTip() {
    const tipElement = document.getElementById('learningTip');
    const tipBtn = document.getElementById('getTipBtn');
    
    if (!tipElement || !tipBtn) return;
    
    const randomTip = learningTips[Math.floor(Math.random() * learningTips.length)];
    tipElement.textContent = randomTip;
    tipBtn.textContent = '✨ New Tip';
    
    setTimeout(() => {
        tipBtn.textContent = '💡 Get Learning Tip';
    }, 2000);
    
    speak(randomTip);
    playSound('click');
}

// Daily Progress Functions
function updateDailyProgress(type, value) {
    const today = new Date().toDateString();
    
    // Reset if it's a new day
    if (dailyProgress.date !== today) {
        dailyProgress = {
            lessons: 0,
            points: 0,
            time: 0,
            date: today
        };
    }
    
    if (type === 'lesson') {
        dailyProgress.lessons += 1;
    } else if (type === 'points') {
        dailyProgress.points += value || 0;
    } else if (type === 'time') {
        dailyProgress.time += value || 0;
    }
    
    saveDailyProgress();
    updateDailyProgressUI();
}

function saveDailyProgress() {
    const storageKey = getUserStorageKey('brightwords_daily_progress');
    localStorage.setItem(storageKey, JSON.stringify(dailyProgress));
}

function loadDailyProgress() {
    if (!currentUser || !currentUser.email) {
        // No user logged in, reset to defaults
        const today = new Date().toDateString();
        dailyProgress = {
            lessons: 0,
            points: 0,
            time: 0,
            date: today
        };
        updateDailyProgressUI();
        return;
    }
    
    const storageKey = getUserStorageKey('brightwords_daily_progress');
    const saved = localStorage.getItem(storageKey);
    if (saved) {
        const parsed = JSON.parse(saved);
        const today = new Date().toDateString();
        
        if (parsed.date === today) {
            dailyProgress = parsed;
        } else {
            dailyProgress = {
                lessons: 0,
                points: 0,
                time: 0,
                date: today
            };
        }
    } else {
        // First time for this user, initialize
        const today = new Date().toDateString();
        dailyProgress = {
            lessons: 0,
            points: 0,
            time: 0,
            date: today
        };
    }
    updateDailyProgressUI();
}

function updateDailyProgressUI() {
    const lessonsEl = document.getElementById('todayLessons');
    const pointsEl = document.getElementById('todayPoints');
    const timeEl = document.getElementById('todayTime');
    
    if (lessonsEl) lessonsEl.textContent = dailyProgress.lessons;
    if (pointsEl) pointsEl.textContent = dailyProgress.points;
    if (timeEl) timeEl.textContent = dailyProgress.time + 'm';
}

function resetDailyProgress() {
    dailyProgress = {
        lessons: 0,
        points: 0,
        time: 0,
        date: new Date().toDateString()
    };
    saveDailyProgress();
    updateDailyProgressUI();
    speak('Daily progress has been reset!');
    playSound('click');
}

// Image Upload and Recognition Functions
let uploadedImageData = null;

// PDF Upload and Reading Functions - Global Variables
let uploadedPdfFile = null;
let pdfTextContent = '';
let pdfPages = [];
let currentPdfPage = 0;
let isReadingPdf = false;
let pdfSpeechUtterance = null;

// YouTube Transcript Functions - Global Variables
let youtubeTranscriptText = '';
let isReadingTranscript = false;
let transcriptSpeechUtterance = null;

// API Key Management Functions (Code-only, no UI)
function initializeApiKey() {
    // Automatically save Gemini API key to localStorage if not already set
    if (USE_GEMINI) {
        const existingKey = localStorage.getItem(API_STORAGE_KEY);
        if (!existingKey && DEFAULT_GEMINI_KEY) {
            localStorage.setItem(API_STORAGE_KEY, DEFAULT_GEMINI_KEY);
            console.log('✅ Gemini API key automatically initialized and saved from code');
        } else if (existingKey) {
            console.log('✅ Using saved Gemini API key');
        }
    } else {
        console.log('✅ Using Hugging Face Inference API (100% free, no API key needed!)');
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file!');
        speak('Please upload an image file');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Image size should be less than 10MB!');
        speak('Image size too large');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageData = e.target.result;
        showImagePreview(uploadedImageData);
        playSound('click');
    };
    reader.readAsDataURL(file);
}

function showImagePreview(imageData) {
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImage');
    const uploadArea = document.getElementById('imageUploadArea');
    const analyzeBtn = document.getElementById('analyzeImageBtn');
    const resultDiv = document.getElementById('imageResult');
    
    if (preview && previewImg) {
        previewImg.src = imageData;
        preview.style.display = 'block';
        if (uploadArea) uploadArea.querySelector('label').style.display = 'none';
        if (analyzeBtn) analyzeBtn.style.display = 'flex';
        if (resultDiv) resultDiv.style.display = 'none';
        speak('Image uploaded successfully');
    }
}

function removeImage() {
    uploadedImageData = null;
    const preview = document.getElementById('imagePreview');
    const uploadArea = document.getElementById('imageUploadArea');
    const analyzeBtn = document.getElementById('analyzeImageBtn');
    const resultDiv = document.getElementById('imageResult');
    const input = document.getElementById('imageUploadInput');
    const label = uploadArea?.querySelector('label');
    
    if (preview) preview.style.display = 'none';
    if (label) label.style.display = 'flex';
    if (analyzeBtn) analyzeBtn.style.display = 'none';
    if (resultDiv) resultDiv.style.display = 'none';
    if (input) input.value = '';
    
    playSound('click');
}

async function analyzeImage() {
    if (!uploadedImageData) {
        alert('Please upload an image first!');
        speak('Please upload an image first');
        return;
    }
    
    const analyzeBtn = document.getElementById('analyzeImageBtn');
    const resultDiv = document.getElementById('imageResult');
    const resultText = document.getElementById('imageResultText');
    
    if (!analyzeBtn || !resultDiv || !resultText) return;
    
    // Show loading state
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '🔍 Analyzing...';
    resultDiv.style.display = 'block';
    resultText.textContent = 'Analyzing image...';
    resultText.style.color = '#6B7280';
    
    playSound('click');
    speak('Analyzing image');
    
    try {
        let analysis = '';
        
        if (USE_GEMINI) {
            // Use Gemini API (uses default key or saved key)
            const apiKey = localStorage.getItem(API_STORAGE_KEY) || DEFAULT_GEMINI_KEY;
            if (!apiKey) {
                resultText.innerHTML = `Please add your Gemini API key first. <br><code style="background: #F3F4F6; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Get free key: https://makersuite.google.com/app/apikey</code>`;
                resultText.style.color = '#EF4444';
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = '🔍 Analyze Image';
                return;
            }
            
            // Convert base64 to blob for Gemini
            const base64Data = uploadedImageData.split(',')[1];
            
            // Detect MIME type from base64 data URL
            let mimeType = 'image/jpeg'; // default
            if (uploadedImageData.startsWith('data:image/png')) {
                mimeType = 'image/png';
            } else if (uploadedImageData.startsWith('data:image/jpeg') || uploadedImageData.startsWith('data:image/jpg')) {
                mimeType = 'image/jpeg';
            } else if (uploadedImageData.startsWith('data:image/gif')) {
                mimeType = 'image/gif';
            } else if (uploadedImageData.startsWith('data:image/webp')) {
                mimeType = 'image/webp';
            }
            
            // Use Gemini API - try multiple endpoints and model combinations
            // Google AI Studio API keys use different endpoints than Google Cloud keys
            const endpointsToTry = [
                { endpoint: 'https://generativelanguage.googleapis.com/v1beta/models', models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro-vision', 'gemini-pro'] },
                { endpoint: 'https://generativelanguage.googleapis.com/v1/models', models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro-vision', 'gemini-pro'] },
                { endpoint: 'https://generativelanguage.googleapis.com/v1beta', models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro-vision'] }
            ];
            
            let response = null;
            let data = null;
            let lastError = null;
            let success = false;
            let usedModel = null;
            let usedEndpoint = null;
            
            // Try each endpoint with its models
            for (const { endpoint, models } of endpointsToTry) {
                for (const model of models) {
                    try {
                        // Try different URL formats
                        const urlFormats = [
                            `${endpoint}/${model}:generateContent?key=${apiKey}`,
                            `${endpoint}/models/${model}:generateContent?key=${apiKey}`
                        ];
                        
                        for (const apiUrl of urlFormats) {
                            try {
                                response = await fetch(apiUrl, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        contents: [{
                                            parts: [
                                                { text: 'What objects do you see in this image? List all main objects with their names, one per line.' },
                                                {
                                                    inline_data: {
                                                        mime_type: mimeType,
                                                        data: base64Data
                                                    }
                                                }
                                            ]
                                        }]
                                    })
                                });
                                
                                data = await response.json();
                                
                                if (response.ok) {
                                    success = true;
                                    usedModel = model;
                                    usedEndpoint = endpoint;
                                    console.log(`✅ Successfully used Gemini model: ${model} with endpoint: ${endpoint}`);
                                    break;
                                } else {
                                    // If it's an auth error, don't try other models
                                    if (response.status === 401 || response.status === 403) {
                                        throw new Error(`API Key Error: ${data?.error?.message || 'Invalid API key or insufficient permissions'}`);
                                    }
                                    lastError = data?.error?.message || `HTTP ${response.status}`;
                                    console.warn(`❌ Gemini model ${model} at ${endpoint} failed: ${lastError}`);
                                }
                            } catch (fetchErr) {
                                lastError = fetchErr.message;
                                continue;
                            }
                        }
                        
                        if (success) break;
                    } catch (err) {
                        lastError = err.message;
                        console.warn(`❌ Error trying ${model}:`, err);
                        continue;
                    }
                }
                
                if (success) break;
            }
            
            if (!success) {
                // Try to get list of available models for better error message
                try {
                    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
                    const listResponse = await fetch(listUrl);
                    if (listResponse.ok) {
                        const listData = await listResponse.json();
                        const availableModels = listData?.models?.map(m => m.name).join(', ') || 'Unable to retrieve';
                        lastError = `${lastError}. Available models: ${availableModels}`;
                    }
                } catch (listErr) {
                    console.warn('Could not list models:', listErr);
                }
                
                throw new Error(`Gemini API Error: ${lastError || 'All model attempts failed'}. Please verify your API key is from https://makersuite.google.com/app/apikey and has Gemini API access enabled.`);
            }
            
            // Extract analysis from successful Gemini response
            analysis = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not analyze image.';
            
            if (!analysis || analysis.trim() === '') {
                throw new Error('Gemini API returned empty response. Please try again.');
            }
        }
        
        if (!analysis || analysis.trim() === '') {
            throw new Error('No content received from API. Please try again.');
        }
        
        // Display the results - ensure the div is visible
        resultDiv.style.display = 'block';
        resultText.innerHTML = analysis.replace(/\n/g, '<br>');
        resultText.style.color = '#1F2937';
        resultText.style.display = 'block';
        
        // Scroll to results
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Speak the object names (limit length for TTS)
        const objectNames = analysis.split('\n').filter(line => line.trim()).slice(0, 10).join(', ');
        const speakText = objectNames.length > 100 ? 'I found several objects in the image' : `I found these objects: ${objectNames}`;
        speak(speakText);
        playSound('success');
        
    } catch (error) {
        console.error('Image analysis error:', error);
        
        let errorMessage = error.message || 'Unknown error occurred';
        let helpfulMessage = '';
        
        // Provide helpful error messages based on error type
        if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
            helpfulMessage = `
                <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px; border-radius: 8px; margin-top: 8px;">
                    <strong style="color: #DC2626;">⚠️ API Quota Issue</strong>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #991B1B;">
                        Your Gemini API quota may have been exceeded. Please check your Google Cloud Console or try again later.
                    </p>
                </div>
            `;
        } else if (errorMessage.includes('401') || errorMessage.includes('Invalid') || errorMessage.includes('API key')) {
            helpfulMessage = `
                <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px; border-radius: 8px; margin-top: 8px;">
                    <strong style="color: #DC2626;">⚠️ API Key Issue</strong>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #991B1B;">
                        Please verify your Gemini API key is correct and has access to the Gemini API. Get your key at: <a href="https://makersuite.google.com/app/apikey" target="_blank" style="color: #DC2626;">https://makersuite.google.com/app/apikey</a>
                    </p>
                </div>
            `;
        } else if (errorMessage.includes('not found') || errorMessage.includes('not supported')) {
            helpfulMessage = `
                <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px; border-radius: 8px; margin-top: 8px;">
                    <strong style="color: #DC2626;">⚠️ Model Not Available</strong>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #991B1B;">
                        The Gemini model may not be available. Please check your API key permissions or try again later.
                    </p>
                </div>
            `;
        } else {
            helpfulMessage = `
                <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px; border-radius: 8px; margin-top: 8px;">
                    <strong style="color: #DC2626;">⚠️ Error Details</strong>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #991B1B;">
                        ${errorMessage}
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #991B1B;">
                        Please check your API key and try again. If the problem persists, check the browser console for more details.
                    </p>
                </div>
            `;
        }
        
        resultText.innerHTML = `<strong style="color: #DC2626;">Error:</strong> ${errorMessage}${helpfulMessage}`;
        resultText.style.color = '#EF4444';
        resultDiv.style.display = 'block';
        speak('Error analyzing image. Please check your API key and billing.');
        playSound('error');
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '🔍 Analyze Image';
    }
}

// PDF Upload and Reading Functions
function handlePdfUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please upload a PDF file!');
        speak('Please upload a PDF file');
        playSound('error');
        return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
        alert('PDF size should be less than 50MB!');
        speak('PDF size too large');
        playSound('error');
        return;
    }
    
    uploadedPdfFile = file;
    showPdfInfo(file);
    parsePdf(file);
    playSound('click');
}

function showPdfInfo(file) {
    const pdfInfo = document.getElementById('pdfInfo');
    const pdfFileName = document.getElementById('pdfFileName');
    const uploadArea = document.getElementById('pdfUploadArea');
    const pdfControls = document.getElementById('pdfControls');
    const pdfContent = document.getElementById('pdfContent');
    
    if (pdfInfo && pdfFileName) {
        pdfFileName.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        pdfInfo.style.display = 'flex';
        if (uploadArea) uploadArea.querySelector('label').style.display = 'none';
    }
    
    if (pdfControls) pdfControls.style.display = 'block';
    if (pdfContent) pdfContent.style.display = 'none';
    
    speak('PDF uploaded successfully');
}

async function parsePdf(file) {
    const pdfTextContainer = document.getElementById('pdfTextContainer');
    const pdfText = document.getElementById('pdfText');
    const pdfControls = document.getElementById('pdfControls');
    const readBtn = document.getElementById('readPdfBtn');
    
    if (!pdfTextContainer || !pdfText) return;
    
    // Show loading state
    pdfText.innerHTML = '<div style="text-align: center; padding: 20px; color: #6B7280;">📄 Loading PDF...</div>';
    pdfTextContainer.style.display = 'block';
    if (readBtn) readBtn.disabled = true;
    if (readBtn) readBtn.textContent = '⏳ Processing PDF...';
    
    try {
        // Set up PDF.js worker
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        
        pdfPages = [];
        pdfTextContent = '';
        let fullText = '';
        
        // Extract text from each page
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            
            pdfPages.push({
                pageNum: pageNum,
                text: pageText
            });
            
            fullText += `\n\n--- Page ${pageNum} ---\n\n${pageText}`;
        }
        
        pdfTextContent = fullText.trim();
        
        // Display the text
        const formattedText = pdfTextContent.split('\n').map(line => {
            if (line.startsWith('--- Page')) {
                return `<div class="pdf-page-break">${line}</div>`;
            }
            return `<div class="pdf-text-line">${line}</div>`;
        }).join('');
        
        pdfText.innerHTML = formattedText;
        
        const pdfContent = document.getElementById('pdfContent');
        if (pdfContent) pdfContent.style.display = 'block';
        
        if (readBtn) {
            readBtn.disabled = false;
            readBtn.textContent = `🔊 Read PDF (${numPages} pages)`;
        }
        
        speak(`PDF loaded successfully. ${numPages} pages found.`);
        playSound('success');
        
    } catch (error) {
        console.error('PDF parsing error:', error);
        pdfText.innerHTML = `<div style="color: #EF4444; padding: 20px; text-align: center;">
            ❌ Error reading PDF: ${error.message}<br>
            <small>Please make sure the PDF is not password-protected or corrupted.</small>
        </div>`;
        speak('Error reading PDF file');
        playSound('error');
        
        if (readBtn) {
            readBtn.disabled = true;
            readBtn.textContent = '🔊 Read PDF';
        }
    }
}

function readPdf() {
    if (!pdfTextContent || pdfTextContent.trim() === '') {
        alert('No PDF content to read!');
        speak('No PDF content available');
        return;
    }
    
    if (isReadingPdf) {
        resumePdfReading();
        return;
    }
    
    isReadingPdf = true;
    currentPdfPage = 0;
    
    const readBtn = document.getElementById('readPdfBtn');
    const pauseBtn = document.getElementById('pausePdfBtn');
    const stopBtn = document.getElementById('stopPdfBtn');
    const progressDiv = document.getElementById('pdfProgress');
    const progressFill = document.getElementById('pdfProgressFill');
    const progressText = document.getElementById('pdfProgressText');
    
    if (readBtn) readBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'block';
    if (stopBtn) stopBtn.style.display = 'block';
    if (progressDiv) progressDiv.style.display = 'block';
    
    // Split text into chunks for better reading
    const sentences = pdfTextContent.split(/[.!?]+\s+/).filter(s => s.trim().length > 0);
    let currentSentenceIndex = 0;
    const totalSentences = sentences.length;
    
    function readNextSentence() {
        if (!isReadingPdf || currentSentenceIndex >= totalSentences) {
            stopPdfReading();
            return;
        }
        
        const sentence = sentences[currentSentenceIndex].trim();
        if (!sentence) {
            currentSentenceIndex++;
            readNextSentence();
            return;
        }
        
        // Update progress
        const progress = ((currentSentenceIndex + 1) / totalSentences) * 100;
        if (progressFill) progressFill.style.width = `${progress}%`;
        
        // Find which page we're on
        const pageNum = Math.floor((currentSentenceIndex / totalSentences) * pdfPages.length) + 1;
        if (progressText) {
            progressText.textContent = `Reading page ${pageNum} of ${pdfPages.length}... (${currentSentenceIndex + 1}/${totalSentences} sentences)`;
        }
        
        // Create speech utterance
        pdfSpeechUtterance = new SpeechSynthesisUtterance(sentence);
        pdfSpeechUtterance.rate = settings.ttsRate || 1.0;
        pdfSpeechUtterance.pitch = 1.0;
        pdfSpeechUtterance.volume = 1.0;
        
        pdfSpeechUtterance.onend = () => {
            currentSentenceIndex++;
            setTimeout(readNextSentence, 300); // Small pause between sentences
        };
        
        pdfSpeechUtterance.onerror = (error) => {
            console.error('Speech error:', error);
            currentSentenceIndex++;
            setTimeout(readNextSentence, 300);
        };
        
        window.speechSynthesis.speak(pdfSpeechUtterance);
    }
    
    readNextSentence();
    playSound('click');
}

function pausePdfReading() {
    if (!isReadingPdf) return;
    
    window.speechSynthesis.pause();
    
    const pauseBtn = document.getElementById('pausePdfBtn');
    const resumeBtn = document.getElementById('readPdfBtn');
    
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (resumeBtn) {
        resumeBtn.style.display = 'block';
        resumeBtn.textContent = '▶️ Resume Reading';
    }
    
    playSound('click');
}

function resumePdfReading() {
    if (!isReadingPdf) return;
    
    window.speechSynthesis.resume();
    
    const pauseBtn = document.getElementById('pausePdfBtn');
    const resumeBtn = document.getElementById('readPdfBtn');
    
    if (pauseBtn) pauseBtn.style.display = 'block';
    if (resumeBtn) resumeBtn.style.display = 'none';
    
    playSound('click');
}

function stopPdfReading() {
    isReadingPdf = false;
    window.speechSynthesis.cancel();
    pdfSpeechUtterance = null;
    
    const readBtn = document.getElementById('readPdfBtn');
    const pauseBtn = document.getElementById('pausePdfBtn');
    const stopBtn = document.getElementById('stopPdfBtn');
    const progressDiv = document.getElementById('pdfProgress');
    
    if (readBtn) {
        readBtn.style.display = 'block';
        readBtn.textContent = `🔊 Read PDF (${pdfPages.length} pages)`;
    }
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'none';
    if (progressDiv) progressDiv.style.display = 'none';
    
    const progressFill = document.getElementById('pdfProgressFill');
    if (progressFill) progressFill.style.width = '0%';
    
    speak('Reading stopped');
    playSound('click');
}

function removePdf() {
    stopPdfReading();
    
    uploadedPdfFile = null;
    pdfTextContent = '';
    pdfPages = [];
    currentPdfPage = 0;
    
    const pdfInfo = document.getElementById('pdfInfo');
    const uploadArea = document.getElementById('pdfUploadArea');
    const pdfControls = document.getElementById('pdfControls');
    const pdfContent = document.getElementById('pdfContent');
    const pdfInput = document.getElementById('pdfUploadInput');
    const label = uploadArea?.querySelector('label');
    
    if (pdfInfo) pdfInfo.style.display = 'none';
    if (label) label.style.display = 'flex';
    if (pdfControls) pdfControls.style.display = 'none';
    if (pdfContent) pdfContent.style.display = 'none';
    if (pdfInput) pdfInput.value = '';
    
    playSound('click');
    speak('PDF removed');
}

function initPdfUploadDragDrop() {
    const pdfUploadArea = document.getElementById('pdfUploadArea');
    if (!pdfUploadArea) return;
    
    const pdfInput = document.getElementById('pdfUploadInput');
    
    pdfUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        pdfUploadArea.classList.add('drag-over');
    });
    
    pdfUploadArea.addEventListener('dragleave', () => {
        pdfUploadArea.classList.remove('drag-over');
    });
    
    pdfUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        pdfUploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && (files[0].type === 'application/pdf' || files[0].name.toLowerCase().endsWith('.pdf'))) {
            if (pdfInput) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(files[0]);
                pdfInput.files = dataTransfer.files;
                handlePdfUpload({ target: pdfInput });
            }
        } else {
            alert('Please drop a PDF file!');
            speak('Please drop a PDF file');
        }
    });
}

// YouTube Transcript Functions
function extractVideoId(url) {
    if (!url) return null;
    
    // Handle various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
}

async function fetchYouTubeTranscript() {
    const urlInput = document.getElementById('youtubeUrlInput');
    const fetchBtn = document.getElementById('fetchTranscriptBtn');
    const transcriptContent = document.getElementById('youtubeTranscriptContent');
    const transcriptText = document.getElementById('transcriptText');
    const videoInfo = document.getElementById('youtubeVideoInfo');
    const videoTitle = document.getElementById('youtubeVideoTitle');
    const transcriptControls = document.getElementById('youtubeTranscriptControls');
    
    if (!urlInput || !fetchBtn) return;
    
    const url = urlInput.value.trim();
    if (!url) {
        alert('Please enter a YouTube URL!');
        speak('Please enter a YouTube URL');
        playSound('error');
        return;
    }
    
    const videoId = extractVideoId(url);
    if (!videoId) {
        alert('Invalid YouTube URL! Please make sure the URL is correct.');
        speak('Invalid YouTube URL');
        playSound('error');
        return;
    }
    
    // Show loading state
    fetchBtn.disabled = true;
    fetchBtn.textContent = '⏳ Fetching Transcript...';
    if (transcriptText) transcriptText.innerHTML = '<div style="text-align: center; padding: 20px; color: #6B7280;">Loading transcript...</div>';
    if (transcriptContent) transcriptContent.style.display = 'block';
    
    playSound('click');
    speak('Fetching YouTube transcript');
    
    try {
        // Try to fetch transcript using a CORS proxy and YouTube's transcript API
        // Using a free CORS proxy service
        const transcriptUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`;
        
        // First, try to get video info
        const videoInfoUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        
        let videoTitleText = 'YouTube Video';
        try {
            const infoResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(videoInfoUrl)}`);
            if (infoResponse.ok) {
                const responseText = await infoResponse.text();
                if (responseText && responseText.trim()) {
                    try {
                        const infoData = JSON.parse(responseText);
                        if (infoData.contents) {
                            const info = JSON.parse(infoData.contents);
                            videoTitleText = info.title || 'YouTube Video';
                        }
                    } catch (e) {
                        console.log('Could not parse video info JSON:', e);
                    }
                }
            }
        } catch (e) {
            console.log('Could not fetch video title:', e);
        }
        
        if (videoTitle) {
            videoTitle.textContent = `📹 ${videoTitleText}`;
            videoInfo.style.display = 'flex';
        }
        
        // Fetch transcript using CORS proxy
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(transcriptUrl)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get response as text first to check if it's valid
        const responseText = await response.text();
        
        if (!responseText || !responseText.trim()) {
            throw new Error('Empty response from transcript API. The video may not have captions enabled.');
        }
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (jsonError) {
            // If JSON parsing fails, try to use the response directly as XML
            console.log('Response is not JSON, trying to parse as XML directly:', jsonError);
            
            // Try to parse as XML directly
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(responseText, 'text/xml');
            const parseError = xmlDoc.querySelector('parsererror');
            
            if (parseError) {
                throw new Error('Could not parse transcript. The video may not have captions available or the API returned an invalid response.');
            }
            
            // If we can parse it as XML, use it directly
            const textElements = xmlDoc.getElementsByTagName('text');
            
            if (textElements.length === 0) {
                throw new Error('No transcript available for this video. The video may not have captions enabled.');
            }
            
            // Extract text from transcript
            let fullTranscript = '';
            const transcriptLines = [];
            
            for (let i = 0; i < textElements.length; i++) {
                const text = textElements[i].textContent || '';
                const start = textElements[i].getAttribute('start') || '';
                if (text.trim()) {
                    transcriptLines.push({
                        text: text.trim(),
                        time: parseFloat(start)
                    });
                    fullTranscript += text.trim() + ' ';
                }
            }
            
            youtubeTranscriptText = fullTranscript.trim();
            
            // Format transcript with timestamps
            const formattedTranscript = transcriptLines.map((line, index) => {
                const minutes = Math.floor(line.time / 60);
                const seconds = Math.floor(line.time % 60);
                const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                return `<div class="transcript-line" data-time="${line.time}">
                    <span class="transcript-time">[${timeStr}]</span>
                    <span class="transcript-text-content">${line.text}</span>
                </div>`;
            }).join('');
            
            if (transcriptText) {
                transcriptText.innerHTML = formattedTranscript || '<div style="color: #EF4444;">No transcript text found.</div>';
            }
            
            if (transcriptControls) transcriptControls.style.display = 'block';
            
            fetchBtn.disabled = false;
            fetchBtn.textContent = '📝 Get Transcript';
            
            speak(`Transcript loaded successfully. ${transcriptLines.length} lines found.`);
            playSound('success');
            return; // Exit early since we've processed it
        }
        
        if (!data || !data.contents) {
            throw new Error('No transcript content received from API');
        }
        
        // Parse XML transcript
        if (!data.contents || typeof data.contents !== 'string') {
            throw new Error('Invalid transcript content format');
        }
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
        
        // Check for XML parsing errors
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            throw new Error('Could not parse transcript XML. The video may not have captions available.');
        }
        
        const textElements = xmlDoc.getElementsByTagName('text');
        
        if (textElements.length === 0) {
            throw new Error('No transcript available for this video. The video may not have captions enabled.');
        }
        
        // Extract text from transcript
        let fullTranscript = '';
        const transcriptLines = [];
        
        for (let i = 0; i < textElements.length; i++) {
            const text = textElements[i].textContent || '';
            const start = textElements[i].getAttribute('start') || '';
            if (text.trim()) {
                transcriptLines.push({
                    text: text.trim(),
                    time: parseFloat(start)
                });
                fullTranscript += text.trim() + ' ';
            }
        }
        
        youtubeTranscriptText = fullTranscript.trim();
        
        // Format transcript with timestamps
        const formattedTranscript = transcriptLines.map((line, index) => {
            const minutes = Math.floor(line.time / 60);
            const seconds = Math.floor(line.time % 60);
            const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            return `<div class="transcript-line" data-time="${line.time}">
                <span class="transcript-time">[${timeStr}]</span>
                <span class="transcript-text-content">${line.text}</span>
            </div>`;
        }).join('');
        
        if (transcriptText) {
            transcriptText.innerHTML = formattedTranscript || '<div style="color: #EF4444;">No transcript text found.</div>';
        }
        
        if (transcriptControls) transcriptControls.style.display = 'block';
        
        fetchBtn.disabled = false;
        fetchBtn.textContent = '📝 Get Transcript';
        
        speak(`Transcript loaded successfully. ${transcriptLines.length} lines found.`);
        playSound('success');
        
    } catch (error) {
        console.error('Transcript fetch error:', error);
        
        let errorMessage = error.message || 'Failed to fetch transcript';
        let helpfulMessage = '';
        
        if (errorMessage.includes('No transcript available') || errorMessage.includes('captions')) {
            helpfulMessage = `
                <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px; border-radius: 8px; margin-top: 8px;">
                    <strong style="color: #DC2626;">⚠️ No Transcript Available</strong>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #991B1B;">
                        This video doesn't have captions/transcripts enabled. To get a transcript:
                    </p>
                    <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #991B1B;">
                        <li>The video creator needs to enable captions</li>
                        <li>Try a different video that has captions</li>
                        <li>Some videos have auto-generated captions that may not be available via API</li>
                    </ul>
                </div>
            `;
        } else {
            helpfulMessage = `
                <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px; border-radius: 8px; margin-top: 8px;">
                    <strong style="color: #DC2626;">⚠️ Error</strong>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #991B1B;">
                        ${errorMessage}
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #991B1B;">
                        Please check the video URL and try again. Make sure the video has captions enabled.
                    </p>
                </div>
            `;
        }
        
        if (transcriptText) {
            transcriptText.innerHTML = `<div style="color: #EF4444; padding: 20px; text-align: center;">
                ❌ ${errorMessage}${helpfulMessage}
            </div>`;
        }
        
        fetchBtn.disabled = false;
        fetchBtn.textContent = '📝 Get Transcript';
        
        speak('Error fetching transcript');
        playSound('error');
    }
}

function readYouTubeTranscript() {
    if (!youtubeTranscriptText || youtubeTranscriptText.trim() === '') {
        alert('No transcript to read!');
        speak('No transcript available');
        return;
    }
    
    if (isReadingTranscript) {
        resumeTranscriptReading();
        return;
    }
    
    isReadingTranscript = true;
    
    const readBtn = document.getElementById('readTranscriptBtn');
    const pauseBtn = document.getElementById('pauseTranscriptBtn');
    const stopBtn = document.getElementById('stopTranscriptBtn');
    
    if (readBtn) readBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'block';
    if (stopBtn) stopBtn.style.display = 'block';
    
    // Split text into sentences for better reading
    const sentences = youtubeTranscriptText.split(/[.!?]+\s+/).filter(s => s.trim().length > 0);
    let currentSentenceIndex = 0;
    const totalSentences = sentences.length;
    
    function readNextSentence() {
        if (!isReadingTranscript || currentSentenceIndex >= totalSentences) {
            stopTranscriptReading();
            return;
        }
        
        const sentence = sentences[currentSentenceIndex].trim();
        if (!sentence) {
            currentSentenceIndex++;
            readNextSentence();
            return;
        }
        
        // Create speech utterance
        transcriptSpeechUtterance = new SpeechSynthesisUtterance(sentence);
        transcriptSpeechUtterance.rate = settings.ttsRate || 1.0;
        transcriptSpeechUtterance.pitch = 1.0;
        transcriptSpeechUtterance.volume = 1.0;
        
        transcriptSpeechUtterance.onend = () => {
            currentSentenceIndex++;
            setTimeout(readNextSentence, 300); // Small pause between sentences
        };
        
        transcriptSpeechUtterance.onerror = (error) => {
            console.error('Speech error:', error);
            currentSentenceIndex++;
            setTimeout(readNextSentence, 300);
        };
        
        window.speechSynthesis.speak(transcriptSpeechUtterance);
    }
    
    readNextSentence();
    playSound('click');
}

function pauseTranscriptReading() {
    if (!isReadingTranscript) return;
    
    window.speechSynthesis.pause();
    
    const pauseBtn = document.getElementById('pauseTranscriptBtn');
    const resumeBtn = document.getElementById('readTranscriptBtn');
    
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (resumeBtn) {
        resumeBtn.style.display = 'block';
        resumeBtn.textContent = '▶️ Resume Reading';
    }
    
    playSound('click');
}

function resumeTranscriptReading() {
    if (!isReadingTranscript) return;
    
    window.speechSynthesis.resume();
    
    const pauseBtn = document.getElementById('pauseTranscriptBtn');
    const resumeBtn = document.getElementById('readTranscriptBtn');
    
    if (pauseBtn) pauseBtn.style.display = 'block';
    if (resumeBtn) resumeBtn.style.display = 'none';
    
    playSound('click');
}

function stopTranscriptReading() {
    isReadingTranscript = false;
    window.speechSynthesis.cancel();
    transcriptSpeechUtterance = null;
    
    const readBtn = document.getElementById('readTranscriptBtn');
    const pauseBtn = document.getElementById('pauseTranscriptBtn');
    const stopBtn = document.getElementById('stopTranscriptBtn');
    
    if (readBtn) {
        readBtn.style.display = 'block';
        readBtn.textContent = '🔊 Read Transcript';
    }
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'none';
    
    speak('Reading stopped');
    playSound('click');
}

function clearYouTubeTranscript() {
    stopTranscriptReading();
    
    youtubeTranscriptText = '';
    
    const urlInput = document.getElementById('youtubeUrlInput');
    const videoInfo = document.getElementById('youtubeVideoInfo');
    const transcriptContent = document.getElementById('youtubeTranscriptContent');
    const transcriptControls = document.getElementById('youtubeTranscriptControls');
    
    if (urlInput) urlInput.value = '';
    if (videoInfo) videoInfo.style.display = 'none';
    if (transcriptContent) transcriptContent.style.display = 'none';
    if (transcriptControls) transcriptControls.style.display = 'none';
    
    playSound('click');
    speak('Transcript cleared');
}

function initYouTubeTranscript() {
    const urlInput = document.getElementById('youtubeUrlInput');
    if (!urlInput) return;
    
    // Allow Enter key to trigger transcript fetch
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            fetchYouTubeTranscript();
        }
    });
    
    // Auto-focus the input
    setTimeout(() => {
        urlInput.focus();
    }, 200);
}

// Initialize drag and drop for image upload
function initImageUploadDragDrop() {
    const uploadArea = document.getElementById('imageUploadArea');
    if (!uploadArea) return;
    
    const label = uploadArea.querySelector('label');
    if (!label) return;
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        label.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
        label.style.borderColor = 'var(--primary-purple)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        label.style.backgroundColor = '';
        label.style.borderColor = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        label.style.backgroundColor = '';
        label.style.borderColor = '';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const input = document.getElementById('imageUploadInput');
            if (input) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                input.files = dataTransfer.files;
                handleImageUpload({ target: input });
            }
        } else {
            alert('Please drop an image file!');
        }
    });
}

// Streak Tracking Functions
function updateStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    // If first time or new day
    if (!streakData.lastActivityDate) {
        streakData.currentStreak = 1;
        streakData.lastActivityDate = today;
    } else if (streakData.lastActivityDate === today) {
        // Already updated today, no change needed
        return;
    } else if (streakData.lastActivityDate === yesterdayStr) {
        // Consecutive day - increment streak
        streakData.currentStreak += 1;
        streakData.lastActivityDate = today;
    } else {
        // Streak broken - reset to 1
        streakData.currentStreak = 1;
        streakData.lastActivityDate = today;
    }
    
    // Update longest streak if needed
    if (streakData.currentStreak > streakData.longestStreak) {
        streakData.longestStreak = streakData.currentStreak;
    }
    
    saveStreakData();
    updateStreakUI();
}

function saveStreakData() {
    const storageKey = getUserStorageKey('brightwords_streak');
    localStorage.setItem(storageKey, JSON.stringify(streakData));
}

function loadStreakData() {
    if (!currentUser || !currentUser.email) {
        // No user logged in, reset to defaults
        streakData = { currentStreak: 0, lastActivityDate: null, longestStreak: 0 };
        updateStreakUI();
        return;
    }
    
    const storageKey = getUserStorageKey('brightwords_streak');
    const saved = localStorage.getItem(storageKey);
    if (saved) {
        try {
            streakData = JSON.parse(saved);
            // Check if streak should be reset (more than 1 day gap)
            if (streakData.lastActivityDate) {
                const today = new Date().toDateString();
                const lastDate = new Date(streakData.lastActivityDate);
                const todayDate = new Date(today);
                const daysDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
                
                if (daysDiff > 1 && streakData.lastActivityDate !== today) {
                    // Streak broken
                    streakData.currentStreak = 0;
                }
            }
        } catch (e) {
            console.warn('Error loading streak data', e);
            streakData = { currentStreak: 0, lastActivityDate: null, longestStreak: 0 };
        }
    } else {
        // First time for this user, initialize
        streakData = { currentStreak: 0, lastActivityDate: null, longestStreak: 0 };
    }
    updateStreakUI();
}

function updateStreakUI() {
    const streakCountEl = document.getElementById('streakCount');
    if (streakCountEl) {
        streakCountEl.textContent = streakData.currentStreak;
    }
}

// Overall Progress Functions
function markModuleCompleted(moduleName) {
    if (overallProgress.moduleProgress[moduleName]) {
        overallProgress.moduleProgress[moduleName].completed += 1;
        overallProgress.totalLessons += 1;
        saveOverallProgress();
        updateProgressUI();
        updateModuleProgressUI();
    }
}

function saveOverallProgress() {
    const progressKey = getUserStorageKey('brightwords_overall_progress');
    const scoreKey = getUserStorageKey('brightwords_total_score');
    localStorage.setItem(progressKey, JSON.stringify(overallProgress));
    localStorage.setItem(scoreKey, score.toString());
}

function loadOverallProgress() {
    if (!currentUser || !currentUser.email) {
        // No user logged in, reset to defaults
        overallProgress = {
            totalLessons: 0,
            totalAchievements: 0,
            totalTime: 0,
            moduleProgress: {
                phonics: { completed: 0, total: 0 },
                spelling: { completed: 0, total: 0 },
                writing: { completed: 0, total: 0 },
                reading: { completed: 0, total: 0 },
                memory: { completed: 0, total: 0 },
                stories: { completed: 0, total: 0 }
            }
        };
        score = 0;
        updateProgressUI();
        updateModuleProgressUI();
        return;
    }
    
    const progressKey = getUserStorageKey('brightwords_overall_progress');
    const scoreKey = getUserStorageKey('brightwords_total_score');
    const saved = localStorage.getItem(progressKey);
    const savedScore = localStorage.getItem(scoreKey);
    
    if (saved) {
        try {
            overallProgress = JSON.parse(saved);
            // Ensure moduleProgress structure exists
            if (!overallProgress.moduleProgress) {
                overallProgress.moduleProgress = {
                    phonics: { completed: 0, total: 0 },
                    spelling: { completed: 0, total: 0 },
                    writing: { completed: 0, total: 0 },
                    reading: { completed: 0, total: 0 },
                    memory: { completed: 0, total: 0 },
                    stories: { completed: 0, total: 0 }
                };
            }
        } catch (e) {
            console.warn('Error loading overall progress', e);
            overallProgress = {
                totalLessons: 0,
                totalAchievements: 0,
                totalTime: 0,
                moduleProgress: {
                    phonics: { completed: 0, total: 0 },
                    spelling: { completed: 0, total: 0 },
                    writing: { completed: 0, total: 0 },
                    reading: { completed: 0, total: 0 },
                    memory: { completed: 0, total: 0 },
                    stories: { completed: 0, total: 0 }
                }
            };
        }
    } else {
        // First time for this user, initialize
        overallProgress = {
            totalLessons: 0,
            totalAchievements: 0,
            totalTime: 0,
            moduleProgress: {
                phonics: { completed: 0, total: 0 },
                spelling: { completed: 0, total: 0 },
                writing: { completed: 0, total: 0 },
                reading: { completed: 0, total: 0 },
                memory: { completed: 0, total: 0 },
                stories: { completed: 0, total: 0 }
            }
        };
    }
    
    if (savedScore) {
        try {
            score = parseInt(savedScore, 10) || 0;
        } catch (e) {
            console.warn('Error loading score', e);
            score = 0;
        }
    } else {
        score = 0;
    }
    
    updateProgressUI();
    updateModuleProgressUI();
}

function updateProgressUI() {
    // Update total points
    const pointsEl = document.getElementById('totalPoints');
    if (pointsEl) {
        pointsEl.textContent = score;
    }
    
    // Update lessons complete
    const lessonsEl = document.getElementById('lessonsComplete');
    if (lessonsEl) {
        lessonsEl.textContent = overallProgress.totalLessons;
    }
    
    // Update achievements
    const achievementsEl = document.getElementById('achievements');
    if (achievementsEl) {
        achievementsEl.textContent = overallProgress.totalAchievements;
    }
    
    // Update time today (from daily progress)
    const timeEl = document.getElementById('timeSpent');
    if (timeEl) {
        const hours = Math.floor(dailyProgress.time / 60);
        const minutes = dailyProgress.time % 60;
        if (hours > 0) {
            timeEl.textContent = `${hours}.${Math.floor(minutes / 6)}h`;
        } else {
            timeEl.textContent = `${minutes}m`;
        }
    }
}

function updateModuleProgressUI() {
    const modules = ['phonics', 'spelling', 'writing', 'reading', 'memory', 'stories'];
    
    modules.forEach(moduleName => {
        const progress = overallProgress.moduleProgress[moduleName];
        if (!progress) return;
        
        // Calculate percentage (based on completed vs total attempts)
        // Each module needs 10 completions to reach 100%
        const maxCompletions = 10;
        const percentage = Math.min(100, Math.floor((progress.completed / maxCompletions) * 100));
        
        // Find the module card and update its progress
        const moduleCards = document.querySelectorAll('.module-card');
        moduleCards.forEach(card => {
            const onclick = card.getAttribute('onclick');
            if (onclick && onclick.includes(`'${moduleName}'`)) {
                const progressBar = card.querySelector('.progress-bar-fill');
                const progressLabel = card.querySelector('.progress-label span:last-child');
                
                if (progressBar) {
                    progressBar.style.width = `${percentage}%`;
                }
                if (progressLabel) {
                    progressLabel.textContent = `${percentage}%`;
                }
            }
        });
    });
}

// Track module completion when activities are successfully completed
function trackModuleCompletion(moduleName) {
    markModuleCompleted(moduleName);
    updateStreak();
    
    // Add time spent on activity (estimate 2-3 minutes per completion)
    const activityTime = 2;
    updateDailyProgress('time', activityTime);
    overallProgress.totalTime += activityTime;
    saveOverallProgress();
    updateProgressUI();
}

// Sign Language navigation - redirects to separate page
function openSignLanguage() {
    window.location.href = 'sign-language.html';
    playSound('click');
}

function openParentsCommunity(event) {
    event.preventDefault();
    
    // Community Group Links
    const whatsappGroupLink = 'https://chat.whatsapp.com/BSkBimGGf4mLmXS7nmO6v5';
    const facebookGroupLink = 'https://www.facebook.com/share/g/17EuP58o8s/';
    
    // Show community information dialog
    showParentsCommunityDialog(whatsappGroupLink, facebookGroupLink);
    playSound('click');
}

function showParentsCommunityDialog(whatsappLink, facebookLink) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'community-modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
        padding: 20px;
        overflow-y: auto;
    `;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'community-modal';
    modal.style.cssText = `
        background: white;
        border-radius: 24px;
        padding: 30px 40px;
        max-width: 500px;
        width: 90%;
        max-height: 85vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
        display: flex;
        flex-direction: column;
        margin: auto;
    `;
    
    modal.innerHTML = `
        <h2 style="font-family: 'Fredoka', cursive; font-size: 28px; color: #1F2937; margin-bottom: 15px; text-align: center;">
            👨‍👩‍👧‍👦 Parents & Community
        </h2>
        <p style="color: #6B7280; text-align: center; margin-bottom: 20px; line-height: 1.6;">
            Join our community where parents and differently abled children can connect, share experiences, and support each other! Choose your preferred platform below.
        </p>
        <div style="background: #F3F4F6; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h3 style="font-size: 18px; color: #1F2937; margin-bottom: 12px; font-weight: 600;">
                🌟 Community Benefits:
            </h3>
            <ul style="color: #4B5563; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Connect with other parents facing similar challenges</li>
                <li>Share learning tips and success stories</li>
                <li>Get support and encouragement</li>
                <li>Help children socialize in a safe environment</li>
            </ul>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
            <button class="join-community-btn" data-link="${whatsappLink}" data-platform="WhatsApp" style="
                background: linear-gradient(135deg, #25D366, #128C7E);
                color: white;
                border: none;
                padding: 18px 24px;
                border-radius: 16px;
                font-size: 18px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            ">
                💬 Join WhatsApp Community
            </button>
            <button class="join-community-btn" data-link="${facebookLink}" data-platform="Facebook" style="
                background: linear-gradient(135deg, #1877F2, #42A5F5);
                color: white;
                border: none;
                padding: 18px 24px;
                border-radius: 16px;
                font-size: 18px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            ">
                📘 Join Facebook Community
            </button>
            <button class="close-community-modal" style="
                background: #F3F4F6;
                color: #1F2937;
                border: none;
                padding: 12px 24px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
            ">
                Maybe Later
            </button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add custom scrollbar styling for the modal
    const scrollbarStyle = document.createElement('style');
    scrollbarStyle.textContent = `
        .community-modal::-webkit-scrollbar {
            width: 8px;
        }
        .community-modal::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }
        .community-modal::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
        }
        .community-modal::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
    `;
    document.head.appendChild(scrollbarStyle);
    
    // Join button functionality for both WhatsApp and Facebook
    const joinButtons = modal.querySelectorAll('.join-community-btn');
    joinButtons.forEach(btn => {
        const isWhatsApp = btn.getAttribute('data-platform') === 'WhatsApp';
        const shadowColor = isWhatsApp ? 'rgba(37, 211, 102, 0.3)' : 'rgba(24, 119, 242, 0.3)';
        
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = `0 8px 20px ${shadowColor}`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = 'none';
        });
        btn.addEventListener('click', () => {
            const link = btn.getAttribute('data-link');
            const platform = btn.getAttribute('data-platform');
            if (link && link.trim() !== '') {
                window.open(link, '_blank');
                speak(`Opening ${platform} community`);
            } else {
                alert(`${platform} group link not configured. Please contact the administrator.`);
                speak(`${platform} group link not available`);
            }
            closeCommunityModal();
            playSound('click');
        });
    });
    
    // Close button
    modal.querySelector('.close-community-modal').addEventListener('click', closeCommunityModal);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeCommunityModal();
        }
    });
    
    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeCommunityModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    function closeCommunityModal() {
        overlay.style.animation = 'fadeOut 0.3s ease';
        modal.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 300);
        playSound('click');
    }
}

function watchDemo() {
    // YouTube video link for kids with disabilities
    const demoVideoLink = 'https://youtu.be/dm7uXtpNiAQ?si=iteO2qNC-dEDF7AM';
    
    // Show modal popup
    showDemoVideoModal(demoVideoLink);
    playSound('click');
}

function showDemoVideoModal(videoLink) {
    // Get current theme colors
    const root = getComputedStyle(document.documentElement);
    const primaryColor = root.getPropertyValue('--primary-purple').trim() || '#8B5CF6';
    const secondaryColor = root.getPropertyValue('--primary-pink').trim() || '#EC4899';
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'demo-video-modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
        padding: 20px;
    `;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'demo-video-modal';
    modal.style.cssText = `
        background: white;
        border-radius: 24px;
        padding: 40px;
        max-width: 450px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    `;
    
    modal.innerHTML = `
        <h2 style="font-family: 'Fredoka', cursive; font-size: 28px; color: #1F2937; margin-bottom: 20px;">
            📹 Watch Demo Video
        </h2>
        <p style="color: #6B7280; margin-bottom: 30px; line-height: 1.6; font-size: 16px;">
            Watch a video on What is a disability
        </p>
        <button class="watch-video-btn" data-link="${videoLink}" style="
            background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
            color: white;
            border: none;
            padding: 18px 32px;
            border-radius: 16px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            width: 100%;
            max-width: 300px;
        ">
            ▶️ Watch Video
        </button>
        <button class="close-demo-video-modal" style="
            background: #F3F4F6;
            color: #1F2937;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 20px;
            width: 100%;
            max-width: 300px;
        ">
            Cancel
        </button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Watch video button functionality
    const watchVideoBtn = modal.querySelector('.watch-video-btn');
    watchVideoBtn.addEventListener('mouseenter', () => {
        watchVideoBtn.style.transform = 'translateY(-2px)';
        watchVideoBtn.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
    });
    watchVideoBtn.addEventListener('mouseleave', () => {
        watchVideoBtn.style.transform = 'translateY(0)';
        watchVideoBtn.style.boxShadow = 'none';
    });
    watchVideoBtn.addEventListener('click', () => {
        const link = watchVideoBtn.getAttribute('data-link');
        if (link && link.trim() !== '') {
            window.open(link, '_blank', 'noopener,noreferrer');
            speak('Opening demo video');
            playSound('click');
        }
        closeDemoVideoModal();
    });
    
    // Close button
    modal.querySelector('.close-demo-video-modal').addEventListener('click', closeDemoVideoModal);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeDemoVideoModal();
        }
    });
    
    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeDemoVideoModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    function closeDemoVideoModal() {
        overlay.style.animation = 'fadeOut 0.3s ease';
        modal.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 300);
        playSound('click');
    }
}


// Confetti Effect
function createConfetti() {
    // Get current theme colors
    const root = getComputedStyle(document.documentElement);
    const primaryColor = root.getPropertyValue('--primary-purple').trim() || '#8B5CF6';
    const secondaryColor = root.getPropertyValue('--primary-pink').trim() || '#EC4899';
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            // Use theme colors plus some additional colors for variety
            const colors = [primaryColor, secondaryColor, '#3B82F6', '#10B981', '#F59E0B'];
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 3000);
        }, i * 50);
    }
}

function selectSupportCategory(category, silent = false) {
    const profile = supportProfiles[category];
    if (!profile) return;

    currentCategory = category;
    settings = { ...settings, ...profile.settings };
    syncSettingsUI();

    document.querySelectorAll('.support-card').forEach(card => {
        const isActive = card.dataset.category === category;
        card.classList.toggle('active', isActive);
    });

    const messageBox = document.getElementById('categoryMessage');
    if (messageBox) {
        messageBox.textContent = profile.message;
    }
    renderSupportFeatures(category);
    
    if (!silent) {
        speak(profile.announcement);
        playSound('click');
    }
}

function syncSettingsUI() {
    const ttsToggle = document.getElementById('ttsToggle');
    const hintsToggle = document.getElementById('hintsToggle');
    const soundToggle = document.getElementById('soundToggle');
    const difficultySelect = document.getElementById('difficultySelect');

    if (ttsToggle) {
        ttsToggle.classList.toggle('active', settings.tts);
    }
    if (hintsToggle) {
        hintsToggle.classList.toggle('active', settings.hints);
    }
    if (soundToggle) {
        soundToggle.classList.toggle('active', settings.sound);
    }
    if (difficultySelect) {
        difficultySelect.value = settings.difficulty;
    }
}

function setCustomCategory() {
    if (currentCategory === 'custom') return;
    currentCategory = 'custom';
    document.querySelectorAll('.support-card').forEach(card => card.classList.remove('active'));
    const messageBox = document.getElementById('categoryMessage');
    if (messageBox) {
        messageBox.textContent = 'Custom support active. Adjust profiles anytime.';
    }
    renderSupportFeatures('custom');
}

function formatTimestamp(date = new Date()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function fetchAiResponse(prompt) {
    const fallback = FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
    
    try {
        let reply = '';
        
        if (USE_GEMINI) {
            // Use Gemini API (uses default key or saved key)
            const apiKey = localStorage.getItem(API_STORAGE_KEY) || DEFAULT_GEMINI_KEY;
            if (!apiKey) {
                return `Using free Hugging Face API. ${fallback}`;
            }
            
            const response = await fetch(`${GEMINI_API_ENDPOINT}/${GEMINI_CHAT_MODEL}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are BrightWords Whisper Coach, a concise guide for learners. Reply with short, friendly sentences and practical tips. User question: ${prompt}`
                        }]
                    }]
                })
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error?.message || 'API error');
            }
            
            reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || fallback;
        } else {
            // Use Hugging Face API (100% FREE, no API key needed!)
            const response = await fetch(`${HUGGINGFACE_API_ENDPOINT}/${HUGGINGFACE_CHAT_MODEL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    inputs: {
                        text: prompt,
                        past_user_inputs: [],
                        generated_responses: []
                    }
                })
            });
            
            if (!response.ok) {
                if (response.status === 503) {
                    // Model loading, return fallback
                    return `The AI model is starting up. Please try again in a moment. ${fallback}`;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.generated_text) {
                reply = data.generated_text.trim();
            } else if (Array.isArray(data) && data[0]?.generated_text) {
                reply = data[0].generated_text.trim();
            } else {
                reply = fallback;
            }
        }
        
        return reply || fallback;
    } catch (error) {
        console.error('AI error', error);
        return `I'm having trouble reaching the AI right now. ${fallback}`;
    }
}

function renderSupportFeatures(category) {
    if (!supportFeaturePanel) return;
    
    // If no category is selected, show a prompt
    if (!category) {
        supportFeaturePanel.innerHTML = `
            <div class="support-widget" style="text-align: center; padding: 40px 20px;">
                <h3 style="color: var(--primary-purple); margin-bottom: 16px;">👆 Choose Your Support Profile</h3>
                <p style="color: var(--light-text); font-size: 15px; line-height: 1.6;">
                    Select a profile above to unlock personalized learning tools and features tailored to your needs!
                </p>
            </div>
        `;
        return;
    }
    
    const templates = {
        general: `
            <div class="support-widget">
                <h3>📄 PDF Reader</h3>
                <p>Upload a PDF file and we'll read it aloud for you!</p>
                
                <div class="pdf-upload-area" id="pdfUploadArea">
                    <input type="file" id="pdfUploadInput" accept=".pdf" style="display: none;" onchange="handlePdfUpload(event)">
                    <label for="pdfUploadInput" class="upload-label">
                        <span class="upload-icon">📄</span>
                        <span class="upload-text">Click to Upload PDF</span>
                        <span class="upload-hint">or drag and drop</span>
                    </label>
                    <div class="pdf-info" id="pdfInfo" style="display: none;">
                        <div class="pdf-file-name" id="pdfFileName"></div>
                        <button class="remove-pdf-btn" onclick="removePdf()">✖</button>
                    </div>
                </div>
                
                <div class="pdf-controls" id="pdfControls" style="display: none;">
                    <button class="tip-btn" id="readPdfBtn" onclick="readPdf()" style="width: 100%; margin-top: 12px;">
                        🔊 Read PDF
                    </button>
                    <button class="tip-btn" id="pausePdfBtn" onclick="pausePdfReading()" style="width: 100%; margin-top: 8px; display: none;">
                        ⏸️ Pause Reading
                    </button>
                    <button class="tip-btn" id="stopPdfBtn" onclick="stopPdfReading()" style="width: 100%; margin-top: 8px; display: none;">
                        ⏹️ Stop Reading
                    </button>
                    <div class="pdf-progress" id="pdfProgress" style="display: none;">
                        <div class="pdf-progress-bar">
                            <div class="pdf-progress-fill" id="pdfProgressFill"></div>
                        </div>
                        <div class="pdf-progress-text" id="pdfProgressText">Reading page 1 of 10...</div>
                    </div>
                </div>
                
                <div class="pdf-content" id="pdfContent" style="display: none;">
                    <h4>📖 PDF Content:</h4>
                    <div class="pdf-text-container" id="pdfTextContainer">
                        <div class="pdf-text" id="pdfText"></div>
                    </div>
                </div>
            </div>
        `,
        custom: `
            <div class="support-widget">
                <h3>Custom Mix</h3>
                <p>Combine tools from any profile. Adjust settings on the right for a perfect blend.</p>
            </div>
        `,
        blind: `
            <div class="support-widget" aria-label="Blind and low vision activities">
                <h3>🎯 Choose Your Activity</h3>
                <p>Select an activity designed for blind and low vision learners with enhanced audio support and keyboard navigation.</p>
                <div class="blind-activities-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px;">
                    <button class="blind-activity-btn" id="blindPhonicsBtn" onclick="openBlindActivity('phonics')" style="
                        background: linear-gradient(135deg, var(--primary-purple), var(--primary-pink));
                        color: white;
                        border: none;
                        padding: 24px 20px;
                        border-radius: 16px;
                        font-size: 18px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s, box-shadow 0.2s;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    " onmouseenter="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.2)';" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';">
                        <span style="font-size: 32px;">🔤</span>
                        <span>Phonics Fun</span>
                        <span style="font-size: 14px; opacity: 0.9; font-weight: 400;">Master letter sounds with audio feedback</span>
                    </button>
                    <button class="blind-activity-btn" id="blindReadingBtn" onclick="openBlindActivity('reading')" style="
                        background: linear-gradient(135deg, var(--primary-purple), var(--primary-pink));
                        color: white;
                        border: none;
                        padding: 24px 20px;
                        border-radius: 16px;
                        font-size: 18px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s, box-shadow 0.2s;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    " onmouseenter="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.2)';" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';">
                        <span style="font-size: 32px;">📖</span>
                        <span>Story Explorer</span>
                        <span style="font-size: 14px; opacity: 0.9; font-weight: 400;">Discover stories with voice narration</span>
                    </button>
                </div>
            </div>
        `,
        deaf: `
            <div class="support-widget" aria-label="Deaf and hard of hearing activities">
                <h3>🎯 Choose Your Activity</h3>
                <p>Select an activity optimized for visual learning with enhanced visual cues and captions.</p>
                <div class="activity-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;">
                    <button class="activity-option-btn" onclick="openModule('stories')" style="
                        background: linear-gradient(135deg, var(--primary-purple), var(--primary-pink));
                        color: white;
                        border: none;
                        padding: 18px 14px;
                        border-radius: 12px;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s, box-shadow 0.2s;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 6px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    " onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)';" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)';">
                        <span style="font-size: 28px;">🚀</span>
                        <span>Story Creator</span>
                        <span style="font-size: 12px; opacity: 0.9; font-weight: 400;">Create your own adventures with AI-powered story suggestions!</span>
                    </button>
                    <button class="activity-option-btn" onclick="openModule('spelling')" style="
                        background: linear-gradient(135deg, var(--primary-purple), var(--primary-pink));
                        color: white;
                        border: none;
                        padding: 18px 14px;
                        border-radius: 12px;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s, box-shadow 0.2s;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 6px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    " onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)';" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)';">
                        <span style="font-size: 28px;">✏️</span>
                        <span>Spelling Wizard</span>
                        <span style="font-size: 12px; opacity: 0.9; font-weight: 400;">Visual spelling with hints</span>
                    </button>
                </div>
            </div>
        `,
        neurodiverse: `
            <div class="support-widget" aria-label="Games and fun learning activities">
                <h3>🎮 Games</h3>
                <p style="margin-bottom: 16px; color: #4b5563; font-size: 15px;">Fun, engaging games that make learning an adventure! Challenge yourself and level up your skills while having a blast.</p>
                <div class="activity-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;">
                    <button class="activity-option-btn" onclick="openModule('memory')" style="
                        background: linear-gradient(135deg, var(--primary-purple), var(--primary-pink));
                        color: white;
                        border: none;
                        padding: 20px 16px;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s, box-shadow 0.2s;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    " onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)';" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)';">
                        <span style="font-size: 32px;">🧠</span>
                        <span style="font-size: 18px;">Memory Master</span>
                        <span style="font-size: 13px; opacity: 0.9; font-weight: 400;">Boost your memory with fun sequence games and pattern challenges!</span>
                    </button>
                    <button class="activity-option-btn" onclick="openModule('writing')" style="
                        background: linear-gradient(135deg, var(--primary-purple), var(--primary-pink));
                        color: white;
                        border: none;
                        padding: 20px 16px;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s, box-shadow 0.2s;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    " onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)';" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)';">
                        <span style="font-size: 32px;">🎨</span>
                        <span style="font-size: 18px;">Writing Artist</span>
                        <span style="font-size: 13px; opacity: 0.9; font-weight: 400;">Practice letter formation with guided tracing and creative drawing tools!</span>
                    </button>
                </div>
            </div>
        `
    };
    supportFeaturePanel.innerHTML = templates[category] || templates.general;

    if (category === 'general') {
        // Initialize PDF upload drag and drop
        setTimeout(() => {
            initPdfUploadDragDrop();
        }, 100);
    }

    if (category === 'blind') {
        // Announce available activities
        setTimeout(() => {
            speak('Blind and low vision mode activated. You can choose Phonics Fun to learn letter sounds with audio feedback, or Story Explorer to enjoy stories with full narration. Both activities support keyboard navigation.');
        }, 500);
    }

}

// Function to open activities from Blind/Low Vision profile
function openBlindActivity(activityType) {
    if (activityType === 'phonics') {
        speak('Opening Phonics Fun. This activity helps you learn letter sounds with enhanced audio feedback and keyboard navigation.');
        playSound('click');
        setTimeout(() => {
            openModule('phonics');
        }, 1000);
    } else if (activityType === 'reading') {
        speak('Opening Story Explorer. You will hear stories with full narration and can navigate using your keyboard.');
        playSound('click');
        setTimeout(() => {
            openModule('reading');
        }, 1000);
    }
}

function initMotionCarousel() {
    const gallery = document.getElementById('motionGallery');
    const dotsWrapper = document.getElementById('motionDots');
    if (!gallery || !dotsWrapper) return;

    const cards = Array.from(gallery.querySelectorAll('.motion-card'));
    if (cards.length <= 1) {
        dotsWrapper.style.display = 'none';
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let currentSlide = 0;
    let slideWidth = 0;
    let autoTimer = null;

    const getGapValue = () => {
        const styles = window.getComputedStyle(gallery);
        const gap = parseFloat(styles.columnGap || styles.gap || '0');
        return Number.isNaN(gap) ? 0 : gap;
    };

    const recalcSlideWidth = () => {
        const cardWidth = cards[0]?.offsetWidth || 0;
        slideWidth = cardWidth + getGapValue();
    };

    const updateDots = () => {
        dotsWrapper.querySelectorAll('.motion-dot').forEach((dot, idx) => {
            const isActive = idx === currentSlide;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
            dot.tabIndex = isActive ? 0 : -1;
        });
    };

    const goToSlide = (index, { immediate = false } = {}) => {
        currentSlide = (index + cards.length) % cards.length;
        recalcSlideWidth();
        if (immediate) {
            gallery.style.transition = 'none';
        }
        gallery.style.transform = `translateX(-${slideWidth * currentSlide}px)`;
        if (immediate) {
            requestAnimationFrame(() => {
                gallery.style.transition = '';
            });
        }
        updateDots();
    };

    const stopAuto = () => {
        if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
        }
    };

    const startAuto = () => {
        if (prefersReducedMotion) return;
        stopAuto();
        autoTimer = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 5000);
    };

    dotsWrapper.innerHTML = '';
    cards.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'motion-dot';
        dot.type = 'button';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Show accessibility spotlight ${index + 1}`);
        dot.addEventListener('click', () => {
            goToSlide(index);
            startAuto();
        });
        dotsWrapper.appendChild(dot);
    });

    goToSlide(0, { immediate: true });
    startAuto();

    const pauseOnInteraction = () => stopAuto();
    const resumeAuto = () => startAuto();

    gallery.addEventListener('mouseenter', pauseOnInteraction);
    gallery.addEventListener('mouseleave', resumeAuto);
    gallery.addEventListener('focusin', pauseOnInteraction);
    gallery.addEventListener('focusout', resumeAuto);
    dotsWrapper.addEventListener('focusin', pauseOnInteraction);
    dotsWrapper.addEventListener('focusout', resumeAuto);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            goToSlide(currentSlide, { immediate: true });
        }, 200);
    });
}

// Settings Event Listeners
document.getElementById('ttsToggle').onclick = function() {
    this.classList.toggle('active');
    settings.tts = this.classList.contains('active');
    setCustomCategory();
    playSound('click');
};

document.getElementById('hintsToggle').onclick = function() {
    this.classList.toggle('active');
    settings.hints = this.classList.contains('active');
    setCustomCategory();
    playSound('click');
};

document.getElementById('soundToggle').onclick = function() {
    this.classList.toggle('active');
    settings.sound = this.classList.contains('active');
    setCustomCategory();
    playSound('click');
};

document.getElementById('difficultySelect').onchange = function() {
    settings.difficulty = this.value;
    setCustomCategory();
    speak(`Difficulty set to ${this.value}`);
    playSound('click');
};

// Restore session immediately on DOM ready to prevent login screen flash
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        restoreSession();
    });
} else {
    // DOM already loaded, restore immediately
    restoreSession();
}

// Handle direct /home route access - DISABLED for React Router
// React Router handles /home route, so we don't redirect here
// This prevents interference with React Router navigation
// if (window.location.pathname === '/home' && !window.__REACT_ROUTER_CONTEXT__) {
//     window.location.replace('/#home');
// }

// Initialize hash navigation and smooth scrolling
function initHashNavigation() {
    // Handle hash links with smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || !href) return;
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
                // Update URL hash without triggering scroll
                window.history.pushState(null, '', href);
            }
        });
    });
    
    // Handle hash on page load
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const targetElement = document.getElementById(hash);
        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        }
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        if (window.location.hash) {
            const hash = window.location.hash.substring(1);
            const targetElement = document.getElementById(hash);
            if (targetElement) {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }
    });
}

// Initialize on load
window.addEventListener('load', () => {
    // Preload voices
    if (synth.getVoices().length === 0) {
        synth.addEventListener('voiceschanged', () => {
            console.log('Voices loaded');
        });
    }

    syncSettingsUI();
    // Don't auto-select any profile - let users choose
    initMotionCarousel();
    initHashNavigation(); // Initialize hash navigation
    bootstrapAuth();
    
    // Initialize API key - auto-save if not already in localStorage
    initializeApiKey();
    
    // Load default theme if no user is logged in
    // (User-specific theme will be loaded in unlockApp if user is logged in)
    if (!currentUser || !currentUser.email) {
        loadColorTheme();
    }
    
    // Note: Progress data will be loaded after authentication in unlockApp()
    // This ensures we load the correct user's data
});

function bootstrapAuth() {
    // Session already restored on DOMContentLoaded, just ensure it's set up
    if (!currentUser) {
        restoreSession();
    }
    registerSignOut();
    waitForGoogleClient(initializeGoogleAuth);
}

function waitForGoogleClient(callback, attempt = 0) {
    if (window.google?.accounts?.id) {
        callback();
        return;
    }

    if (attempt > 100) {
        console.warn('Google Identity Services failed to load.');
        return;
    }

    setTimeout(() => waitForGoogleClient(callback, attempt + 1), 150);
}

function initializeGoogleAuth() {
    const buttonContainer = document.getElementById('googleSignInButton');
    if (!buttonContainer || !window.google?.accounts?.id) return;

    buttonContainer.innerHTML = '';
    window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        cancel_on_tap_outside: true
    });

    window.google.accounts.id.renderButton(buttonContainer, {
        theme: 'filled_blue',
        size: 'large',
        shape: 'pill',
        type: 'standard',
        text: 'continue_with',
        width: 260
    });

    if (!currentUser) {
        window.google.accounts.id.prompt();
    }
}

function handleCredentialResponse(response) {
    if (!response?.credential) return;
    const profile = decodeJwtCredential(response.credential);
    const user = {
        ...profile,
        credential: response.credential,
        loginTime: new Date().toISOString()
    };
    currentUser = user;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    unlockApp(user);
}

function decodeJwtCredential(token) {
    try {
        const payload = token.split('.')[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(base64);
        const jsonPayload = decodeURIComponent(decoded.split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Unable to decode ID token', error);
        return {};
    }
}

function unlockApp(user, options = {}) {
    document.body.classList.add('authenticated');
    document.body.classList.remove('auth-locked');
    const overlay = document.getElementById('authOverlay');
    const app = document.getElementById('appContent');
    if (overlay) {
        overlay.setAttribute('aria-hidden', 'true');
    }
    if (app) {
        app.removeAttribute('aria-hidden');
    }
    updateUserUI(user);
    
    // Load user-specific progress data when they log in
    if (user && user.email) {
        loadOverallProgress();
        loadStreakData();
        loadDailyProgress();
        loadColorTheme();
    }

    if (!options.silent && !hasWelcomedUser) {
        const name = user?.given_name || user?.name || 'Bright Explorer';
        speak(`Welcome ${name}! Let's make learning fun!`);
        hasWelcomedUser = true;
    }
    
    // If we're in an iframe (React Router context), notify parent
    if (window.parent !== window.self) {
        // Send message to parent React Router
        window.parent.postMessage({ type: 'AUTH_SUCCESS', user: user }, '*');
        // If on root page, scroll to home section
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            setTimeout(() => {
                const homeSection = document.getElementById('home');
                if (homeSection) {
                    homeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 500);
        }
    } else if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        // Not in iframe, but on root/login page - scroll to home section
        setTimeout(() => {
            const homeSection = document.getElementById('home');
            if (homeSection) {
                homeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // Also update URL hash if needed
            if (!window.location.hash) {
                window.history.replaceState(null, '', '#home');
            }
        }, 500);
    }
}

function lockApp() {
    // Save current user's data before logging out
    if (currentUser && currentUser.email) {
        saveOverallProgress();
        saveStreakData();
        saveDailyProgress();
    }
    
    document.body.classList.add('auth-locked');
    document.body.classList.remove('authenticated');
    const overlay = document.getElementById('authOverlay');
    const app = document.getElementById('appContent');
    if (overlay) {
        overlay.setAttribute('aria-hidden', 'false');
    }
    if (app) {
        app.setAttribute('aria-hidden', 'true');
    }
    updateUserUI(null);
    
    // Reset progress data when logged out
    score = 0;
    overallProgress = {
        totalLessons: 0,
        totalAchievements: 0,
        totalTime: 0,
        moduleProgress: {
            phonics: { completed: 0, total: 0 },
            spelling: { completed: 0, total: 0 },
            writing: { completed: 0, total: 0 },
            reading: { completed: 0, total: 0 },
            memory: { completed: 0, total: 0 },
            stories: { completed: 0, total: 0 }
        }
    };
    streakData = { currentStreak: 0, lastActivityDate: null, longestStreak: 0 };
    dailyProgress = {
        lessons: 0,
        points: 0,
        time: 0,
        date: new Date().toDateString()
    };
    
    // Clear UI
    updateProgressUI();
    updateStreakUI();
    updateDailyProgressUI();
    updateModuleProgressUI();
}

function updateUserUI(user) {
    const greeting = document.getElementById('userGreeting');
    const signOutBtn = document.getElementById('signOutBtn');
    const profileCard = document.getElementById('userProfileCard');
    const profileName = document.getElementById('userProfileName');
    const profileEmail = document.getElementById('userProfileEmail');
    const profileAvatar = document.getElementById('userProfileAvatar');

    if (user && greeting) {
        greeting.textContent = `Hi, ${user.given_name || 'friend'}!`;
    } else if (greeting) {
        greeting.textContent = '';
    }

    if (signOutBtn) {
        signOutBtn.hidden = !user;
    }

    if (profileCard) {
        if (user) {
            profileCard.hidden = false;
            if (profileName) {
                profileName.textContent = user.name || user.given_name || 'Bright Explorer';
            }
            if (profileEmail) {
                profileEmail.textContent = user.email || 'Logged in with Google';
            }
            if (profileAvatar) {
                profileAvatar.textContent = getUserInitials(user);
            }
        } else {
            profileCard.hidden = true;
        }
    }
}

// Sign Language Generator removed

function restoreSession() {
    const cached = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!cached) {
        lockApp();
        return;
    }

    try {
        const parsed = JSON.parse(cached);
        if (parsed?.credential) {
            // Validate JWT token hasn't expired (Google tokens are valid for 1 hour, but we persist session)
            // We'll keep the session until user explicitly signs out
            const tokenData = decodeJwtCredential(parsed.credential);
            
            // Check if token exists and has required fields
            if (tokenData && tokenData.email) {
                // Token is valid, restore session
                currentUser = parsed;
                // Update login time to keep session fresh
                currentUser.loginTime = new Date().toISOString();
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
                unlockApp(parsed, { silent: true });
                console.log('Session restored for:', tokenData.email);
            } else {
                throw new Error('Invalid token structure');
            }
        } else {
            throw new Error('Invalid session payload');
        }
    } catch (error) {
        console.warn('Clearing invalid auth cache', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        lockApp();
    }
}

function registerSignOut() {
    const signOutBtn = document.getElementById('signOutBtn');
    if (!signOutBtn) return;

    signOutBtn.addEventListener('click', () => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        currentUser = null;
        lockApp();
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        waitForGoogleClient(initializeGoogleAuth);
    });
}

function getUserInitials(user) {
    const source = user?.name || user?.given_name || user?.email || '';
    if (!source) return '👤';
    const initials = source
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0]?.toUpperCase())
        .join('');
    if (initials) return initials;
    return (user.email?.[0] || '👤').toUpperCase();
}

