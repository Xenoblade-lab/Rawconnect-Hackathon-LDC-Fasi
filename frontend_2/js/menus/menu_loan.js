// Import USSDState and MenuRoot
const USSDState = require('../../ussd_state');
const MenuRoot = require('../menu_root');

// Loan Menu Handler
const MenuLoan = {
    renderPhonePrompt() {
        const t = USSDState.t();
        return `
            <p><strong>${t.loan.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.loan.enterPhone}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderPinPrompt() {
        const t = USSDState.t();
        return `
            <p><strong>${t.loan.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.loan.enterPin}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderMenu() {
        const t = USSDState.t();
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

    renderEligibility() {
        const t = USSDState.t();
        const eligibility = USSDState.getEligibility();
        
        if (!eligibility) {
            return `
                <p><strong>${t.loan.eligibility.title}</strong></p>
                <p>&nbsp;</p>
                <p class="message-error">${t.common.error}</p>
                <p>&nbsp;</p>
                <p>${t.common.back}</p>
            `;
        }

        return `
            <p><strong>${t.loan.eligibility.title}</strong></p>
            <p>&nbsp;</p>
            <div class="score-display">
                <span class="score-value">${eligibility.score}</span>
                <span class="score-label">/100</span>
            </div>
            <p>&nbsp;</p>
            <p>${t.loan.eligibility.maxAmount.replace('{amount}', eligibility.maxAmount.toLocaleString())}</p>
            <p>&nbsp;</p>
            <p class="${eligibility.eligible ? 'message-success' : 'message-error'}">
                ${eligibility.eligible ? t.loan.eligibility.eligible : t.loan.eligibility.notEligible}
            </p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderRequestPrompt() {
        const t = USSDState.t();
        const eligibility = USSDState.getEligibility();
        const maxAmount = eligibility ? eligibility.maxAmount : 0;

        return `
            <p><strong>${t.loan.menu.options[1]}</strong></p>
            <p>&nbsp;</p>
            <p>${t.loan.request.enterAmount.replace('{max}', maxAmount.toLocaleString())}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderRequestResult(result) {
        const t = USSDState.t();
        
        if (!result.success) {
            return `
                <p><strong>${t.loan.menu.options[1]}</strong></p>
                <p>&nbsp;</p>
                <p class="message-error">${t.loan.request.denied}</p>
                <p>&nbsp;</p>
                <p>${t.common.back}</p>
            `;
        }

        return `
            <p><strong>${t.loan.menu.options[1]}</strong></p>
            <p>&nbsp;</p>
            <p class="message-success">${t.loan.request.success.replace('{amount}', result.amount.toLocaleString())}</p>
            <p>&nbsp;</p>
            <p>${t.loan.request.repayment.replace('{total}', result.totalRepayment.toLocaleString())}</p>
            <p>${t.loan.request.duration.replace('{days}', '30')}</p>
            <p>&nbsp;</p>
            <p>Nouveau solde: ${result.newBalance.toLocaleString()} FC</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderRepayPrompt() {
        const t = USSDState.t();
        const loans = USSDState.getActiveLoans();
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

        return `
            <p><strong>${t.loan.menu.options[2]}</strong></p>
            <p>&nbsp;</p>
            <p>Reste a payer: ${activeLoan.remaining.toLocaleString()} FC</p>
            <p>&nbsp;</p>
            <p>${t.loan.repay.enterAmount}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderRepayResult(result) {
        const t = USSDState.t();
        
        if (!result.success) {
            let errorMsg = t.common.error;
            if (result.error === 'insufficient_funds') {
                errorMsg = t.savings.insufficientFunds;
            } else if (result.error === 'no_active_loan') {
                errorMsg = t.loan.repay.noLoan;
            }
            return `
                <p><strong>${t.loan.menu.options[2]}</strong></p>
                <p>&nbsp;</p>
                <p class="message-error">${errorMsg}</p>
                <p>&nbsp;</p>
                <p>${t.common.back}</p>
            `;
        }

        if (result.completed) {
            return `
                <p><strong>${t.loan.menu.options[2]}</strong></p>
                <p>&nbsp;</p>
                <p class="message-success">${t.loan.repay.completed}</p>
                <p>&nbsp;</p>
                <p>Nouveau solde: ${result.newBalance.toLocaleString()} FC</p>
                <p>&nbsp;</p>
                <p>${t.common.back}</p>
            `;
        }

        return `
            <p><strong>${t.loan.menu.options[2]}</strong></p>
            <p>&nbsp;</p>
            <p class="message-success">Remboursement effectue!</p>
            <p>&nbsp;</p>
            <p>${t.loan.repay.remaining.replace('{remaining}', result.remaining.toLocaleString())}</p>
            <p>Nouveau solde: ${result.newBalance.toLocaleString()} FC</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderLoans() {
        const t = USSDState.t();
        const loans = USSDState.getActiveLoans();
        
        if (loans.length === 0) {
            return `
                <p><strong>${t.loan.history.title}</strong></p>
                <p>&nbsp;</p>
                <p>${t.loan.history.noLoans}</p>
                <p>&nbsp;</p>
                <p>${t.common.back}</p>
            `;
        }

        let loansList = `<p><strong>${t.loan.history.title}</strong></p><p>&nbsp;</p>`;
        loans.forEach((loan, index) => {
            const status = loan.status === 'active' ? t.loan.history.active : t.loan.history.paid;
            loansList += `<p>${index + 1}. ${loan.amount.toLocaleString()} FC - ${status}</p>`;
            if (loan.status === 'active') {
                loansList += `<p>   Reste: ${loan.remaining.toLocaleString()} FC</p>`;
            }
        });
        loansList += `<p>&nbsp;</p><p>${t.common.back}</p>`;
        return loansList;
    },

    handleInput(input) {
        const t = USSDState.t();
        const currentMenu = USSDState.currentMenu;

        // Handle back
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

            case 'loan_pin':
                const authResult = USSDState.authenticate(USSDState.session.tempData.phone, input);
                if (!authResult.success) {
                    if (authResult.error === 'account_not_found') {
                        return this.renderPinPrompt() + `<p class="message-error">${t.balance.accountNotFound}</p>`;
                    }
                    return this.renderPinPrompt() + `<p class="message-error">${t.balance.wrongPin}</p>`;
                }
                USSDState.navigateTo('loan_menu');
                return this.renderMenu();

            case 'loan_menu':
                switch (input) {
                    case '1':
                        USSDState.navigateTo('loan_eligibility');
                        return this.renderEligibility();
                    case '2':
                        const eligibility = USSDState.getEligibility();
                        if (!eligibility || !eligibility.eligible) {
                            USSDState.navigateTo('loan_result');
                            return this.renderRequestResult({ success: false });
                        }
                        USSDState.navigateTo('loan_request');
                        return this.renderRequestPrompt();
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

            case 'loan_request':
                const requestAmount = parseInt(input);
                const elig = USSDState.getEligibility();
                if (isNaN(requestAmount) || requestAmount <= 0) {
                    return this.renderRequestPrompt() + `<p class="message-error">${t.savings.invalidAmount}</p>`;
                }
                if (requestAmount > elig.maxAmount) {
                    return this.renderRequestPrompt() + `<p class="message-error">Montant trop eleve</p>`;
                }
                const loanResult = USSDState.requestLoan(requestAmount);
                USSDState.navigateTo('loan_result');
                return this.renderRequestResult(loanResult);

            case 'loan_repay':
                const loans = USSDState.getActiveLoans();
                const activeLoan = loans.find(l => l.status === 'active');
                if (!activeLoan) {
                    USSDState.currentMenu = 'loan_menu';
                    return this.renderMenu();
                }
                const repayAmount = parseInt(input);
                if (isNaN(repayAmount) || repayAmount <= 0) {
                    return this.renderRepayPrompt() + `<p class="message-error">${t.savings.invalidAmount}</p>`;
                }
                const repayResult = USSDState.repayLoan(repayAmount);
                USSDState.navigateTo('loan_repay_result');
                return this.renderRepayResult(repayResult);

            case 'loan_result':
            case 'loan_repay_result':
                USSDState.currentMenu = 'loan_menu';
                return this.renderMenu();

            default:
                return MenuRoot.render();
        }
    },

    renderByState() {
        const state = USSDState.currentMenu;
        switch (state) {
            case 'loan_phone': return this.renderPhonePrompt();
            case 'loan_pin': return this.renderPinPrompt();
            case 'loan_menu': return this.renderMenu();
            case 'loan_eligibility': return this.renderEligibility();
            case 'loan_request': return this.renderRequestPrompt();
            case 'loan_repay': return this.renderRepayPrompt();
            case 'loan_history': return this.renderLoans();
            default: return this.renderPhonePrompt();
        }
    },

    isValidPhone(phone) {
        return /^0[0-9]{9}$/.test(phone);
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.MenuLoan = MenuLoan;
}
