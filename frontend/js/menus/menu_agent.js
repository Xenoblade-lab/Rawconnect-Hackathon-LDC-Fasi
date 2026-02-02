// RAWCONNECT — Menu Agent (dépôt/retrait via agent)

const MenuAgent = {
    renderPhonePrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>RAWCONNECT Agent</strong></p>
            <p>&nbsp;</p>
            <p>Entrez votre numero agent:</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderPinPrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>RAWCONNECT Agent</strong></p>
            <p>&nbsp;</p>
            <p>Entrez votre code PIN agent:</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderMenu() {
        return `
            <p><strong>RAWCONNECT Agent</strong></p>
            <p>Bienvenue ${window.USSDState.session.agentName || 'Agent'}!</p>
            <p>&nbsp;</p>
            <p>1. Depot client</p>
            <p>2. Retrait client</p>
            <p>3. Consulter float</p>
            <p>4. Consulter commissions</p>
            <p>5. Recharger float</p>
            <p>6. Historique transactions</p>
            <p>&nbsp;</p>
            <p>0. Quitter</p>
        `;
    },

    renderDepositClientPrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>Depot client</strong></p>
            <p>&nbsp;</p>
            <p>Entrez le telephone du client:</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderDepositAmountPrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>Depot client</strong></p>
            <p>&nbsp;</p>
            <p>Montant recu (cash) en FC:</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderWithdrawClientPrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>Retrait client</strong></p>
            <p>&nbsp;</p>
            <p>Entrez le telephone du client:</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderWithdrawAmountPrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>Retrait client</strong></p>
            <p>&nbsp;</p>
            <p>Montant a retirer en FC:</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderResult(success, message) {
        const footer = window.USSDState.getActionCompletedFooter();
        return `
            <p><strong>RAWCONNECT Agent</strong></p>
            <p>&nbsp;</p>
            <p class="${success ? 'message-success' : 'message-error'}">${message}</p>
            ${footer}
        `;
    },

    renderFloat(floatVal) {
        const footer = window.USSDState.getActionCompletedFooter();
        const f = typeof floatVal === 'number' ? floatVal : parseFloat(floatVal) || 0;
        return `
            <p><strong>RAWCONNECT Agent</strong></p>
            <p>&nbsp;</p>
            <p>Votre float disponible:</p>
            <div class="score-display"><span class="score-value">${f.toLocaleString()}</span><span class="score-label">FC</span></div>
            ${footer}
        `;
    },

    renderCommissions(commVal) {
        const footer = window.USSDState.getActionCompletedFooter();
        const c = typeof commVal === 'number' ? commVal : parseFloat(commVal) || 0;
        return `
            <p><strong>RAWCONNECT Agent</strong></p>
            <p>&nbsp;</p>
            <p>Vos commissions accumulees:</p>
            <div class="score-display"><span class="score-value">${c.toLocaleString()}</span><span class="score-label">FC</span></div>
            ${footer}
        `;
    },

    renderReloadPrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>Recharger float</strong></p>
            <p>&nbsp;</p>
            <p>Montant a ajouter au float (FC):</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    async renderHistory() {
        const txs = await window.USSDState.getAgentTransactions();
        const footer = window.USSDState.getActionCompletedFooter();
        if (!txs || txs.length === 0) {
            return `
                <p><strong>Historique Agent</strong></p>
                <p>&nbsp;</p>
                <p>Aucune transaction.</p>
                ${footer}
            `;
        }
        let html = `<p><strong>Historique Agent</strong></p><p>&nbsp;</p>`;
        txs.slice(0, 10).forEach(tx => {
            const type = tx.type === 'deposit' ? 'Depot' : (tx.type === 'withdrawal' ? 'Retrait' : tx.type || '');
            const amt = tx.amount != null ? Number(tx.amount).toLocaleString() : '0';
            const comm = tx.commission != null ? Number(tx.commission).toLocaleString() : '0';
            const dt = tx.created_at ? String(tx.created_at).slice(0, 16) : '';
            html += `<p>${dt}: ${type} ${amt} FC (+${comm} FC)</p>`;
        });
        html += footer;
        return html;
    },

    isValidPhone(phone) {
        return /^0[0-9]{9}$/.test(String(phone).trim());
    },

    async handleInput(input) {
        const USSDState = window.USSDState;
        const currentMenu = USSDState.currentMenu;

        if ((currentMenu === 'agent_float' || currentMenu === 'agent_commissions' || currentMenu === 'agent_deposit_result' || currentMenu === 'agent_withdraw_result' || currentMenu === 'agent_reload_result' || currentMenu === 'agent_history') && (input === '0' || input === '1' || input === '2')) {
            if (input === '0') { USSDState.currentMenu = 'agent_menu'; return this.renderMenu(); }
            if (input === '1') { USSDState.currentMenu = 'agent_menu'; return this.renderMenu(); }
            if (input === '2') { if (window.showIdleScreen) window.showIdleScreen(); return ''; }
        }

        if (input === '0') {
            if (currentMenu === 'agent_phone') {
                if (window.showIdleScreen) window.showIdleScreen();
                return '';
            }
            USSDState.goBackAgent();
            if (USSDState.currentMenu === 'agent_menu') {
                return this.renderMenu();
            }
            return this.renderByState();
        }

        switch (currentMenu) {
            case 'agent_phone':
                if (!this.isValidPhone(input)) {
                    return this.renderPhonePrompt() + '<p class="message-error">Numero invalide</p>';
                }
                USSDState.session.agentPhone = input;
                USSDState.navigateToAgent('agent_pin');
                return this.renderPinPrompt();

            case 'agent_pin': {
                const r = await window.ApiClient.agentAuthenticate(USSDState.session.agentPhone, input);
                if (!r.success) {
                    if (r.error === 'connection_error') {
                        return this.renderPinPrompt() + `<p class="message-error">${window.USSDState.t().balance.connectionError || "Impossible de joindre le serveur."}</p>`;
                    }
                    if (r.error === 'wrong_pin') {
                        return this.renderPinPrompt() + '<p class="message-error">Code PIN agent incorrect.</p>';
                    }
                    return this.renderPinPrompt() + '<p class="message-error">Agent introuvable.</p>';
                }
                USSDState.session.agentPin = input;
                USSDState.session.agentName = r.name || 'Agent';
                USSDState.session.agentFloat = r.float != null ? r.float : 0;
                USSDState.session.agentCommissionBalance = r.commission_balance != null ? r.commission_balance : 0;
                if (USSDState.savePollingSession) USSDState.savePollingSession();
                USSDState.navigateToAgent('agent_menu');
                return this.renderMenu();
            }

            case 'agent_menu':
                if (input === '0') {
                    if (window.showIdleScreen) window.showIdleScreen();
                    return '';
                }
                switch (input) {
                    case '1': USSDState.navigateToAgent('agent_deposit_client'); return this.renderDepositClientPrompt();
                    case '2': USSDState.navigateToAgent('agent_withdraw_client'); return this.renderWithdrawClientPrompt();
                    case '3': USSDState.navigateToAgent('agent_float'); return this.renderFloat(USSDState.session.agentFloat || 0);
                    case '4': USSDState.navigateToAgent('agent_commissions'); return this.renderCommissions(USSDState.session.agentCommissionBalance || 0);
                    case '5': USSDState.navigateToAgent('agent_reload'); return this.renderReloadPrompt();
                    case '6': USSDState.navigateToAgent('agent_history'); return await this.renderHistory();
                    default: return this.renderMenu() + '<p class="message-error">Option invalide</p>';
                }

            case 'agent_deposit_client':
                if (!this.isValidPhone(input)) {
                    return this.renderDepositClientPrompt() + '<p class="message-error">Numero client invalide</p>';
                }
                USSDState.session.tempClientPhone = input;
                USSDState.navigateToAgent('agent_deposit_amount');
                return this.renderDepositAmountPrompt();

            case 'agent_deposit_amount': {
                const amt = parseInt(input, 10);
                if (isNaN(amt) || amt < 100) {
                    return this.renderDepositAmountPrompt() + '<p class="message-error">Montant invalide (min 100 FC)</p>';
                }
                const r = await window.ApiClient.agentDeposit(USSDState.session.agentPhone, USSDState.session.agentPin || '', USSDState.session.tempClientPhone, amt);
                USSDState.navigateToAgent('agent_deposit_result');
                if (r.success) {
                    USSDState.session.agentFloat = r.newFloat;
                    USSDState.session.agentCommissionBalance = (USSDState.session.agentCommissionBalance || 0) + (r.commission || 0);
                    // Les SMS sont envoyés via le backend et reçus par polling (agent + client)
                    return this.renderResult(true, `Depot de ${amt.toLocaleString()} FC pour ${r.clientName || 'client'} effectue. Commission: ${(r.commission || 0).toLocaleString()} FC. Nouveau float: ${(r.newFloat || 0).toLocaleString()} FC.`);
                }
                let errMsg = r.error || 'Erreur';
                if (r.code === 'insufficient_float') errMsg = 'Float agent insuffisant.';
                else if (r.code === 'not_found') errMsg = 'Client introuvable.';
                return this.renderResult(false, errMsg);
            }

            case 'agent_withdraw_client':
                if (!this.isValidPhone(input)) {
                    return this.renderWithdrawClientPrompt() + '<p class="message-error">Numero client invalide</p>';
                }
                USSDState.session.tempClientPhone = input;
                USSDState.navigateToAgent('agent_withdraw_amount');
                return this.renderWithdrawAmountPrompt();

            case 'agent_withdraw_amount': {
                const amt = parseInt(input, 10);
                if (isNaN(amt) || amt < 100) {
                    return this.renderWithdrawAmountPrompt() + '<p class="message-error">Montant invalide (min 100 FC)</p>';
                }
                const r = await window.ApiClient.agentWithdraw(USSDState.session.agentPhone, USSDState.session.agentPin || '', USSDState.session.tempClientPhone, amt);
                USSDState.navigateToAgent('agent_withdraw_result');
                if (r.success) {
                    USSDState.session.agentFloat = r.newFloat;
                    USSDState.session.agentCommissionBalance = (USSDState.session.agentCommissionBalance || 0) + (r.commission || 0);
                    // Les SMS sont envoyés via le backend et reçus par polling (agent + client)
                    return this.renderResult(true, `Retrait de ${amt.toLocaleString()} FC pour ${r.clientName || 'client'}. Client recoit: ${(r.amountToClient || 0).toLocaleString()} FC. Commission: ${(r.commission || 0).toLocaleString()} FC. Nouveau float: ${(r.newFloat || 0).toLocaleString()} FC.`);
                }
                let errMsg = r.error || 'Erreur';
                if (r.code === 'insufficient_funds') errMsg = 'Solde client insuffisant.';
                else if (r.code === 'not_found') errMsg = 'Client introuvable.';
                return this.renderResult(false, errMsg);
            }

            case 'agent_reload': {
                const amt = parseInt(input, 10);
                if (isNaN(amt) || amt < 1000) {
                    return this.renderReloadPrompt() + '<p class="message-error">Montant invalide (min 1000 FC)</p>';
                }
                const r = await window.ApiClient.agentReload(USSDState.session.agentPhone, USSDState.session.agentPin || '', amt);
                USSDState.navigateToAgent('agent_reload_result');
                if (r.success) {
                    USSDState.session.agentFloat = r.newFloat;
                    return this.renderResult(true, `Float recharge: ${(r.newFloat || 0).toLocaleString()} FC.`);
                }
                return this.renderResult(false, r.error || 'Erreur');
            }

            case 'agent_float':
            case 'agent_commissions':
            case 'agent_deposit_result':
            case 'agent_withdraw_result':
            case 'agent_reload_result':
            case 'agent_history':
                USSDState.currentMenu = 'agent_menu';
                return this.renderMenu();

            default:
                return this.renderMenu();
        }
    },

    async renderByState() {
        const state = window.USSDState.currentMenu;
        switch (state) {
            case 'agent_phone': return this.renderPhonePrompt();
            case 'agent_pin': return this.renderPinPrompt();
            case 'agent_menu': return this.renderMenu();
            case 'agent_deposit_client': return this.renderDepositClientPrompt();
            case 'agent_deposit_amount': return this.renderDepositAmountPrompt();
            case 'agent_withdraw_client': return this.renderWithdrawClientPrompt();
            case 'agent_withdraw_amount': return this.renderWithdrawAmountPrompt();
            case 'agent_float': return this.renderFloat(window.USSDState.session.agentFloat || 0);
            case 'agent_commissions': return this.renderCommissions(window.USSDState.session.agentCommissionBalance || 0);
            case 'agent_reload': return this.renderReloadPrompt();
            case 'agent_history': return await this.renderHistory();
            default: return this.renderMenu();
        }
    }
};

if (typeof window !== 'undefined') {
    window.MenuAgent = MenuAgent;
}
