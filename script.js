document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        translateBtn: document.getElementById('translate-btn'),
        speakBtn: document.getElementById('speak-btn'),
        copyBtn: document.getElementById('copy-btn'),
        fromText: document.getElementById('english-text'),
        toText: document.getElementById('nepali-text'),
        switchBtns: document.querySelectorAll('.switch-btn'),
        fromLangLabel: document.getElementById('from-lang-label'),
        toLangLabel: document.getElementById('to-lang-label'),
        fromLangFlag: document.getElementById('from-lang-flag'),
        toLangFlag: document.getElementById('to-lang-flag')
    };

    // Update the language configuration
    const languages = {
        'en': {
            name: 'English',
            code: 'en',
            flag: 'us',
            placeholder: 'Enter text in English'
        },
        'ne': {
            name: 'Nepali',
            code: 'ne',
            flag: 'np',
            placeholder: 'नेपाली पाठ यहाँ लेख्नुहोस्'
        },
        'ja': {
            name: 'Japanese',
            code: 'ja',
            flag: 'jp',
            placeholder: 'テキストを入力してください'
        },
        'ko': {
            name: 'Korean',
            code: 'ko',
            flag: 'kr',
            placeholder: '텍스트를 입력하세요'
        }
    };

    let currentFromLang = 'en';
    let currentToLang = 'ne';

    // Update language switch handler
    const switchBtn = document.getElementById('switch-btn');
    const langOptions = document.querySelectorAll('.lang-option');

    function updateLanguageDisplay() {
        const fromLang = languages[currentFromLang];
        const toLang = languages[currentToLang];

        // Update switch button display
        const fromLangPair = switchBtn.querySelector('.from-lang');
        const toLangPair = switchBtn.querySelector('.to-lang');
        
        fromLangPair.innerHTML = `
            <img src="https://flagcdn.com/w20/${fromLang.flag}.png" alt="${fromLang.name}">
            <span>${fromLang.name}</span>
        `;
        
        toLangPair.innerHTML = `
            <img src="https://flagcdn.com/w20/${toLang.flag}.png" alt="${toLang.name}">
            <span>${toLang.name}</span>
        `;

        // Update input fields
        elements.fromLangLabel.textContent = fromLang.name;
        elements.toLangLabel.textContent = toLang.name;
        elements.fromLangFlag.src = `https://flagcdn.com/w20/${fromLang.flag}.png`;
        elements.toLangFlag.src = `https://flagcdn.com/w20/${toLang.flag}.png`;
        elements.fromText.placeholder = fromLang.placeholder;
        elements.toText.placeholder = toLang.placeholder;

        // Clear the text areas
        elements.fromText.value = '';
        elements.toText.value = '';

        // Update speech recognition language if available
        if (recognition) {
            recognition.lang = currentFromLang === 'en' ? 'en-US' : 
                             currentFromLang === 'ja' ? 'ja-JP' : 
                             currentFromLang === 'ko' ? 'ko-KR' : 'ne-NP';
        }
    }

    // Handle language option clicks
    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            const newLang = option.dataset.lang;
            if (newLang !== currentFromLang) {
                currentToLang = newLang;
                updateLanguageDisplay();
            }
        });
    });

    // Handle main switch button click
    switchBtn.addEventListener('click', (e) => {
        if (!e.target.closest('.lang-dropdown')) {
            [currentFromLang, currentToLang] = [currentToLang, currentFromLang];
            switchBtn.classList.toggle('switched');
            updateLanguageDisplay();
        }
    });

    // Speech Recognition Setup
    let recognition = null;
    try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
    } catch (e) {
        elements.speakBtn.style.display = 'none';
        console.error('Speech recognition not supported:', e);
    }

    let isListening = false;

    // Speech Recognition Handler
    if (recognition) {
        elements.speakBtn.addEventListener('click', async () => {
            try {
                // Request microphone permission first
                await navigator.mediaDevices.getUserMedia({ audio: true });
                
                if (!isListening) {
                    // Update language before starting
                    recognition.lang = currentFromLang === 'en' ? 'en-US' : 
                                     currentFromLang === 'ja' ? 'ja-JP' : 
                                     currentFromLang === 'ko' ? 'ko-KR' : 'ne-NP';
                    recognition.start();
                    isListening = true;
                    elements.speakBtn.classList.add('listening');
                    showToast('Listening...');
                } else {
                    recognition.stop();
                    isListening = false;
                    elements.speakBtn.classList.remove('listening');
                }
            } catch (error) {
                console.error('Microphone permission error:', error);
                showToast('Please allow microphone access to use speech recognition', 'error');
                elements.speakBtn.classList.remove('listening');
                isListening = false;
            }
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            elements.fromText.value = transcript;
            elements.speakBtn.classList.remove('listening');
            isListening = false;
            translateText();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            let errorMessage = 'Speech recognition error. Please try again.';
            
            // Provide more specific error messages
            if (event.error === 'not-allowed') {
                errorMessage = 'Microphone access was denied. Please allow microphone access in your browser settings.';
            } else if (event.error === 'no-speech') {
                errorMessage = 'No speech was detected. Please try again.';
            } else if (event.error === 'network') {
                errorMessage = 'Network error occurred. Please check your internet connection.';
            }
            
            showToast(errorMessage, 'error');
            elements.speakBtn.classList.remove('listening');
            isListening = false;
        };

        recognition.onend = () => {
            elements.speakBtn.classList.remove('listening');
            isListening = false;
        };
    }

    // Translation Handler
    async function translateText() {
        if (!elements.fromText.value) {
            showToast('Please enter some text to translate', 'error');
            return;
        }

        elements.translateBtn.disabled = true;
        const originalButtonContent = elements.translateBtn.innerHTML;
        elements.translateBtn.innerHTML = '<div class="loader"></div>';

        try {
            const response = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${currentFromLang}&tl=${currentToLang}&dt=t&q=${encodeURIComponent(elements.fromText.value)}`
            );
            
            if (!response.ok) throw new Error('Translation failed');
            
            const data = await response.json();
            elements.toText.value = data[0][0][0];
            showToast('Translation completed!');
        } catch (error) {
            console.error('Translation error:', error);
            showToast('Translation failed. Please try again.', 'error');
        } finally {
            elements.translateBtn.disabled = false;
            elements.translateBtn.innerHTML = originalButtonContent;
        }
    }

    // Copy Handler
    elements.copyBtn.addEventListener('click', () => {
        if (!elements.toText.value) {
            showToast('Nothing to copy!', 'error');
            return;
        }
        
        navigator.clipboard.writeText(elements.toText.value)
            .then(() => showToast('Translation copied to clipboard!'))
            .catch(() => showToast('Failed to copy text', 'error'));
    });

    // Translate Button Handler
    elements.translateBtn.addEventListener('click', translateText);

    // Toast Notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 100);
    }

    // Add this to your existing JavaScript
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Check for saved theme preference or use system preference
    const currentTheme = localStorage.getItem('theme') || 
        (prefersDarkScheme.matches ? 'dark' : 'light');

    // Apply saved theme on load
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Theme toggle handler
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    });

    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
    });
}); 