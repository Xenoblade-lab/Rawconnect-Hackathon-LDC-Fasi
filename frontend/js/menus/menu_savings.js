<<<<<<< HEAD
// Savings Menu Handler — RAWCONNECT

const MenuSavings = {
    renderPhonePrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.savings.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.savings.enterPhone}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderPinPrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.savings.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.savings.enterPin}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderMenu() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.savings.menu.title}</strong></p>
            <p>&nbsp;</p>
            <p>1. ${t.savings.menu.options[0]}</p>
            <p>2. ${t.savings.menu.options[1]}</p>
            <p>3. ${t.savings.menu.options[2]}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderDepositPrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.savings.menu.options[0]}</strong></p>
            <p>&nbsp;</p>
            <p>${t.savings.enterAmount}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    async renderWithdrawPrompt() {
        const t = window.USSDState.t();
        const acc = await window.USSDState.getAccountForDisplay(window.USSDState.session.phone);
        const bal = acc ? (typeof acc.balance === 'number' ? acc.balance : parseFloat(acc.balance) || 0) : 0;
        return `
            <p><strong>${t.savings.menu.options[1]}</strong></p>
            <p>&nbsp;</p>
            <p>Solde actuel: ${bal.toLocaleString()} FC</p>
            <p>&nbsp;</p>
            <p>${t.savings.enterAmount}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    async renderHistory() {
        const t = window.USSDState.t();
        const USSDState = window.USSDState;
        let transactions = [];
        if (USSDState.useApi && USSDState.session.phone) {
            transactions = await USSDState.getTransactions(USSDState.session.phone);
        } else {
            const account = USSDState.getAccount(USSDState.session.phone);
            transactions = (account && account.transactions) ? account.transactions : [];
        }
        const footer = window.USSDState.getActionCompletedFooter();
        if (!transactions || transactions.length === 0) {
            return `
                <p><strong>${t.savings.menu.options[2]}</strong></p>
                <p>&nbsp;</p>
                <p>Aucune transaction</p>
                ${footer}
            `;
        }
        let history = `<p><strong>${t.savings.menu.options[2]}</strong></p><p>&nbsp;</p>`;
        transactions.slice(0, 10).forEach(tx => {
            const sign = tx.type === 'deposit' ? '+' : '-';
            const label = tx.type === 'deposit' ? 'Depot' : (tx.type === 'withdrawal' ? 'Retrait' : tx.type || '');
            history += `<p>${tx.date || ''}: ${label} ${sign}${(tx.amount != null ? Number(tx.amount) : 0).toLocaleString()} FC</p>`;
        });
        history += footer;
        return history;
    },

    renderResult(success, message, newBalance) {
        const t = window.USSDState.t();
        const nb = typeof newBalance === 'number' ? newBalance : parseFloat(newBalance) || 0;
        const footer = success ? window.USSDState.getActionCompletedFooter() : `<p>&nbsp;</p><p>${t.common.back}</p>`;
        return `
            <p><strong>${t.savings.title}</strong></p>
            <p>&nbsp;</p>
            <p class="${success ? 'message-success' : 'message-error'}">${message}</p>
            ${success ? `<p>&nbsp;</p><p>${t.savings.newBalance.replace('{balance}', nb.toLocaleString())}</p>` : ''}
            ${footer}
        `;
    },

    async handleInput(input) {
        const t = window.USSDState.t();
        const USSDState = window.USSDState;
        const MenuRoot = window.MenuRoot;
        const currentMenu = USSDState.currentMenu;

        if ((currentMenu === 'savings_result' || currentMenu === 'savings_history') && (input === '0' || input === '1' || input === '2')) {
            if (input === '0') { USSDState.currentMenu = 'savings_menu'; return this.renderMenu(); }
            if (input === '1') { USSDState.session.isAuthenticated = false; USSDState.currentMenu = 'main'; return MenuRoot.render(); }
            if (input === '2') { USSDState.session.isAuthenticated = false; if (window.showIdleScreen) window.showIdleScreen(); return ''; }
        }

        if (input === '0') {
            const prevMenu = USSDState.menuStack[USSDState.menuStack.length - 1];
            USSDState.goBack();
            if (USSDState.currentMenu === 'main' || USSDState.currentMenu === 'idle') {
                USSDState.session.isAuthenticated = false;
                USSDState.currentMenu = 'main';
                return MenuRoot.render();
            }
            if (USSDState.currentMenu === 'savings_menu') {
                return this.renderMenu();
            }
            return this.renderByState();
        }

        switch (currentMenu) {
            case 'savings_phone':
                if (!this.isValidPhone(input)) {
                    return this.renderPhonePrompt() + '<p class="message-error">Numero invalide</p>';
                }
                USSDState.session.tempData.phone = input;
                USSDState.navigateTo('savings_pin');
                return this.renderPinPrompt();

            case 'savings_pin': {
                const authResult = await USSDState.authenticate(USSDState.session.tempData.phone, input);
                if (!authResult.success) {
                    if (authResult.error === 'connection_error') {
                        return this.renderPinPrompt() + `<p class="message-error">${t.balance.connectionError || "Impossible de joindre le serveur. Demarrez l'API (port 5000)."}</p>`;
                    }
                    if (authResult.error === 'account_not_found') {
                        return this.renderPinPrompt() + `<p class="message-error">${t.balance.accountNotFound}</p>`;
                    }
                    return this.renderPinPrompt() + `<p class="message-error">${t.balance.wrongPin}</p>`;
                }
                USSDState.navigateTo('savings_menu');
                return this.renderMenu();
            }

            case 'savings_menu':
                switch (input) {
                    case '1':
                        USSDState.navigateTo('savings_deposit');
                        return this.renderDepositPrompt();
                    case '2':
                        USSDState.navigateTo('savings_withdraw');
                        return await this.renderWithdrawPrompt();
                    case '3':
                        USSDState.navigateTo('savings_history');
                        return this.renderHistory();
                    default:
                        return this.renderMenu() + '<p class="message-error">Option invalide</p>';
                }

            case 'savings_deposit': {
                const depositAmount = parseInt(input, 10);
                if (isNaN(depositAmount) || depositAmount <= 0) {
                    return this.renderDepositPrompt() + `<p class="message-error">${t.savings.invalidAmount}</p>`;
                }
                const depositResult = await USSDState.deposit(depositAmount);
                if (depositResult.success) {
                    if (window.pushSMSFeedback) window.pushSMSFeedback('Dépôt de ' + depositAmount.toLocaleString() + ' FC effectué. Nouveau solde: ' + (depositResult.newBalance != null ? depositResult.newBalance.toLocaleString() : '0') + ' FC.', { recipient: 'client', phone: USSDState.session.tempData.phone });
                    USSDState.navigateTo('savings_result');
                    return this.renderResult(true, t.savings.depositSuccess.replace('{amount}', depositAmount.toLocaleString()), depositResult.newBalance);
                }
                return this.renderDepositPrompt() + `<p class="message-error">${t.common.error}</p>`;
            }

            case 'savings_withdraw': {
                const withdrawAmount = parseInt(input, 10);
                if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
                    return (await this.renderWithdrawPrompt()) + `<p class="message-error">${t.savings.invalidAmount}</p>`;
                }
                const withdrawResult = await USSDState.withdraw(withdrawAmount);
                if (withdrawResult.success) {
                    if (window.pushSMSFeedback) window.pushSMSFeedback('Retrait de ' + withdrawAmount.toLocaleString() + ' FC effectué. Nouveau solde: ' + (withdrawResult.newBalance != null ? withdrawResult.newBalance.toLocaleString() : '0') + ' FC.', { recipient: 'client', phone: USSDState.session.tempData.phone });
                    USSDState.navigateTo('savings_result');
                    return this.renderResult(true, t.savings.withdrawSuccess.replace('{amount}', withdrawAmount.toLocaleString()), withdrawResult.newBalance);
                }
                if (withdrawResult.error === 'insufficient_funds') {
                    return (await this.renderWithdrawPrompt()) + `<p class="message-error">${t.savings.insufficientFunds}</p>`;
                }
                return (await this.renderWithdrawPrompt()) + `<p class="message-error">${t.common.error}</p>`;
            }

            case 'savings_history':
                USSDState.currentMenu = 'savings_menu';
                return this.renderMenu();

            case 'savings_result':
                USSDState.currentMenu = 'savings_menu';
                return this.renderMenu();

            default:
                return MenuRoot.render();
        }
    },

    async renderByState() {
        const state = window.USSDState.currentMenu;
        switch (state) {
            case 'savings_phone': return this.renderPhonePrompt();
            case 'savings_pin': return this.renderPinPrompt();
            case 'savings_menu': return this.renderMenu();
            case 'savings_deposit': return this.renderDepositPrompt();
            case 'savings_withdraw': return await this.renderWithdrawPrompt();
            case 'savings_history': return await this.renderHistory();
            default: return this.renderPhonePrompt();
        }
    },

    isValidPhone(phone) {
        return /^0[0-9]{9}$/.test(phone);
    }
};

if (typeof window !== 'undefined') {
    window.MenuSavings = MenuSavings;
}
=======
// Savings Menu Handler — RAWCONNECT

const MenuSavings = {
    renderPhonePrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.savings.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.savings.enterPhone}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderPinPrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.savings.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.savings.enterPin}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderMenu() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.savings.menu.title}</strong></p>
            <p>&nbsp;</p>
            <p>1. ${t.savings.menu.options[0]}</p>
            <p>2. ${t.savings.menu.options[1]}</p>
            <p>3. ${t.savings.menu.options[2]}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderDepositPrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.savings.menu.options[0]}</strong></p>
            <p>&nbsp;</p>
            <p>${t.savings.enterAmount}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    async renderWithdrawPrompt() {
        const t = window.USSDState.t();
        const acc = await window.USSDState.getAccountForDisplay(window.USSDState.session.phone);
        const bal = acc ? (typeof acc.balance === 'number' ? acc.balance : parseFloat(acc.balance) || 0) : 0;
        return `
            <p><strong>${t.savings.menu.options[1]}</strong></p>
            <p>&nbsp;</p>
            <p>Solde actuel: ${bal.toLocaleString()} FC</p>
            <p>&nbsp;</p>
            <p>${t.savings.enterAmount}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderHistory() {
        const t = window.USSDState.t();
        const account = window.USSDState.getAccount(window.USSDState.session.phone);
        if (!account || !account.transactions || account.transactions.length === 0) {
            return `
                <p><strong>${t.savings.menu.options[2]}</strong></p>
                <p>&nbsp;</p>
                <p>${window.USSDState.useApi ? 'Historique non disponible (mode API).' : 'Aucune transaction'}</p>
                <p>&nbsp;</p>
                <p>${t.common.back}</p>
            `;
        }
        let history = `<p><strong>${t.savings.menu.options[2]}</strong></p><p>&nbsp;</p>`;
        account.transactions.slice(0, 5).forEach(tx => {
            const sign = tx.type === 'deposit' ? '+' : '-';
            const label = tx.type === 'deposit' ? 'Depot' : 'Retrait';
            history += `<p>${tx.date || ''}: ${label} ${sign}${(tx.amount || 0).toLocaleString()} FC</p>`;
        });
        history += `<p>&nbsp;</p><p>${t.common.back}</p>`;
        return history;
    },

    renderResult(success, message, newBalance) {
        const t = window.USSDState.t();
        const nb = typeof newBalance === 'number' ? newBalance : parseFloat(newBalance) || 0;
        return `
            <p><strong>${t.savings.title}</strong></p>
            <p>&nbsp;</p>
            <p class="${success ? 'message-success' : 'message-error'}">${message}</p>
            ${success ? `<p>&nbsp;</p><p>${t.savings.newBalance.replace('{balance}', nb.toLocaleString())}</p>` : ''}
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
            const prevMenu = USSDState.menuStack[USSDState.menuStack.length - 1];
            USSDState.goBack();
            if (USSDState.currentMenu === 'main' || USSDState.currentMenu === 'idle') {
                USSDState.session.isAuthenticated = false;
                USSDState.currentMenu = 'main';
                return MenuRoot.render();
            }
            if (USSDState.currentMenu === 'savings_menu') {
                return this.renderMenu();
            }
            return this.renderByState();
        }

        switch (currentMenu) {
            case 'savings_phone':
                if (!this.isValidPhone(input)) {
                    return this.renderPhonePrompt() + '<p class="message-error">Numero invalide</p>';
                }
                USSDState.session.tempData.phone = input;
                USSDState.navigateTo('savings_pin');
                return this.renderPinPrompt();

            case 'savings_pin': {
                const authResult = await USSDState.authenticate(USSDState.session.tempData.phone, input);
                if (!authResult.success) {
                    if (authResult.error === 'account_not_found') {
                        return this.renderPinPrompt() + `<p class="message-error">${t.balance.accountNotFound}</p>`;
                    }
                    return this.renderPinPrompt() + `<p class="message-error">${t.balance.wrongPin}</p>`;
                }
                USSDState.navigateTo('savings_menu');
                return this.renderMenu();
            }

            case 'savings_menu':
                switch (input) {
                    case '1':
                        USSDState.navigateTo('savings_deposit');
                        return this.renderDepositPrompt();
                    case '2':
                        USSDState.navigateTo('savings_withdraw');
                        return await this.renderWithdrawPrompt();
                    case '3':
                        USSDState.navigateTo('savings_history');
                        return this.renderHistory();
                    default:
                        return this.renderMenu() + '<p class="message-error">Option invalide</p>';
                }

            case 'savings_deposit': {
                const depositAmount = parseInt(input, 10);
                if (isNaN(depositAmount) || depositAmount <= 0) {
                    return this.renderDepositPrompt() + `<p class="message-error">${t.savings.invalidAmount}</p>`;
                }
                const depositResult = await USSDState.deposit(depositAmount);
                if (depositResult.success) {
                    USSDState.navigateTo('savings_result');
                    return this.renderResult(true, t.savings.depositSuccess.replace('{amount}', depositAmount.toLocaleString()), depositResult.newBalance);
                }
                return this.renderDepositPrompt() + `<p class="message-error">${t.common.error}</p>`;
            }

            case 'savings_withdraw': {
                const withdrawAmount = parseInt(input, 10);
                if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
                    return (await this.renderWithdrawPrompt()) + `<p class="message-error">${t.savings.invalidAmount}</p>`;
                }
                const withdrawResult = await USSDState.withdraw(withdrawAmount);
                if (withdrawResult.success) {
                    USSDState.navigateTo('savings_result');
                    return this.renderResult(true, t.savings.withdrawSuccess.replace('{amount}', withdrawAmount.toLocaleString()), withdrawResult.newBalance);
                }
                if (withdrawResult.error === 'insufficient_funds') {
                    return (await this.renderWithdrawPrompt()) + `<p class="message-error">${t.savings.insufficientFunds}</p>`;
                }
                return (await this.renderWithdrawPrompt()) + `<p class="message-error">${t.common.error}</p>`;
            }

            case 'savings_history':
            case 'savings_result':
                USSDState.currentMenu = 'savings_menu';
                return this.renderMenu();

            default:
                return MenuRoot.render();
        }
    },

    async renderByState() {
        const state = window.USSDState.currentMenu;
        switch (state) {
            case 'savings_phone': return this.renderPhonePrompt();
            case 'savings_pin': return this.renderPinPrompt();
            case 'savings_menu': return this.renderMenu();
            case 'savings_deposit': return this.renderDepositPrompt();
            case 'savings_withdraw': return await this.renderWithdrawPrompt();
            case 'savings_history': return this.renderHistory();
            default: return this.renderPhonePrompt();
        }
    },

    isValidPhone(phone) {
        return /^0[0-9]{9}$/.test(phone);
    }
};

if (typeof window !== 'undefined') {
    window.MenuSavings = MenuSavings;
}
>>>>>>> 463e3abd36884f251c14dea4f64c592739b8804e
