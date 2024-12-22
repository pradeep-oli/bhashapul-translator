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

        // Get current languages and images BEFORE the swap
        const fromLangImg = document.querySelector('.from-lang img').src;
        const fromLangText = document.querySelector('.from-lang span').textContent;
        const toLangImg = document.querySelector('.to-lang img').src;
        const toLangText = document.querySelector('.to-lang span').textContent;

        // Swap languages in UI
        document.querySelector('.from-lang img').src = toLangImg;
        document.querySelector('.from-lang span').textContent = toLangText;
        document.getElementById('from-lang-flag').src = toLangImg;
        document.getElementById('from-lang-label').textContent = toLangText;

        document.querySelector('.to-lang img').src = fromLangImg;
        document.querySelector('.to-lang span').textContent = fromLangText;
        document.getElementById('to-lang-flag').src = fromLangImg;
        document.getElementById('to-lang-label').textContent = fromLangText;

        // Swap textareas content
        const tempText = inputText.value;
        inputText.value = outputText.value;
        outputText.value = tempText;

        // Update placeholders based on swapped languages
        switch(toLangText.toLowerCase()) {
            case 'japanese':
                inputText.placeholder = 'テキストを入力';
                break;
            case 'korean':
                inputText.placeholder = '텍스트 입력';
                break;
            case 'nepali':
                inputText.placeholder = 'पाठ लेख्नुहोस्';
                break;
            default:
                inputText.placeholder = 'Enter text to translate';
        }

        switch(fromLangText.toLowerCase()) {
            case 'japanese':
                outputText.placeholder = '翻訳がここに表示されます';
                break;
            case 'korean':
                outputText.placeholder = '번역이 여기에 표시됩니다';
                break;
            case 'nepali':
                outputText.placeholder = 'नेपाली अनुवाद यहाँ देखिनेछ';
                break;
            default:
                outputText.placeholder = 'Translation will appear here';
        }

        setTimeout(() => {
            switchArrow.classList.remove('active');
        }, 500);
    });

    // Language selection
    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.dataset.lang;
            const img = option.querySelector('img').src;
            const text = option.querySelector('span').textContent;
            const dropdown = option.closest('.lang-dropdown');
            const side = dropdown.dataset.side;
            
            if (side === 'from') {
                // Update the UI for left side (same way as right side used to work)
                document.querySelector('.from-lang img').src = img;
                document.querySelector('.from-lang span').textContent = text;
                fromLangFlag.src = img;
                fromLangLabel.textContent = text;

                // Update placeholder based on selected language
                switch(lang) {
                    case 'ja':
                        inputText.placeholder = 'テキストを入力';
                        break;
                    case 'ko':
                        inputText.placeholder = '텍스트 입력';
                        break;
                    case 'ne':
                        inputText.placeholder = 'पाठ लेख्नुहोस्';
                        break;
                    default:
                        inputText.placeholder = 'Enter text to translate';
                }
            } else if (side === 'to') {
                // Update the UI for right side (keep existing behavior)
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
                        outputText.placeholder = 'Translation will appear here';
                }
            }
            
            dropdown.classList.remove('show');
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
            
            if (data && data[0]) {
                // Combine all translated segments
                const translatedText = data[0]
                    .map(segment => segment[0])  // Get first element of each segment array
                    .filter(Boolean)             // Remove any null/undefined values
                    .join('');                   // Join all segments together
                outputText.value = translatedText;
                
                // Save to history
                const fromLang = document.querySelector('.from-lang span').textContent;
                const toLang = document.querySelector('.to-lang span').textContent;
                saveToHistory(text, translatedText, fromLang, toLang);
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

    // Function to toggle dropdown
    function toggleDropdown(event, side) {
        // Only show dropdown if clicking on language pairs, not the switch arrow
        const isArrowClick = event.target.closest('.switch-arrow');
        if (!isArrowClick) {
            // Hide any existing dropdowns
            document.querySelectorAll('.lang-dropdown').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
            
            // Show the clicked side's dropdown
            const dropdown = document.querySelector(`.lang-dropdown[data-side="${side}"]`);
            if (dropdown) {
                dropdown.classList.toggle('show');
                event.stopPropagation();
            }
        }
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.language-switch')) {
            document.querySelectorAll('.lang-dropdown').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });

    // Add click event to language pairs with their respective sides
    document.querySelector('.from-lang').addEventListener('click', (e) => toggleDropdown(e, 'from'));
    document.querySelector('.to-lang').addEventListener('click', (e) => toggleDropdown(e, 'to'));

    // Helper function to update placeholders
    function updatePlaceholder(element, lang, type) {
        const isInput = type === 'input';
        switch(lang) {
            case 'ja':
                element.placeholder = isInput ? 'テキストを入力' : '翻訳がここに表示されます';
                break;
            case 'ko':
                element.placeholder = isInput ? '텍스트 입력' : '번역이 여기에 표시됩니다';
                break;
            case 'ne':
                element.placeholder = isInput ? 'पाठ लेख्नुहोस्' : 'नेपाली अनुवाद यहाँ देखिनेछ';
                break;
            case 'en':
                element.placeholder = isInput ? 'Enter text to translate' : 'Translation will appear here';
                break;
        }
    }

    // Add these at the start of your DOMContentLoaded event listener
    const historyBtn = document.getElementById('history-btn');
    const historyModal = document.getElementById('history-modal');
    const closeModal = document.querySelector('.close-modal');
    const historyList = document.getElementById('history-list');

    // Initialize translation history array
    let translationHistory = JSON.parse(localStorage.getItem('translationHistory')) || [];

    // Show history modal
    historyBtn.addEventListener('click', () => {
        displayHistory();
        historyModal.classList.add('show');
    });

    // Close modal when clicking close button or outside
    closeModal.addEventListener('click', () => {
        historyModal.classList.remove('show');
    });

    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.classList.remove('show');
        }
    });

    // Function to save translation to history
    function saveToHistory(fromText, toText, fromLang, toLang) {
        const translation = {
            fromText,
            toText,
            fromLang,
            toLang,
            timestamp: new Date().toISOString()
        };
        
        translationHistory.unshift(translation); // Add to beginning of array
        if (translationHistory.length > 50) { // Keep only last 50 translations
            translationHistory.pop();
        }
        
        localStorage.setItem('translationHistory', JSON.stringify(translationHistory));
    }

    // Function to display history
    function displayHistory() {
        historyList.innerHTML = '';
        
        if (translationHistory.length === 0) {
            historyList.innerHTML = '<p class="no-history">No translation history yet.</p>';
            return;
        }
        
        translationHistory.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const date = new Date(item.timestamp).toLocaleString();
            
            historyItem.innerHTML = `
                <div class="history-header">
                    <div class="history-languages">
                        ${item.fromLang} → ${item.toLang} • ${date}
                    </div>
                    <button class="delete-history-item" title="Delete this translation" data-index="${index}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6L6 18"/>
                            <path d="M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="history-text" data-index="${index}">
                    <div>
                        <h4>Original</h4>
                        <p>${item.fromText}</p>
                    </div>
                    <div>
                        <h4>Translation</h4>
                        <p>${item.toText}</p>
                    </div>
                </div>
            `;
            
            historyList.appendChild(historyItem);
        });

        // Add click handlers for delete buttons
        document.querySelectorAll('.delete-history-item').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the history item click
                const index = parseInt(e.currentTarget.dataset.index);
                translationHistory.splice(index, 1);
                localStorage.setItem('translationHistory', JSON.stringify(translationHistory));
                displayHistory();
            });
        });

        // Add click handlers for history items
        document.querySelectorAll('.history-text').forEach(item => {
            item.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                const translation = translationHistory[index];
                
                // Update the input and output text areas
                inputText.value = translation.fromText;
                outputText.value = translation.toText;
                
                // Update the language selections
                const fromLangElements = document.querySelectorAll('.from-lang img, .from-lang span, #from-lang-flag, #from-lang-label');
                const toLangElements = document.querySelectorAll('.to-lang img, .to-lang span, #to-lang-flag, #to-lang-label');
                
                // Find the matching language option for 'from' language
                const fromLangOption = document.querySelector(`.lang-option span[textContent="${translation.fromLang}"]`);
                if (fromLangOption) {
                    const fromImg = fromLangOption.previousElementSibling.src;
                    fromLangElements.forEach(el => {
                        if (el.tagName === 'IMG') el.src = fromImg;
                        else el.textContent = translation.fromLang;
                    });
                }
                
                // Find the matching language option for 'to' language
                const toLangOption = document.querySelector(`.lang-option span[textContent="${translation.toLang}"]`);
                if (toLangOption) {
                    const toImg = toLangOption.previousElementSibling.src;
                    toLangElements.forEach(el => {
                        if (el.tagName === 'IMG') el.src = toImg;
                        else el.textContent = translation.toLang;
                    });
                }
                
                // Close the history modal
                historyModal.classList.remove('show');
            });
        });
    }

    // Add this with your other DOM element references
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // Add click handler for clear history button
    clearHistoryBtn.addEventListener('click', () => {
        // Clear history array
        translationHistory = [];
        // Clear localStorage
        localStorage.removeItem('translationHistory');
        // Update display
        displayHistory();
    });
}); 