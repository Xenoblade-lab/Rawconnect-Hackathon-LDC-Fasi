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

    // Use globals from ussd_state + menus (loaded before app.js)
    const USSDState = window.USSDState;
    const MenuRoot = window.MenuRoot;
    const MenuRegister = window.MenuRegister;
    const MenuBalance = window.MenuBalance;
    const MenuSavings = window.MenuSavings;
    const MenuLoan = window.MenuLoan;
    const MenuHelpLang = window.MenuHelpLang;

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
        if (USSDState && USSDState.resetSession) {
            USSDState.resetSession();
        }
    }

    // Render USSD content
    function renderUSSD(content) {
        ussdBody.innerHTML = content;
        // Scroll to bottom
        ussdBody.scrollTop = ussdBody.scrollHeight;
    }

    // Handle USSD input (async: menus may call API)
    async function handleUSSDInput() {
        const input = ussdInput.value.trim();
        if (!input) return;

        ussdInput.value = '';

        // Code USSD : *444# (on accepte aussi *4444# par tolérance)
        const isUssdCode = input === '*444#' || input === '*4444#';
        if (isUssdCode) {
            showUSSDScreen();
            USSDState.currentMenu = 'main';
            renderUSSD(MenuRoot.render());
            return;
        }

        if (input.toLowerCase() === 'annuler' || input === '#') {
            showIdleScreen();
            return;
        }

        const currentMenu = USSDState.currentMenu;
        if (currentMenu === 'idle') {
            showUSSDScreen();
            renderUSSD('<p>Composez <strong>*444#</strong> (trois 4) pour ouvrir le menu, puis cliquez Envoyer.</p><p>&nbsp;</p><p>Vous avez tapé : « ' + input + ' »</p>');
            return;
        }

        let handler;
        if (currentMenu === 'main') handler = MenuRoot;
        else if (currentMenu.startsWith('register')) handler = MenuRegister;
        else if (currentMenu.startsWith('balance')) handler = MenuBalance;
        else if (currentMenu.startsWith('savings')) handler = MenuSavings;
        else if (currentMenu.startsWith('loan')) handler = MenuLoan;
        else if (currentMenu.startsWith('help')) handler = MenuHelpLang;
        else handler = MenuRoot;

        let result;
        try {
            result = await (handler.handleInput(input) || Promise.resolve(''));
        } catch (e) {
            console.error('Menu handleInput error:', e);
            result = MenuRoot.render() + '<p class="message-error">Erreur. Réessayez.</p>';
        }
        renderUSSD(typeof result === 'string' ? result : String(result));
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
            if (key === 'effacer') {
                ussdInput.value = '';
            } else {
                ussdInput.value += key;
            }
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
