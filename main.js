// Global Variables
let currentModule = '';
let score = 250;
let currentWord = '';
let settings = {
    tts: true,
    hints: true,
    sound: true,
    difficulty: 'easy'
};
let currentCategory = 'general';
const GOOGLE_CLIENT_ID = '369705995460-d2f937r1bj3963upbmob113ngkf5v6og.apps.googleusercontent.com';
const AUTH_STORAGE_KEY = 'brightwords_google_user';
let currentUser = null;
let hasWelcomedUser = false;

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
        message: 'Neurodiverse-friendly mode enabled. Pace adjusted with extra hints.',
        announcement: 'Neurodiverse support enabled with calm pacing and added hints.',
        settings: { tts: true, hints: true, sound: true, difficulty: 'easy' }
    }
};

// Initialize Speech Synthesis
const synth = window.speechSynthesis;
const supportFeaturePanel = document.getElementById('supportFeaturePanel');
const OPENAI_CHAT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';
const OPENAI_STORAGE_KEY = 'brightwords_openai_key';
const DEFAULT_AI_KEY = '';
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

    // Smooth scroll
    learningArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Close Learning Area
function closeLearningArea() {
    const learningArea = document.getElementById('learningArea');
    learningArea.classList.remove('active');
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

    // Create letter tiles
    const letterGrid = document.getElementById('letterGrid');
    currentWord.split('').forEach((letter) => {
        const tile = document.createElement('div');
        tile.className = 'letter-tile';
        tile.textContent = letter;
        tile.onclick = () => {
            speak(letter, 0.6);
            tile.classList.add('selected');
            setTimeout(() => tile.classList.remove('selected'), 500);
            playSound('click');
        };
        letterGrid.appendChild(tile);
    });

    setTimeout(() => speak(`Let's learn the word: ${currentWord}`), 500);
}

function speakFullWord() {
    speak(currentWord, 0.7);
    playSound('click');
}

function nextPhonicsWord() {
    updateScore(10);
    loadPhonicsGame();
    showFeedback('Great job! Here\'s a new word!');
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
                   style="font-size: 32px; padding: 15px; text-align: center;
                          width: 80%; max-width: 400px; margin: 20px auto;
                          display: block; border: 3px solid #8B5CF6;
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
                    style="border: 3px dashed #8B5CF6; border-radius: 15px;
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
        <div style="padding: 20px;">
            <h3 style="font-size: 28px; margin-bottom: 20px;">The Happy Sun</h3>
            <div style="font-size: 20px; line-height: 2; background: white; padding: 20px; border-radius: 15px;">
                <p id="readingText">
                    The sun was very happy today. It smiled at all the children playing in the park.
                    The birds were singing beautiful songs. Everyone had a wonderful day!
                </p>
            </div>
            <div class="control-panel">
                <button class="control-btn" onclick="readAloud()">
                    🔊 Read Aloud
                </button>
                <button class="control-btn" onclick="highlightWords()">
                    🖍️ Highlight Words
                </button>
            </div>
        </div>
    `;
    makeWordsClickable();
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
                <select id="storyTheme" style="margin-left: 10px; padding: 10px; border-radius: 10px; border: 2px solid #8B5CF6;">
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
                             border: 2px solid #8B5CF6; border-radius: 15px;">
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
        ctx.strokeStyle = '#8B5CF6';
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
}

// Reading functions
function makeWordsClickable() {
    const text = document.getElementById('readingText');
    if (!text) return;

    const words = text.textContent.split(' ');
    text.innerHTML = words.map(word =>
        `<span style="cursor: pointer; padding: 2px;" onclick="speakWord('${word}')">${word}</span>`
    ).join(' ');
}

function speakWord(word) {
    speak(word, 0.6);
}

function readAloud() {
    const text = document.getElementById('readingText');
    if (text) {
        speak(text.textContent, 0.8);
    }
}

function highlightWords() {
    const spans = document.querySelectorAll('#readingText span');
    let delay = 0;

    spans.forEach((span) => {
        setTimeout(() => {
            span.style.backgroundColor = '#FEF3C7';
            speak(span.textContent, 0.7);

            setTimeout(() => {
                span.style.backgroundColor = 'transparent';
            }, 800);
        }, delay);

        delay += 1000;
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
}

// Helper Functions
function updateScore(points) {
    score += points;
    document.getElementById('totalPoints').textContent = score;

    // Check for achievements
    if (score >= 500 && score - points < 500) {
        showAchievement('Master Learner!', 'You reached 500 points!');
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
    const achievementCount = document.getElementById('achievements');
    achievementCount.textContent = parseInt(achievementCount.textContent, 10) + 1;
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

function startLearning() {
    // Scroll to modules section
    document.querySelector('.modules-section').scrollIntoView({ behavior: 'smooth' });
    speak('Choose a module to start learning!');
    playSound('click');
}

function watchDemo() {
    // YouTube video links for dyslexia and dysgraphia
    const dyslexiaVideoLink = 'https://youtu.be/65psPXWzNic?si=7xCTwNf0Fs_ymuDq';
    const dysgraphiaVideoLink = 'https://youtu.be/WMfl5kqSWmk?si=HogwyawIdvY62P1i';
    
    // Show selection dialog
    showVideoSelectionDialog(dyslexiaVideoLink, dysgraphiaVideoLink);
    playSound('click');
}

function showVideoSelectionDialog(dyslexiaLink, dysgraphiaLink) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'video-selection-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'video-selection-modal';
    modal.style.cssText = `
        background: white;
        border-radius: 24px;
        padding: 40px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
    `;
    
    modal.innerHTML = `
        <h2 style="font-family: 'Fredoka', cursive; font-size: 28px; color: #1F2937; margin-bottom: 10px; text-align: center;">
            Choose a Demo Video
        </h2>
        <p style="color: #6B7280; text-align: center; margin-bottom: 30px;">
            Select which video you'd like to watch
        </p>
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <button class="video-option-btn" data-link="${dyslexiaLink}" style="
                background: linear-gradient(135deg, #8B5CF6, #EC4899);
                color: white;
                border: none;
                padding: 18px 24px;
                border-radius: 16px;
                font-size: 18px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                text-align: left;
            ">
                📚 Dyslexia Demo Video
            </button>
            <button class="video-option-btn" data-link="${dysgraphiaLink}" style="
                background: linear-gradient(135deg, #3B82F6, #10B981);
                color: white;
                border: none;
                padding: 18px 24px;
                border-radius: 16px;
                font-size: 18px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                text-align: left;
            ">
                ✏️ Dysgraphia Demo Video
            </button>
            <button class="close-video-modal" style="
                background: #F3F4F6;
                color: #1F2937;
                border: none;
                padding: 12px 24px;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 10px;
            ">
                Cancel
            </button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add hover effects
    const buttons = modal.querySelectorAll('.video-option-btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = 'none';
        });
        btn.addEventListener('click', () => {
            const link = btn.getAttribute('data-link');
            window.open(link, '_blank');
            closeVideoModal();
            speak('Opening demo video');
            playSound('click');
        });
    });
    
    // Close button
    modal.querySelector('.close-video-modal').addEventListener('click', closeVideoModal);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeVideoModal();
        }
    });
    
    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeVideoModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    function closeVideoModal() {
        overlay.style.animation = 'fadeOut 0.3s ease';
        modal.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
        playSound('click');
    }
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(30px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Confetti Effect
function createConfetti() {
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'][Math.floor(Math.random() * 5)];
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
    const apiKey = localStorage.getItem(OPENAI_STORAGE_KEY) || DEFAULT_AI_KEY;
    const fallback = FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
    if (!apiKey) {
        return `Connect ChatGPT by running localStorage.setItem('${OPENAI_STORAGE_KEY}','sk-xxx'). Until then, try this tip: ${fallback}`;
    }

    try {
        const response = await fetch(OPENAI_CHAT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: OPENAI_MODEL,
                temperature: 0.4,
                max_tokens: 200,
                messages: [
                    {
                        role: 'system',
                        content: 'You are BrightWords Whisper Coach, a concise ChatGPT guide for deaf and hard-of-hearing learners. Reply with short, friendly sentences and practical tips.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data?.error?.message || 'ChatGPT is warming up. Please try again.');
        }

        const reply = data?.choices?.[0]?.message?.content?.trim();
        return reply || fallback;
    } catch (error) {
        console.error('AI error', error);
        return `I'm having trouble reaching ChatGPT right now. ${fallback}`;
    }
}

function renderSupportFeatures(category) {
    if (!supportFeaturePanel) return;
    const templates = {
        general: `
            <div class="support-widget">
                <h3>Adaptive Boosts</h3>
                <p>Pick a profile above to unlock tailored helpers like voice guides, visual chats, and focus flows.</p>
            </div>
        `,
        custom: `
            <div class="support-widget">
                <h3>Custom Mix</h3>
                <p>Combine tools from any profile. Adjust settings on the right for a perfect blend.</p>
            </div>
        `,
        blind: `
            <div class="support-widget" aria-label="Voice assistant helper">
                <h3>Voice Assistant</h3>
                <p>Hear friendly guidance that summarizes the current screen and suggests the next step.</p>
                <button class="voice-btn" id="voiceGuideBtn">🔊 Play guidance</button>
            </div>
        `,
        deaf: `
            <div class="support-widget" aria-label="Visual helper chat">
                <h3>ChatGPT Visual Coach</h3>
                <p class="chat-intro">Type a question and get instant text replies tuned for deaf and hard-of-hearing learners.</p>
                <div class="chat-log" id="deafChatLog" aria-live="polite"></div>
                <div class="chat-input">
                    <label for="deafChatInput">Ask a quick question</label>
                    <div class="chat-input-row">
                        <input type="text" id="deafChatInput" placeholder="Type your message..." aria-label="Chat message">
                        <button class="chat-send" id="deafChatSend">Send</button>
                    </div>
                <p class="chat-hint">Powered by ChatGPT. Add <code>localStorage.setItem('${OPENAI_STORAGE_KEY}','sk-xxx')</code> to connect your key.</p>
                </div>
            </div>
        `,
        neurodiverse: `
            <div class="support-widget" aria-label="Focus routine helper">
                <h3>Focus Flow</h3>
                <p>Short bursts with gentle prompts keep things calm and steady.</p>
                <ol>
                    <li>Breathe in for 4 beats</li>
                    <li>Trace or tap for 60 seconds</li>
                    <li>Celebrate, then repeat</li>
                </ol>
                <button class="focus-btn" id="focusFlowBtn">🧘 Start 3-minute flow</button>
                <p id="focusStatus" role="status"></p>
            </div>
        `
    };
    supportFeaturePanel.innerHTML = templates[category] || templates.general;

    if (category === 'blind') {
        const voiceBtn = document.getElementById('voiceGuideBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                startVoiceGuide('Here is a quick tour. Use the navigation to jump between learn, progress, or games. The big purple button starts your next mission.');
            });
        }
    }

    if (category === 'deaf') {
        initChatSupport();
    }

    if (category === 'neurodiverse') {
        const focusBtn = document.getElementById('focusFlowBtn');
        const focusStatus = document.getElementById('focusStatus');
        if (focusBtn && focusStatus) {
            focusBtn.addEventListener('click', () => {
                focusStatus.textContent = 'Starting calm pulse...';
                playSound('click');
                setTimeout(() => {
                    focusStatus.textContent = 'Great! Keep tracing or tapping for 60 seconds.';
                    playSound('success');
                }, 1500);
                setTimeout(() => {
                    focusStatus.textContent = 'Nice work. Take a sip of water and restart if you feel ready.';
                }, 4000);
            });
        }
    }
}

function startVoiceGuide(message) {
    speak(message);
    playSound('click');
}

function initChatSupport() {
    const chatLog = document.getElementById('deafChatLog');
    const chatInput = document.getElementById('deafChatInput');
    const chatSend = document.getElementById('deafChatSend');
    if (!chatLog || !chatInput || !chatSend) return;

    const appendMessage = (role, text, options = {}) => {
        const row = document.createElement('div');
        row.className = `chat-row ${role}`;
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        if (options.typing) {
            bubble.dataset.typing = 'true';
        }
        const textEl = document.createElement('p');
        textEl.textContent = text;
        const stamp = document.createElement('span');
        stamp.textContent = options.typing ? '···' : formatTimestamp();
        bubble.append(textEl, stamp);
        row.appendChild(bubble);
        chatLog.appendChild(row);
        chatLog.scrollTop = chatLog.scrollHeight;
        return { bubble, textEl, stamp };
    };

    const updateMessage = (messageRef, nextText) => {
        if (!messageRef) return;
        messageRef.textEl.textContent = nextText;
        messageRef.stamp.textContent = formatTimestamp();
        messageRef.bubble.dataset.typing = 'false';
    };

    const showTyping = () => appendMessage('coach', 'Typing…', { typing: true });

    const sendMessage = async () => {
        const value = chatInput.value.trim();
        if (!value) return;
        appendMessage('user', value);
        chatInput.value = '';
        chatInput.focus();
        const typingIndicator = showTyping();
        chatSend.disabled = true;
        try {
            const reply = await fetchAiResponse(value);
            updateMessage(typingIndicator, reply);
        } finally {
            chatSend.disabled = false;
        }
    };

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });
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

// Initialize on load
window.addEventListener('load', () => {
    // Preload voices
    if (synth.getVoices().length === 0) {
        synth.addEventListener('voiceschanged', () => {
            console.log('Voices loaded');
        });
    }

    syncSettingsUI();
    selectSupportCategory('general', true);
    initMotionCarousel();
    bootstrapAuth();

    // Animate stats on load
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        const finalValue = stat.textContent;
        stat.textContent = '0';

        setTimeout(() => {
            let current = 0;
            const increment = parseInt(finalValue, 10) / 20;
            const timer = setInterval(() => {
                current += increment;
                if (current >= parseInt(finalValue, 10)) {
                    stat.textContent = finalValue;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.round(current);
                }
            }, 50);
        }, 500);
    });
});

function bootstrapAuth() {
    restoreSession();
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

    if (!options.silent && !hasWelcomedUser) {
        const name = user?.given_name || user?.name || 'Bright Explorer';
        speak(`Welcome ${name}! Let's make learning fun!`);
        hasWelcomedUser = true;
    }
}

function lockApp() {
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

function restoreSession() {
    const cached = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!cached) {
        lockApp();
        return;
    }

    try {
        const parsed = JSON.parse(cached);
        if (parsed?.credential) {
            currentUser = parsed;
            unlockApp(parsed, { silent: true });
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

