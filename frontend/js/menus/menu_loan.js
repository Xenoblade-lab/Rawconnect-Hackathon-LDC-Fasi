// Loan Menu Handler — RAWCONNECT

const MenuLoan = {
    renderPhonePrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.loan.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.loan.enterPhone}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderPinPrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.loan.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.loan.enterPin}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderMenu() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.loan.menu.title}</strong></p>
            <p>&nbsp;</p>
            <p>1. ${t.loan.menu.options[0]}</p>
            <p>2. ${t.loan.menu.options[1]}</p>
            <p>3. ${t.loan.menu.options[2]}</p>
            <p>4. ${t.loan.menu.options[3]}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    async renderEligibility() {
        const t = window.USSDState.t();
        const eligibility = await window.USSDState.getEligibility();
        if (!eligibility) {
            return `
                <p><strong>${t.loan.eligibility.title}</strong></p>
                <p>&nbsp;</p>
                <p class="message-error">${t.common.error}</p>
                <p>&nbsp;</p>
                <p>${t.common.back}</p>
            `;
        }
        const maxAmount = eligibility.maxAmount != null ? eligibility.maxAmount : 0;
        return `
            <p><strong>${t.loan.eligibility.title}</strong></p>
            <p>&nbsp;</p>
            <div class="score-display">
                <span class="score-value">${eligibility.score}</span>
                <span class="score-label">/100</span>
            </div>
            <p>&nbsp;</p>
            <p>${t.loan.eligibility.maxAmount.replace('{amount}', maxAmount.toLocaleString())}</p>
            <p>&nbsp;</p>
            <p class="${eligibility.eligible ? 'message-success' : 'message-error'}">
                ${eligibility.eligible ? t.loan.eligibility.eligible : t.loan.eligibility.notEligible}
            </p>
            ${window.USSDState.getActionCompletedFooter()}
        `;
    },

    async renderRequestPrompt() {
        const t = window.USSDState.t();
        const eligibility = await window.USSDState.getEligibility();
        const maxAmount = eligibility ? (eligibility.maxAmount != null ? eligibility.maxAmount : 0) : 0;
        return `
            <p><strong>${t.loan.menu.options[1]}</strong></p>
            <p>&nbsp;</p>
            <p>${t.loan.request.enterAmount.replace('{max}', maxAmount.toLocaleString())}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderRequestResult(result) {
        const t = window.USSDState.t();
        if (!result.success) {
            return `
                <p><strong>${t.loan.menu.options[1]}</strong></p>
                <p>&nbsp;</p>
                <p class="message-error">${t.loan.request.denied}</p>
                <p>&nbsp;</p>
                <p>${t.common.back}</p>
            `;
        }
        const amount = result.amount != null ? result.amount : 0;
        const total = result.totalRepayment != null ? result.totalRepayment : 0;
        const nb = result.newBalance != null ? result.newBalance : 0;
        const days = (result.durationDays != null ? result.durationDays : 30).toString();
        const footer = window.USSDState.getActionCompletedFooter();
        return `
            <p><strong>${t.loan.menu.options[1]}</strong></p>
            <p>&nbsp;</p>
            <p class="message-success">${t.loan.request.success.replace('{amount}', amount.toLocaleString())}</p>
            <p>&nbsp;</p>
            <p>${t.loan.request.repayment.replace('{total}', total.toLocaleString())}</p>
            <p>${t.loan.request.duration.replace('{days}', days)}</p>
            <p>&nbsp;</p>
            <p>Nouveau solde: ${nb.toLocaleString()} FC</p>
            ${footer}
        `;
    },

    renderRepayPrompt() {
        const t = window.USSDState.t();
        const loans = window.USSDState.getActiveLoans();
        const activeLoan = loans.find(l => l.status === 'active');
        if (!activeLoan) {
            return `
                <p><strong>${t.loan.menu.options[2]}</strong></p>
                <p>&nbsp;</p>
                <p>${t.loan.repay.noLoan}</p>
                <p>&nbsp;</p>
                <p>${t.common.back}</p>
            `;
        }
        const remaining = activeLoan.remaining != null ? activeLoan.remaining : 0;
        return `
            <p><strong>${t.loan.menu.options[2]}</strong></p>
            <p>&nbsp;</p>
            <p>Reste a payer: ${remaining.toLocaleString()} FC</p>
            <p>&nbsp;</p>
            <p>${t.loan.repay.enterAmount}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderRepayResult(result) {
        const t = window.USSDState.t();
        if (!result.success) {
            let errorMsg = t.common.error;
            if (result.error === 'insufficient_funds') errorMsg = t.savings.insufficientFunds;
            else if (result.error === 'no_active_loan') errorMsg = t.loan.repay.noLoan;
            return `
                <p><strong>${t.loan.menu.options[2]}</strong></p>
                <p>&nbsp;</p>
                <p class="message-error">${errorMsg}</p>
                <p>&nbsp;</p>
                <p>${t.common.back}</p>
            `;
        }
        const nb = result.newBalance != null ? result.newBalance : 0;
        const footer = window.USSDState.getActionCompletedFooter();
        if (result.completed) {
            return `
                <p><strong>${t.loan.menu.options[2]}</strong></p>
                <p>&nbsp;</p>
                <p class="message-success">${t.loan.repay.completed}</p>
                <p>&nbsp;</p>
                <p>Nouveau solde: ${nb.toLocaleString()} FC</p>
                ${footer}
            `;
        }
        const remaining = result.remaining != null ? result.remaining : 0;
        return `
            <p><strong>${t.loan.menu.options[2]}</strong></p>
            <p>&nbsp;</p>
            <p class="message-success">Remboursement effectue!</p>
            <p>&nbsp;</p>
            <p>${t.loan.repay.remaining.replace('{remaining}', remaining.toLocaleString())}</p>
            <p>Nouveau solde: ${nb.toLocaleString()} FC</p>
            ${footer}
        `;
    },

    renderLoans() {
        const t = window.USSDState.t();
        const loans = window.USSDState.getActiveLoans();
        if (loans.length === 0) {
            const footer = window.USSDState.getActionCompletedFooter();
            return `
                <p><strong>${t.loan.history.title}</strong></p>
                <p>&nbsp;</p>
                <p>${t.loan.history.noLoans}</p>
                ${footer}
            `;
        }
        let loansList = `<p><strong>${t.loan.history.title}</strong></p><p>&nbsp;</p>`;
        loans.forEach((loan, index) => {
            const status = loan.status === 'active' ? t.loan.history.active : t.loan.history.paid;
            const amt = loan.amount != null ? loan.amount : 0;
            loansList += `<p>${index + 1}. ${amt.toLocaleString()} FC - ${status}</p>`;
            if (loan.status === 'active' && loan.remaining != null) {
                loansList += `<p>   Reste: ${loan.remaining.toLocaleString()} FC</p>`;
            }
        });
        loansList += window.USSDState.getActionCompletedFooter();
        return loansList;
    },

    async handleInput(input) {
        const t = window.USSDState.t();
        const USSDState = window.USSDState;
        const MenuRoot = window.MenuRoot;
        const currentMenu = USSDState.currentMenu;

        if ((currentMenu === 'loan_result' || currentMenu === 'loan_repay_result' || currentMenu === 'loan_eligibility' || currentMenu === 'loan_history') && (input === '0' || input === '1' || input === '2')) {
            if (input === '0') { USSDState.currentMenu = 'loan_menu'; return this.renderMenu(); }
            if (input === '1') { USSDState.session.isAuthenticated = false; USSDState.currentMenu = 'main'; return MenuRoot.render(); }
            if (input === '2') { USSDState.session.isAuthenticated = false; if (window.showIdleScreen) window.showIdleScreen(); return ''; }
        }

        if (input === '0') {
            USSDState.goBack();
            if (USSDState.currentMenu === 'main' || USSDState.currentMenu === 'idle') {
                USSDState.session.isAuthenticated = false;
                USSDState.currentMenu = 'main';
                return MenuRoot.render();
            }
            if (USSDState.currentMenu === 'loan_menu') {
                return this.renderMenu();
            }
            return this.renderByState();
        }

        switch (currentMenu) {
            case 'loan_phone':
                if (!this.isValidPhone(input)) {
                    return this.renderPhonePrompt() + '<p class="message-error">Numero invalide</p>';
                }
                USSDState.session.tempData.phone = input;
                USSDState.navigateTo('loan_pin');
                return this.renderPinPrompt();

            case 'loan_pin': {
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
                USSDState.navigateTo('loan_menu');
                return this.renderMenu();
            }

            case 'loan_menu':
                switch (input) {
                    case '1':
                        USSDState.navigateTo('loan_eligibility');
                        return await this.renderEligibility();
                    case '2': {
                        const eligibility = await USSDState.getEligibility();
                        if (!eligibility || !eligibility.eligible) {
                            USSDState.navigateTo('loan_result');
                            return this.renderRequestResult({ success: false });
                        }
                        USSDState.navigateTo('loan_request');
                        return await this.renderRequestPrompt();
                    }
                    case '3':
                        USSDState.navigateTo('loan_repay');
                        return this.renderRepayPrompt();
                    case '4':
                        USSDState.navigateTo('loan_history');
                        return this.renderLoans();
                    default:
                        return this.renderMenu() + '<p class="message-error">Option invalide</p>';
                }

            case 'loan_eligibility':
            case 'loan_history':
                USSDState.currentMenu = 'loan_menu';
                return this.renderMenu();

            case 'loan_request': {
                const requestAmount = parseInt(input, 10);
                const elig = await USSDState.getEligibility();
                if (isNaN(requestAmount) || requestAmount <= 0) {
                    return (await this.renderRequestPrompt()) + `<p class="message-error">${t.savings.invalidAmount}</p>`;
                }
                const maxAmount = elig ? (elig.maxAmount != null ? elig.maxAmount : 0) : 0;
                if (requestAmount > maxAmount) {
                    return (await this.renderRequestPrompt()) + '<p class="message-error">Montant trop eleve</p>';
                }
                const loanResult = await USSDState.requestLoan(requestAmount);
                if (loanResult && loanResult.success && window.pushSMSFeedback) {
                    const total = loanResult.totalRepayment != null ? loanResult.totalRepayment.toLocaleString() : '0';
                    const days = (loanResult.durationDays != null ? loanResult.durationDays : 30).toString();
                    window.pushSMSFeedback('Crédit de ' + requestAmount.toLocaleString() + ' FC accordé. Remboursement: ' + total + ' FC avant ' + days + ' jours.', { recipient: 'client', phone: USSDState.session.phone });
                }
                USSDState.navigateTo('loan_result');
                return this.renderRequestResult(loanResult);
            }

            case 'loan_repay': {
                const loans = USSDState.getActiveLoans();
                const activeLoan = loans.find(l => l.status === 'active');
                if (!activeLoan) {
                    USSDState.currentMenu = 'loan_menu';
                    return this.renderMenu();
                }
                const repayAmount = parseInt(input, 10);
                if (isNaN(repayAmount) || repayAmount <= 0) {
                    return this.renderRepayPrompt() + `<p class="message-error">${t.savings.invalidAmount}</p>`;
                }
                const repayResult = await USSDState.repayLoan(repayAmount);
                if (repayResult && repayResult.success && window.pushSMSFeedback) {
                    const opts = { recipient: 'client', phone: USSDState.session.phone };
                    if (repayResult.completed) {
                        window.pushSMSFeedback('Crédit soldé. Merci pour votre confiance!', opts);
                    } else {
                        const remaining = repayResult.remaining != null ? repayResult.remaining.toLocaleString() : '0';
                        window.pushSMSFeedback('Remboursement de ' + repayAmount.toLocaleString() + ' FC enregistré. Reste à payer: ' + remaining + ' FC.', opts);
                    }
                }
                USSDState.navigateTo('loan_repay_result');
                return this.renderRepayResult(repayResult);
            }

            case 'loan_result':
            case 'loan_repay_result':
                USSDState.currentMenu = 'loan_menu';
                return this.renderMenu();

            default:
                return MenuRoot.render();
        }
    },

    async renderByState() {
        const state = window.USSDState.currentMenu;
        switch (state) {
            case 'loan_phone': return this.renderPhonePrompt();
            case 'loan_pin': return this.renderPinPrompt();
            case 'loan_menu': return this.renderMenu();
            case 'loan_eligibility': return await this.renderEligibility();
            case 'loan_request': return await this.renderRequestPrompt();
            case 'loan_repay': return this.renderRepayPrompt();
            case 'loan_history': return this.renderLoans();
            default: return this.renderPhonePrompt();
        }
    },

    isValidPhone(phone) {
        return /^0[0-9]{9}$/.test(phone);
    }
};

if (typeof window !== 'undefined') {
    window.MenuLoan = MenuLoan;
}
