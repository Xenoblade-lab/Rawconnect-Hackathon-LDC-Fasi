// RAWCONNECT USSD Simulator - Main App
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const landingPage = document.getElementById('landing-page');
    const simulatorPage = document.getElementById('simulator-page');
    const idleScreen = document.getElementById('idle-screen');
    const ussdScreen = document.getElementById('ussd-screen');
    const ussdBody = document.getElementById('ussd-body');
    const ussdInput = document.getElementById('ussd-input');
    const sendBtn = document.getElementById('send-btn');
    const keypad = document.getElementById('keypad');
    const idleTime = document.getElementById('idle-time');
    const idleDate = document.getElementById('idle-date');

    // THEME & LOGO
    const themeToggleLanding = document.getElementById('theme-toggle');
    const themeToggleSim = document.getElementById('theme-toggle-sim');
    const logoElements = document.querySelectorAll('[data-role="rawbank-logo"]');

    const THEME_STORAGE_KEY = 'rawconnect-theme';

    function applyTheme(theme) {
        const nextTheme = theme === 'dark' ? 'dark' : 'light';
        document.body.dataset.theme = nextTheme;
        try {
            localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        } catch (e) {
            // ignore storage errors
        }

        // Met à jour les logos selon le thème
        logoElements.forEach(logo => {
            if (nextTheme === 'dark') {
                logo.src = '../logo_rawbank_blanc.jpeg';
            } else {
                logo.src = '../logo_rawbank_noir.jpeg';
            }
        });

        // Met à jour le label du bouton (on cible juste le texte, pas l'icône)
        const label = nextTheme === 'dark' ? 'Theme clair' : 'Theme sombre';
        const updateLabel = (btn) => {
            if (!btn) return;
            const span = btn.querySelector('.theme-toggle-label');
            if (span) span.textContent = label;
        };
        updateLabel(themeToggleLanding);
        updateLabel(themeToggleSim);
    }

    function initTheme() {
        let initial = 'light';
        try {
            const stored = localStorage.getItem(THEME_STORAGE_KEY);
            if (stored === 'light' || stored === 'dark') {
                initial = stored;
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                initial = 'dark';
            }
        } catch (e) {
            // ignore
        }
        applyTheme(initial);
    }

    function toggleTheme() {
        const current = document.body.dataset.theme === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
    }

    // Initialise le thème au chargement
    initTheme();

    // Boutons de changement de thème
    if (themeToggleLanding) {
        themeToggleLanding.addEventListener('click', toggleTheme);
    }
    if (themeToggleSim) {
        themeToggleSim.addEventListener('click', toggleTheme);
    }

    // Declare variables pour la machine USSD
    const USSDState = {
        currentMenu: 'idle',
        resetSession: function() {
            this.currentMenu = 'idle';
        }
    };

    const MenuRoot = {
        render: function() {
            return 'Welcome to USSD Simulator';
        },
        handleInput: function(input) {
            return 'Invalid input';
        }
    };

    const MenuRegister = {
        handleInput: function(input) {
            return 'Register input handled';
        }
    };

    const MenuBalance = {
        handleInput: function(input) {
            return 'Balance input handled';
        }
    };

    const MenuSavings = {
        handleInput: function(input) {
            return 'Savings input handled';
        }
    };

    const MenuLoan = {
        handleInput: function(input) {
            return 'Loan input handled';
        }
    };

    const MenuHelpLang = {
        handleInput: function(input) {
            return 'Help input handled';
        }
    };

    // Update clock
    function updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        idleTime.textContent = `${hours}:${minutes}`;

        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const months = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];
        const dayName = days[now.getDay()];
        const day = now.getDate();
        const month = months[now.getMonth()];
        idleDate.textContent = `${dayName} ${day} ${month}`;
    }

    // Initial clock update and interval
    updateClock();
    setInterval(updateClock, 1000);

    // Show USSD screen
    function showUSSDScreen() {
        idleScreen.classList.add('hidden');
        ussdScreen.classList.remove('hidden');
    }

    // Show idle screen
    function showIdleScreen() {
        ussdScreen.classList.add('hidden');
        idleScreen.classList.remove('hidden');
        USSDState.resetSession();
    }

    // Render USSD content
    function renderUSSD(content) {
        ussdBody.innerHTML = content;
        // Scroll to bottom
        ussdBody.scrollTop = ussdBody.scrollHeight;
    }

    // Handle USSD input
    function handleUSSDInput() {
        const input = ussdInput.value.trim();
        if (!input) return;

        ussdInput.value = '';

        // Check for USSD code
        if (input === '*444#') {
            showUSSDScreen();
            USSDState.currentMenu = 'main';
            renderUSSD(MenuRoot.render());
            return;
        }

        // Check for cancel/end
        if (input.toLowerCase() === 'annuler' || input === '#') {
            showIdleScreen();
            return;
        }

        // Route input to current menu handler
        let result;
        const currentMenu = USSDState.currentMenu;

        if (currentMenu === 'idle') {
            // Not in USSD session
            return;
        } else if (currentMenu === 'main') {
            result = MenuRoot.handleInput(input);
        } else if (currentMenu.startsWith('register')) {
            result = MenuRegister.handleInput(input);
        } else if (currentMenu.startsWith('balance')) {
            result = MenuBalance.handleInput(input);
        } else if (currentMenu.startsWith('savings')) {
            result = MenuSavings.handleInput(input);
        } else if (currentMenu.startsWith('loan')) {
            result = MenuLoan.handleInput(input);
        } else if (currentMenu.startsWith('help')) {
            result = MenuHelpLang.handleInput(input);
        } else {
            result = MenuRoot.render();
        }

        renderUSSD(result);
    }

    // Event Listeners
    sendBtn.addEventListener('click', handleUSSDInput);

    ussdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleUSSDInput();
        }
    });

    // Keypad buttons
    keypad.addEventListener('click', function(e) {
        if (e.target.classList.contains('key')) {
            const key = e.target.dataset.key;
            ussdInput.value += key;
            ussdInput.focus();
        }
    });

    // Page navigation functions (global)
    window.showSimulator = function() {
        landingPage.classList.add('hidden');
        simulatorPage.classList.remove('hidden');
        ussdInput.focus();
    };

    window.showLanding = function() {
        simulatorPage.classList.add('hidden');
        landingPage.classList.remove('hidden');
        showIdleScreen();
    };

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Focus input when simulator is shown
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (!simulatorPage.classList.contains('hidden')) {
                ussdInput.focus();
            }
        });
    });

    observer.observe(simulatorPage, { attributes: true, attributeFilter: ['class'] });
});
