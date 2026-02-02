// Root Menu Handler
const MenuRoot = {
    render() {
        const t = window.USSDState.t();
        return `
            <p><strong>${t.welcome}</strong></p>
            <p>&nbsp;</p>
            <p>1. ${t.mainMenu.options[0]}</p>
            <p>2. ${t.mainMenu.options[1]}</p>
            <p>3. ${t.mainMenu.options[2]}</p>
            <p>4. ${t.mainMenu.options[3]}</p>
            <p>5. ${t.mainMenu.options[4]}</p>
        `;
    },

    async handleInput(input) {
        const MenuRegister = window.MenuRegister;
        const MenuBalance = window.MenuBalance;
        const MenuSavings = window.MenuSavings;
        const MenuLoan = window.MenuLoan;
        const MenuHelpLang = window.MenuHelpLang;
        const USSDState = window.USSDState;

        switch (input) {
            case '1':
                USSDState.navigateTo('register_name');
                return MenuRegister.renderNamePrompt();
            case '2':
                USSDState.navigateTo('balance_phone');
                return MenuBalance.renderPhonePrompt();
            case '3':
                USSDState.navigateTo('savings_phone');
                return MenuSavings.renderPhonePrompt();
            case '4':
                USSDState.navigateTo('loan_phone');
                return MenuLoan.renderPhonePrompt();
            case '5':
                USSDState.navigateTo('help');
                return MenuHelpLang.render();
            default:
                return this.render() + '<p class="message-error">Option invalide</p>';
        }
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.MenuRoot = MenuRoot;
}
