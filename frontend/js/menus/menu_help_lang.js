// Help & Language Menu Handler
const MenuHelpLang = {
    render() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.help.title}</strong></p>
            <p>&nbsp;</p>
            <p>1. ${t.help.options[0]}</p>
            <p>2. ${t.help.options[1]}</p>
            <p>3. ${t.help.options[2]}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderHowItWorks() {
        const t = window.USSDState.t();
        let content = `<p><strong>${t.help.options[0]}</strong></p><p>&nbsp;</p>`;
        t.help.howItWorks.forEach(step => {
            content += `<p>${step}</p>`;
        });
        content += `<p>&nbsp;</p><p>${t.common.back}</p>`;
        return content;
    },

    renderSupport() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.help.options[1]}</strong></p>
            <p>&nbsp;</p>
            <p>${t.help.support}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderLanguageMenu() {
        const t = window.USSDState.t();
        const currentLang = window.USSDState.language === 'fr' ? 'Francais' : 'Lingala';
        return `
            <p><strong>${t.help.language.title}</strong></p>
            <p>&nbsp;</p>
            <p>Langue actuelle: ${currentLang}</p>
            <p>&nbsp;</p>
            <p>1. ${t.help.language.options[0]}</p>
            <p>2. ${t.help.language.options[1]}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderLanguageChanged() {
        const t = window.USSDState.t();
        const langName = window.USSDState.language === 'fr' ? 'Francais' : 'Lingala';
        const returnMsg = (t.help.language && t.help.language.returnToMainMenu) ? t.help.language.returnToMainMenu : t.common.back;
        return `
            <p><strong>${t.help.language.title}</strong></p>
            <p>&nbsp;</p>
            <p class="message-success">Langue changee: ${langName}</p>
            <p>&nbsp;</p>
            <p>${returnMsg}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    async handleInput(input) {
        const currentMenu = window.USSDState.currentMenu;

        // Handle back
        if (input === '0') {
            // Depuis "Langue changee", 0 = retour direct au menu principal
            if (currentMenu === 'help_language_changed') {
                window.USSDState.menuStack = [];
                window.USSDState.currentMenu = 'main';
                return window.MenuRoot.render();
            }
            window.USSDState.goBack();
            if (window.USSDState.currentMenu === 'main' || window.USSDState.currentMenu === 'idle') {
                window.USSDState.currentMenu = 'main';
                return window.MenuRoot.render();
            }
            if (window.USSDState.currentMenu === 'help') {
                return this.render();
            }
            return this.renderByState();
        }

        switch (currentMenu) {
            case 'help':
                switch (input) {
                    case '1':
                        window.USSDState.navigateTo('help_how');
                        return this.renderHowItWorks();
                    case '2':
                        window.USSDState.navigateTo('help_support');
                        return this.renderSupport();
                    case '3':
                        window.USSDState.navigateTo('help_language');
                        return this.renderLanguageMenu();
                    default:
                        return this.render() + '<p class="message-error">Option invalide</p>';
                }

            case 'help_how':
            case 'help_support':
                window.USSDState.currentMenu = 'help';
                return this.render();

            case 'help_language':
                if (input === '1') {
                    window.USSDState.language = 'fr';
                    window.USSDState.navigateTo('help_language_changed');
                    return this.renderLanguageChanged();
                } else if (input === '2') {
                    window.USSDState.language = 'lingala';
                    window.USSDState.navigateTo('help_language_changed');
                    return this.renderLanguageChanged();
                }
                return this.renderLanguageMenu() + '<p class="message-error">Option invalide</p>';

            case 'help_language_changed':
                window.USSDState.currentMenu = 'help';
                return this.render();

            default:
                return window.MenuRoot.render();
        }
    },

    renderByState() {
        const state = window.USSDState.currentMenu;
        switch (state) {
            case 'help': return this.render();
            case 'help_how': return this.renderHowItWorks();
            case 'help_support': return this.renderSupport();
            case 'help_language': return this.renderLanguageMenu();
            default: return this.render();
        }
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.MenuHelpLang = MenuHelpLang;
}
