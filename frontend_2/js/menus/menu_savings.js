// Savings Menu Handler
const MenuSavings = {
    renderPhonePrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.savings.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.savings.enterPhone}</p>
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
            <p>${t.common.back}</p>
        `;
    },

    renderWithdrawPrompt() {
        const t = window.USSDState.t();
        const account = window.USSDState.getAccount(window.USSDState.session.phone);
        return `
            <p><strong>${t.savings.menu.options[1]}</strong></p>
            <p>&nbsp;</p>
            <p>Solde actuel: ${account ? account.balance.toLocaleString() : 0} FC</p>
            <p>&nbsp;</p>
            <p>${t.savings.enterAmount}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderHistory() {
        const t = window.USSDState.t();
        const account = window.USSDState.getAccount(window.USSDState.session.phone);
        if (!account || account.transactions.length === 0) {
            return `
                <p><strong>${t.savings.menu.options[2]}</strong></p>
                <p>&nbsp;</p>
                <p>Aucune transaction</p>
                <p>&nbsp;</p>
                <p>${t.common.back}</p>
            `;
        }

        let history = `<p><strong>${t.savings.menu.options[2]}</strong></p><p>&nbsp;</p>`;
        account.transactions.slice(0, 5).forEach(tx => {
            const sign = tx.type === 'deposit' ? '+' : '-';
            const label = tx.type === 'deposit' ? 'Depot' : 'Retrait';
            history += `<p>${tx.date}: ${label} ${sign}${tx.amount.toLocaleString()} FC</p>`;
        });
        history += `<p>&nbsp;</p><p>${t.common.back}</p>`;
        return history;
    },

    renderResult(success, message, newBalance) {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.savings.title}</strong></p>
            <p>&nbsp;</p>
            <p class="${success ? 'message-success' : 'message-error'}">${message}</p>
            ${success ? `<p>&nbsp;</p><p>${t.savings.newBalance.replace('{balance}', newBalance.toLocaleString())}</p>` : ''}
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    handleInput(input) {
        const t = window.USSDState.t();
        const currentMenu = window.USSDState.currentMenu;

        // Handle back
        if (input === '0') {
            const prevMenu = window.USSDState.menuStack[window.USSDState.menuStack.length - 1];
            window.USSDState.goBack();
            
            if (window.USSDState.currentMenu === 'main' || window.USSDState.currentMenu === 'idle') {
                window.USSDState.session.isAuthenticated = false;
                window.USSDState.currentMenu = 'main';
                return window.MenuRoot.render();
            }
            if (window.USSDState.currentMenu === 'savings_menu') {
                return this.renderMenu();
            }
            return this.renderByState();
        }

        switch (currentMenu) {
            case 'savings_phone':
                if (!this.isValidPhone(input)) {
                    return this.renderPhonePrompt() + '<p class="message-error">Numero invalide</p>';
                }
                window.USSDState.session.tempData.phone = input;
                window.USSDState.navigateTo('savings_pin');
                return this.renderPinPrompt();

            case 'savings_pin':
                const authResult = window.USSDState.authenticate(window.USSDState.session.tempData.phone, input);
                if (!authResult.success) {
                    if (authResult.error === 'account_not_found') {
                        return this.renderPinPrompt() + `<p class="message-error">${t.balance.accountNotFound}</p>`;
                    }
                    return this.renderPinPrompt() + `<p class="message-error">${t.balance.wrongPin}</p>`;
                }
                window.USSDState.navigateTo('savings_menu');
                return this.renderMenu();

            case 'savings_menu':
                switch (input) {
                    case '1':
                        window.USSDState.navigateTo('savings_deposit');
                        return this.renderDepositPrompt();
                    case '2':
                        window.USSDState.navigateTo('savings_withdraw');
                        return this.renderWithdrawPrompt();
                    case '3':
                        window.USSDState.navigateTo('savings_history');
                        return this.renderHistory();
                    default:
                        return this.renderMenu() + '<p class="message-error">Option invalide</p>';
                }

            case 'savings_deposit':
                const depositAmount = parseInt(input);
                if (isNaN(depositAmount) || depositAmount <= 0) {
                    return this.renderDepositPrompt() + `<p class="message-error">${t.savings.invalidAmount}</p>`;
                }
                const depositResult = window.USSDState.deposit(depositAmount);
                if (depositResult.success) {
                    window.USSDState.navigateTo('savings_result');
                    return this.renderResult(true, t.savings.depositSuccess.replace('{amount}', depositAmount.toLocaleString()), depositResult.newBalance);
                }
                return this.renderDepositPrompt() + `<p class="message-error">${t.common.error}</p>`;

            case 'savings_withdraw':
                const withdrawAmount = parseInt(input);
                if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
                    return this.renderWithdrawPrompt() + `<p class="message-error">${t.savings.invalidAmount}</p>`;
                }
                const withdrawResult = window.USSDState.withdraw(withdrawAmount);
                if (withdrawResult.success) {
                    window.USSDState.navigateTo('savings_result');
                    return this.renderResult(true, t.savings.withdrawSuccess.replace('{amount}', withdrawAmount.toLocaleString()), withdrawResult.newBalance);
                }
                if (withdrawResult.error === 'insufficient_funds') {
                    return this.renderWithdrawPrompt() + `<p class="message-error">${t.savings.insufficientFunds}</p>`;
                }
                return this.renderWithdrawPrompt() + `<p class="message-error">${t.common.error}</p>`;

            case 'savings_history':
            case 'savings_result':
                window.USSDState.currentMenu = 'savings_menu';
                return this.renderMenu();

            default:
                return window.MenuRoot.render();
        }
    },

    renderByState() {
        const state = window.USSDState.currentMenu;
        switch (state) {
            case 'savings_phone': return this.renderPhonePrompt();
            case 'savings_pin': return this.renderPinPrompt();
            case 'savings_menu': return this.renderMenu();
            case 'savings_deposit': return this.renderDepositPrompt();
            case 'savings_withdraw': return this.renderWithdrawPrompt();
            case 'savings_history': return this.renderHistory();
            default: return this.renderPhonePrompt();
        }
    },

    isValidPhone(phone) {
        return /^0[0-9]{9}$/.test(phone);
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.MenuSavings = MenuSavings;
}
