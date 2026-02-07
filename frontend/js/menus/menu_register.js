// Register Menu Handler — RAWCONNECT (KYC L1: nom, téléphone, DOB, activité, OTP)

const ACTIVITY_OPTIONS = [
    { key: 'marché', label: 'Marche' },
    { key: 'étudiant', label: 'Etudiant' },
    { key: 'agriculture', label: 'Agriculture' },
    { key: 'commerce', label: 'Commerce' },
    { key: 'artisan', label: 'Artisan' },
    { key: 'autre', label: 'Autre' }
];

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

    renderDobPrompt() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.register.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.register.enterDob}</p>
            <p>&nbsp;</p>
            <p class="input-hint">${t.common.typeBelowThenSend}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderActivityPrompt() {
        const t = window.USSDState.t();
        const opts = ACTIVITY_OPTIONS.map((a, i) => `${i + 1}. ${a.label}`).join('<br>');
        return `
            <p><strong>${t.register.title}</strong></p>
            <p>&nbsp;</p>
            <p>${t.register.enterActivity}</p>
            <p>&nbsp;</p>
            <p>${opts}</p>
            <p>&nbsp;</p>
            <p>${t.common.back}</p>
        `;
    },

    renderOtpPrompt(otpCode) {
        const t = window.USSDState.t();
        const smsHint = otpCode
            ? `<p class="message-success">SMS recu! Code OTP: <strong>${otpCode}</strong></p><p>&nbsp;</p>`
            : '';
        return `
            <p><strong>${t.register.title}</strong></p>
            <p>&nbsp;</p>
            ${smsHint}
            <p>${t.register.enterOtp}</p>
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

    renderProcessing() {
        const t = window.USSDState.t();
        const msg = t.register.processingMessage || 'Traitement en cours (simulation 24h)... 3 secondes.';
        return `
            <p><strong>${t.register.title}</strong></p>
            <p>&nbsp;</p>
            <p class="message-info">${msg}</p>
            <p>&nbsp;</p>
            <p>Vous recevrez un SMS de confirmation.</p>
            <p>&nbsp;</p>
            <p class="input-hint">Veuillez patienter... ou tapez 1 pour continuer.</p>
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
                USSDState.navigateTo('register_dob');
                return this.renderDobPrompt();
            }

            case 'register_dob': {
                if (!this.isValidDob(input)) {
                    return this.renderDobPrompt() + `<p class="message-error">${t.register.invalidDob || 'Format: JJ/MM/AAAA (ex: 15/03/1990)'}</p>`;
                }
                USSDState.session.tempData.date_of_birth = input;
                USSDState.navigateTo('register_activity');
                return this.renderActivityPrompt();
            }

            case 'register_activity': {
                const num = parseInt(input, 10);
                if (num < 1 || num > ACTIVITY_OPTIONS.length) {
                    return this.renderActivityPrompt() + `<p class="message-error">${t.register.invalidActivity || 'Choisissez 1 à ' + ACTIVITY_OPTIONS.length}</p>`;
                }
                USSDState.session.tempData.activity_type = ACTIVITY_OPTIONS[num - 1].key;
                const phone = USSDState.session.tempData.phone;
                const sent = await USSDState.sendOtp(phone);
                if (!sent || !sent.success) {
                    return this.renderActivityPrompt() + `<p class="message-error">${t.register.otpSendError || 'Erreur envoi OTP'}</p>`;
                }
                USSDState.session.tempData.otpCode = sent.code || null;
                if (window.pushSMSFeedback && sent.code) {
                    window.pushSMSFeedback(
                        'RAWCONNECT - Votre code de verification: ' + sent.code + '. Valide 5 min.',
                        { recipient: 'client', phone }
                    );
                }
                USSDState.navigateTo('register_otp');
                return this.renderOtpPrompt(USSDState.session.tempData.otpCode);
            }

            case 'register_otp': {
                if (!this.isValidOtp(input)) {
                    return this.renderOtpPrompt(USSDState.session.tempData.otpCode) + `<p class="message-error">${t.register.invalidOtp || 'Code à 6 chiffres requis'}</p>`;
                }
                const verified = await USSDState.verifyOtp(USSDState.session.tempData.phone, input);
                if (!verified) {
                    return this.renderOtpPrompt(USSDState.session.tempData.otpCode) + `<p class="message-error">${t.register.invalidOtp || 'Code OTP invalide ou expiré'}</p>`;
                }
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
                USSDState.navigateTo('register_processing');
                if (window.scheduleRegisterComplete) window.scheduleRegisterComplete(3000);
                return this.renderProcessing();
            }

            case 'register_processing': {
                const { name, phone, pin, date_of_birth, activity_type } = USSDState.session.tempData;
                const created = await USSDState.createAccount(phone, name, pin, date_of_birth, activity_type);
                if (!created || !created.success) {
                    USSDState.goBack();
                    return this.renderConfirmPinPrompt() + `<p class="message-error">${(created && created.error) || t.common.error}</p>`;
                }
                if (window.pushSMSFeedback) {
                    window.pushSMSFeedback(
                        'RAWCONNECT - Votre compte a été créé avec succès! Bienvenue. Vous pouvez maintenant épargner et demander du crédit.',
                        { recipient: 'client', phone }
                    );
                }
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
            case 'register_dob': return this.renderDobPrompt();
            case 'register_activity': return this.renderActivityPrompt();
            case 'register_otp': return this.renderOtpPrompt(USSDState.session.tempData.otpCode);
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
    },

    isValidDob(dob) {
        return /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(dob) || /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(dob);
    },

    isValidOtp(code) {
        return /^[0-9]{6}$/.test(code);
    }
};

if (typeof window !== 'undefined') {
    window.MenuRegister = MenuRegister;
}
