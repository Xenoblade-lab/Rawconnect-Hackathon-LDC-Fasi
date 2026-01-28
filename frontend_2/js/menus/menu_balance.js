// Balance Menu Handler
const USSDState = {}; // Placeholder for USSDState declaration
const MenuRoot = {}; // Placeholder for MenuRoot declaration

const MenuBalance = {
    renderPhonePrompt() {
        const t = USSDState.t();
        return `
            <p><strong>${t.balance.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.balance.enterPhone}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderPinPrompt() {
        const t = USSDState.t();
        return `
            <p><strong>${t.balance.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.balance.enterPin}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderBalance() {
        const t = USSDState.t();
        const account = USSDState.getAccount(USSDState.session.phone);
        if (!account) return this.renderPhonePrompt();

        return `
            <p><strong>${t.balance.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.balance.yourBalance}</p>
            <div class="score-display">
                <span class="score-value">${account.balance.toLocaleString()}</span>
                <span class="score-label">FC</span>
            </div>
            <p>&nbsp;</p>
            <p>${t.balance.yourScore}</p>
            <div class="score-display">
                <span class="score-value">${account.score}</span>
                <span class="score-label">/100</span>
            </div>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    handleInput(input) {
        const t = USSDState.t();
        const currentMenu = USSDState.currentMenu;

        // Handle back
        if (input === '0') {
            USSDState.session.tempData = {};
            USSDState.session.isAuthenticated = false;
            USSDState.goBack();
            if (USSDState.currentMenu === 'main' || USSDState.currentMenu === 'idle') {
                USSDState.currentMenu = 'main';
                return MenuRoot.render();
            }
            return this.renderByState();
        }

        switch (currentMenu) {
            case 'balance_phone':
                if (!this.isValidPhone(input)) {
                    return this.renderPhonePrompt() + '<p class="message-error">Numero invalide</p>';
                }
                USSDState.session.tempData.phone = input;
                USSDState.navigateTo('balance_pin');
                return this.renderPinPrompt();

            case 'balance_pin':
                const authResult = USSDState.authenticate(USSDState.session.tempData.phone, input);
                if (!authResult.success) {
                    if (authResult.error === 'account_not_found') {
                        return this.renderPinPrompt() + `<p class="message-error">${t.balance.accountNotFound}</p>`;
                    }
                    return this.renderPinPrompt() + `<p class="message-error">${t.balance.wrongPin}</p>`;
                }
                USSDState.navigateTo('balance_show');
                return this.renderBalance();

            case 'balance_show':
                USSDState.session.isAuthenticated = false;
                USSDState.currentMenu = 'main';
                return MenuRoot.render();

            default:
                return MenuRoot.render();
        }
    },

    renderByState() {
        const state = USSDState.currentMenu;
        switch (state) {
            case 'balance_phone': return this.renderPhonePrompt();
            case 'balance_pin': return this.renderPinPrompt();
            case 'balance_show': return this.renderBalance();
            default: return this.renderPhonePrompt();
        }
    },

    isValidPhone(phone) {
        return /^0[0-9]{9}$/.test(phone);
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.MenuBalance = MenuBalance;
}
