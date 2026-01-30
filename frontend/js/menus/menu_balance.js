// Balance Menu Handler — RAWCONNECT

const MenuBalance = {
    renderPhonePrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.balance.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.balance.enterPhone}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderPinPrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.balance.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.balance.enterPin}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderBalance(account) {
        const t = window.USSDState.t();
        if (!account) return this.renderPhonePrompt();
        const balance = typeof account.balance === 'number' ? account.balance : parseFloat(account.balance) || 0;
        const score = typeof account.score === 'number' ? account.score : parseFloat(account.score) || 0;
        return `
            <p><strong>${t.balance.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.balance.yourBalance}</p>
            <div class="score-display">
                <span class="score-value">${balance.toLocaleString()}</span>
                <span class="score-label">FC</span>
            </div>
            <p>&nbsp;</p>
            <p>${t.balance.yourScore}</p>
            <div class="score-display">
                <span class="score-value">${score}</span>
                <span class="score-label">/100</span>
            </div>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    async handleInput(input) {
        const t = window.USSDState.t();
        const USSDState = window.USSDState;
        const MenuRoot = window.MenuRoot;
        const currentMenu = USSDState.currentMenu;

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

            case 'balance_pin': {
                const authResult = await USSDState.authenticate(USSDState.session.tempData.phone, input);
                if (!authResult.success) {
                    if (authResult.error === 'account_not_found') {
                        return this.renderPinPrompt() + `<p class="message-error">${t.balance.accountNotFound}</p>`;
                    }
                    return this.renderPinPrompt() + `<p class="message-error">${t.balance.wrongPin}</p>`;
                }
                USSDState.navigateTo('balance_show');
                const acc = await USSDState.getAccountForDisplay(USSDState.session.phone);
                USSDState.session.tempData._accountDisplay = acc;
                return this.renderBalance(acc);
            }

            case 'balance_show':
                USSDState.session.isAuthenticated = false;
                USSDState.currentMenu = 'main';
                return MenuRoot.render();

            default:
                return MenuRoot.render();
        }
    },

    renderByState() {
        const state = window.USSDState.currentMenu;
        switch (state) {
            case 'balance_phone': return this.renderPhonePrompt();
            case 'balance_pin': return this.renderPinPrompt();
            case 'balance_show': return this.renderBalance(window.USSDState.session.tempData._accountDisplay || null);
            default: return this.renderPhonePrompt();
        }
    },

    isValidPhone(phone) {
        return /^0[0-9]{9}$/.test(phone);
    }
};

if (typeof window !== 'undefined') {
    window.MenuBalance = MenuBalance;
}
