// Import USSDState and MenuRoot
const USSDState = require('../../ussd_state'); // Adjust the path as necessary
const MenuRoot = require('../menu_root'); // Adjust the path as necessary

// Register Menu Handler
const MenuRegister = {
    renderNamePrompt() {
        const t = USSDState.t();
        return `
            <p><strong>${t.register.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.register.enterName}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderPhonePrompt() {
        const t = USSDState.t();
        return `
            <p><strong>${t.register.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.register.enterPhone}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderPinPrompt() {
        const t = USSDState.t();
        return `
            <p><strong>${t.register.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.register.enterPin}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderConfirmPinPrompt() {
        const t = USSDState.t();
        return `
            <p><strong>${t.register.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.register.confirmPin}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderSuccess() {
        const t = USSDState.t();
        return `
            <p><strong>${t.register.title}</strong></p>
            <p>&nbsp;</p>
            <p class="message-success">${t.register.success}</p>
            <p>&nbsp;</p>
            <p>Bienvenue, ${USSDState.session.tempData.name}!</p>
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

            case 'register_phone':
                if (!this.isValidPhone(input)) {
                    return this.renderPhonePrompt() + `<p class="message-error">${t.register.invalidPhone}</p>`;
                }
                // Check if phone exists
                if (USSDState.getAccount(input)) {
                    return this.renderPhonePrompt() + `<p class="message-error">${t.register.phoneExists}</p>`;
                }
                USSDState.session.tempData.phone = input;
                USSDState.navigateTo('register_pin');
                return this.renderPinPrompt();

            case 'register_pin':
                if (!this.isValidPin(input)) {
                    return this.renderPinPrompt() + `<p class="message-error">${t.register.invalidPin}</p>`;
                }
                USSDState.session.tempData.pin = input;
                USSDState.navigateTo('register_confirm_pin');
                return this.renderConfirmPinPrompt();

            case 'register_confirm_pin':
                if (input !== USSDState.session.tempData.pin) {
                    USSDState.goBack();
                    return this.renderPinPrompt() + `<p class="message-error">${t.register.pinMismatch}</p>`;
                }
                // Create account
                const { name, phone, pin } = USSDState.session.tempData;
                USSDState.createAccount(phone, name, pin);
                USSDState.navigateTo('register_success');
                return this.renderSuccess();

            case 'register_success':
                USSDState.session.tempData = {};
                USSDState.currentMenu = 'main';
                return MenuRoot.render();

            default:
                return MenuRoot.render();
        }
    },

    renderByState() {
        const state = USSDState.currentMenu;
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

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.MenuRegister = MenuRegister;
}
