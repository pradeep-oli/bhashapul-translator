document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark-mode') {
        body.classList.add('dark-mode');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark-mode' : '');
    });

    // Language Switch
    const switchBtn = document.getElementById('switch-btn');
    const langDropdown = document.querySelector('.lang-dropdown');
    const langOptions = document.querySelectorAll('.lang-option');
    const fromLangFlag = document.getElementById('from-lang-flag');
    const toLangFlag = document.getElementById('to-lang-flag');
    const fromLangLabel = document.getElementById('from-lang-label');
    const toLangLabel = document.getElementById('to-lang-label');
    const translateBtn = document.getElementById('translate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const inputText = document.getElementById('english-text');
    const outputText = document.getElementById('nepali-text');

    // Language switching
    switchBtn.addEventListener('click', () => {
        const switchArrow = document.querySelector('.switch-arrow');
        switchArrow.classList.add('active');

        // Get current languages
        const fromLangText = document.querySelector('.from-lang span').textContent;
        const fromLangImg = document.querySelector('.from-lang img').src;
        const toLangText = document.querySelector('.to-lang span').textContent;
        const toLangImg = document.querySelector('.to-lang img').src;

        // Add animation classes
        document.querySelector('.from-lang').style.animation = 'slideRight 0.5s forwards';
        document.querySelector('.to-lang').style.animation = 'slideLeft 0.5s forwards';

        setTimeout(() => {
            // Swap languages in the switch button
            document.querySelector('.from-lang span').textContent = toLangText;
            document.querySelector('.from-lang img').src = toLangImg;
            document.querySelector('.to-lang span').textContent = fromLangText;
            document.querySelector('.to-lang img').src = fromLangImg;

            // Swap languages in the input/output areas
            fromLangLabel.textContent = toLangText;
            fromLangFlag.src = toLangImg;
            toLangLabel.textContent = fromLangText;
            toLangFlag.src = fromLangImg;

            // Swap textareas content with fade effect
            const tempText = inputText.value;
            inputText.style.opacity = '0';
            outputText.style.opacity = '0';
            
            setTimeout(() => {
                inputText.value = outputText.value;
                outputText.value = tempText;
                inputText.style.opacity = '1';
                outputText.style.opacity = '1';

                // Update placeholders based on swapped languages
                const fromLang = toLangText.toLowerCase();
                const toLang = fromLangText.toLowerCase();

                // Set input placeholder based on source language
                switch(fromLang) {
                    case 'japanese':
                        inputText.placeholder = '翻訳するテキストを入力';
                        break;
                    case 'korean':
                        inputText.placeholder = '번역할 텍스트 입력';
                        break;
                    case 'nepali':
                        inputText.placeholder = 'अनुवाद गर्न पाठ लेख्नुहोस्';
                        break;
                    case 'english':
                        inputText.placeholder = 'Enter text to translate';
                        break;
                }

                // Set output placeholder based on target language
                switch(toLang) {
                    case 'japanese':
                        outputText.placeholder = '翻訳がここに表示されます';
                        break;
                    case 'korean':
                        outputText.placeholder = '번역이 여기에 표시됩니다';
                        break;
                    case 'nepali':
                        outputText.placeholder = 'नेपाली अनुवाद यहाँ देखिनेछ';
                        break;
                    case 'english':
                        outputText.placeholder = 'Translation will appear here';
                        break;
                }
            }, 150);

            // Reset animations
            document.querySelector('.from-lang').style.animation = '';
            document.querySelector('.to-lang').style.animation = '';
            switchArrow.classList.remove('active');
        }, 250);
    });

    // Language selection
    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.dataset.lang;
            const img = option.querySelector('img').src;
            const text = option.querySelector('span').textContent;
            
            // Update the UI
            document.querySelector('.to-lang img').src = img;
            document.querySelector('.to-lang span').textContent = text;
            toLangFlag.src = img;
            toLangLabel.textContent = text;

            // Update placeholder based on selected language
            switch(lang) {
                case 'ja':
                    outputText.placeholder = '翻訳がここに表示されます';
                    break;
                case 'ko':
                    outputText.placeholder = '번역이 여기에 표시됩니다';
                    break;
                case 'ne':
                    outputText.placeholder = 'नेपाली अनुवाद यहाँ देखिनेछ';
                    break;
                default:
                    outputText.placeholder = 'Translation will appear here...';
            }
            
            langDropdown.classList.remove('show');
        });
    });

    // Translation function
    async function translateText() {
        const text = inputText.value;
        if (!text) return;

        translateBtn.disabled = true;
        try {
            // Get the target language from the UI
            const targetLang = document.querySelector('.to-lang span').textContent;
            let langCode;
            
            // Map language names to their codes (case-insensitive)
            switch(targetLang.toLowerCase()) {
                case 'nepali':
                    langCode = 'ne';
                    break;
                case 'japanese':
                    langCode = 'ja';
                    break;
                case 'korean':
                    langCode = 'ko';
                    break;
                case 'english':
                    langCode = 'en';
                    break;
                default:
                    langCode = 'en';
            }

            // Update placeholder based on target language
            switch(langCode) {
                case 'ja':
                    outputText.placeholder = '翻訳がここに表示されます';
                    break;
                case 'ko':
                    outputText.placeholder = '번역이 여기에 표시됩니다';
                    break;
                case 'ne':
                    outputText.placeholder = 'नेपाली अनुवाद यहाँ देखिनेछ';
                    break;
                default:
                    outputText.placeholder = 'Translation will appear here...';
            }

            const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`);
            const data = await response.json();
            
            if (data && data[0] && data[0][0] && data[0][0][0]) {
                outputText.value = data[0][0][0];
            } else {
                throw new Error('Translation failed');
            }
        } catch (error) {
            console.error('Translation error:', error);
            outputText.value = 'Translation error occurred. Please try again.';
        } finally {
            translateBtn.disabled = false;
        }
    }

    // Copy translation
    copyBtn.addEventListener('click', () => {
        if (!outputText.value) return;
        
        navigator.clipboard.writeText(outputText.value)
            .then(() => {
                copyBtn.title = 'Copied!';
                setTimeout(() => {
                    copyBtn.title = 'Copy translation';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text:', err);
            });
    });

    // Translation button click handler
    translateBtn.addEventListener('click', translateText);

    // Clear button functionality
    const clearBtn = document.getElementById('clear-btn');
    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        outputText.value = '';
        inputText.focus();
    });

    // Text-to-speech functionality
    const speakInput = document.getElementById('speak-input');
    const speakOutput = document.getElementById('speak-output');
    
    function speak(text, button) {
        if (!text) return;

        // Cancel any ongoing speech
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            button.classList.remove('speaking');
            return;
        }

        try {
            button.classList.add('speaking');
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onend = () => {
                button.classList.remove('speaking');
            };

            utterance.onerror = () => {
                console.error('Speech error');
                button.classList.remove('speaking');
            };

            window.speechSynthesis.speak(utterance);

        } catch (error) {
            console.error('Speech error:', error);
            button.classList.remove('speaking');
        }
    }

    speakInput.addEventListener('click', () => {
        speak(inputText.value, speakInput);
    });

    speakOutput.addEventListener('click', () => {
        speak(outputText.value, speakOutput);
    });
}); 