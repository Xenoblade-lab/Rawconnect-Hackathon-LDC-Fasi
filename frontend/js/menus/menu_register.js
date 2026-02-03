// Register Menu Handler — RAWCONNECT

const MenuRegister = {
    renderNamePrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.register.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.register.enterName}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderPhonePrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.register.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.register.enterPhone}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderPinPrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.register.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.register.enterPin}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderConfirmPinPrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.register.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.register.confirmPin}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderSuccess() {
        const t = window.USSDState.t();
        const footer = window.USSDState.getActionCompletedFooter();
        return `
            <p><strong>${t.register.title}</strong></p>
            <p>&nbsp;</p>
            <p class="message-success">${t.register.success}</p>
            <p>&nbsp;</p>
            <p>Bienvenue, ${window.USSDState.session.tempData.name}!</p>
            ${footer}
        `;
    },

    async handleInput(input) {
        const t = window.USSDState.t();
        const USSDState = window.USSDState;
        const MenuRoot = window.MenuRoot;
        const currentMenu = USSDState.currentMenu;

        if (currentMenu === 'register_success' && (input === '0' || input === '1' || input === '2')) {
            USSDState.session.tempData = {};
            if (input === '1' || input === '0') { USSDState.currentMenu = 'main'; return MenuRoot.render(); }
            if (input === '2') { if (window.showIdleScreen) window.showIdleScreen(); return ''; }
        }

        if (input === '0') {
            USSDState.session.tempData = {};
            USSDState.goBack();
            if (USSDState.currentMenu === 'main' || USSDState.currentMenu === 'idle') {
                USSDState.currentMenu = 'main';
                return MenuRoot.render();
            }
            return this.renderByState();
        }

        switch (currentMenu) {
            case 'register_name':
                if (input.length < 2) {
                    return this.renderNamePrompt() + '<p class="message-error">Nom trop court</p>';
                }
                USSDState.session.tempData.name = input;
                USSDState.navigateTo('register_phone');
                return this.renderPhonePrompt();

            case 'register_phone': {
                if (!this.isValidPhone(input)) {
                    return this.renderPhonePrompt() + `<p class="message-error">${t.register.invalidPhone}</p>`;
                }
                const exists = await USSDState.phoneExists(input);
                if (exists) {
                    return this.renderPhonePrompt() + `<p class="message-error">${t.register.phoneExists}</p>`;
                }
                USSDState.session.tempData.phone = input;
                USSDState.navigateTo('register_pin');
                return this.renderPinPrompt();
            }

            case 'register_pin':
                if (!this.isValidPin(input)) {
                    return this.renderPinPrompt() + `<p class="message-error">${t.register.invalidPin}</p>`;
                }
                USSDState.session.tempData.pin = input;
                USSDState.navigateTo('register_confirm_pin');
                return this.renderConfirmPinPrompt();

            case 'register_confirm_pin': {
                if (input !== USSDState.session.tempData.pin) {
                    USSDState.goBack();
                    return this.renderPinPrompt() + `<p class="message-error">${t.register.pinMismatch}</p>`;
                }
                const { name, phone, pin } = USSDState.session.tempData;
                const created = await USSDState.createAccount(phone, name, pin);
                if (!created || !created.success) {
                    return this.renderConfirmPinPrompt() + `<p class="message-error">${(created && created.error) || t.common.error}</p>`;
                }
                if (window.pushSMSFeedback) window.pushSMSFeedback('Compte créé. Bienvenue sur RAWCONNECT!', { recipient: 'client', phone: USSDState.session.tempData.phone });
                USSDState.navigateTo('register_success');
                return this.renderSuccess();
            }

            case 'register_success':
                USSDState.session.tempData = {};
                USSDState.currentMenu = 'main';
                return MenuRoot.render();

            default:
                return MenuRoot.render();
        }
    },

    renderByState() {
        const state = window.USSDState.currentMenu;
        switch (state) {
            case 'register_name': return this.renderNamePrompt();
            case 'register_phone': return this.renderPhonePrompt();
            case 'register_pin': return this.renderPinPrompt();
            case 'register_confirm_pin': return this.renderConfirmPinPrompt();
            default: return this.renderNamePrompt();
        }
    },

    isValidPhone(phone) {
        return /^0[0-9]{9}$/.test(phone);
    },

    isValidPin(pin) {
        return /^[0-9]{4}$/.test(pin);
    }
};

if (typeof window !== 'undefined') {
    window.MenuRegister = MenuRegister;
}
