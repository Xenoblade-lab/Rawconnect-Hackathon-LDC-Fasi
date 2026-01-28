// USSD State Machine
const USSDState = {
    // Current state
    currentMenu: 'idle',
    menuStack: [],
    language: 'fr',
    
    // Session data
    session: {
        phone: null,
        pin: null,
        name: null,
        isAuthenticated: false,
        tempData: {}
    },

    // Demo data (used when backend is not available)
    demoMode: true,
    demoAccounts: {
        '0812345678': {
            name: 'Maman Marie',
            pin: '1234',
            balance: 15000,
            score: 72,
            savings: 8500,
            loans: [
                { amount: 25000, remaining: 8000, status: 'active', date: '2025-01-15' }
            ],
            transactions: [
                { type: 'deposit', amount: 5000, date: '2025-01-20' },
                { type: 'deposit', amount: 3000, date: '2025-01-18' },
                { type: 'withdrawal', amount: 2000, date: '2025-01-16' }
            ]
        }
    },

    // Get current language strings
    t() {
        return this.language === 'fr' ? window.FR : window.LINGALA;
    },

    // Reset session
    resetSession() {
        this.session = {
            phone: null,
            pin: null,
            name: null,
            isAuthenticated: false,
            tempData: {}
        };
        this.menuStack = [];
        this.currentMenu = 'idle';
    },

    // Navigate to a menu
    navigateTo(menu) {
        if (this.currentMenu !== 'idle') {
            this.menuStack.push(this.currentMenu);
        }
        this.currentMenu = menu;
    },

    // Go back to previous menu
    goBack() {
        if (this.menuStack.length > 0) {
            this.currentMenu = this.menuStack.pop();
        } else {
            this.currentMenu = 'main';
        }
    },

    // Demo mode helpers
    getAccount(phone) {
        return this.demoAccounts[phone] || null;
    },

    createAccount(phone, name, pin) {
        this.demoAccounts[phone] = {
            name: name,
            pin: pin,
            balance: 0,
            score: 10,
            savings: 0,
            loans: [],
            transactions: []
        };
        return true;
    },

    authenticate(phone, pin) {
        const account = this.getAccount(phone);
        if (!account) return { success: false, error: 'account_not_found' };
        if (account.pin !== pin) return { success: false, error: 'wrong_pin' };
        
        this.session.phone = phone;
        this.session.pin = pin;
        this.session.name = account.name;
        this.session.isAuthenticated = true;
        
        return { success: true, account };
    },

    deposit(amount) {
        if (!this.session.isAuthenticated) return { success: false };
        const account = this.getAccount(this.session.phone);
        if (!account) return { success: false };
        
        account.balance += amount;
        account.savings += amount;
        account.transactions.unshift({
            type: 'deposit',
            amount: amount,
            date: new Date().toISOString().split('T')[0]
        });
        
        // Increase score slightly
        account.score = Math.min(100, account.score + 2);
        
        return { success: true, newBalance: account.balance };
    },

    withdraw(amount) {
        if (!this.session.isAuthenticated) return { success: false };
        const account = this.getAccount(this.session.phone);
        if (!account) return { success: false };
        
        if (account.balance < amount) {
            return { success: false, error: 'insufficient_funds' };
        }
        
        account.balance -= amount;
        account.transactions.unshift({
            type: 'withdrawal',
            amount: amount,
            date: new Date().toISOString().split('T')[0]
        });
        
        return { success: true, newBalance: account.balance };
    },

    getEligibility() {
        if (!this.session.isAuthenticated) return null;
        const account = this.getAccount(this.session.phone);
        if (!account) return null;
        
        const score = account.score;
        let maxAmount = 0;
        
        if (score >= 80) maxAmount = 100000;
        else if (score >= 60) maxAmount = 50000;
        else if (score >= 40) maxAmount = 25000;
        else maxAmount = 0;
        
        return {
            score: score,
            maxAmount: maxAmount,
            eligible: score >= 40
        };
    },

    requestLoan(amount) {
        if (!this.session.isAuthenticated) return { success: false };
        const account = this.getAccount(this.session.phone);
        if (!account) return { success: false };
        
        const eligibility = this.getEligibility();
        if (!eligibility.eligible || amount > eligibility.maxAmount) {
            return { success: false, error: 'not_eligible' };
        }
        
        // 10% interest
        const totalRepayment = Math.round(amount * 1.10);
        
        account.loans.push({
            amount: amount,
            remaining: totalRepayment,
            status: 'active',
            date: new Date().toISOString().split('T')[0]
        });
        
        account.balance += amount;
        
        return { 
            success: true, 
            amount: amount,
            totalRepayment: totalRepayment,
            newBalance: account.balance
        };
    },

    repayLoan(amount) {
        if (!this.session.isAuthenticated) return { success: false };
        const account = this.getAccount(this.session.phone);
        if (!account) return { success: false };
        
        const activeLoan = account.loans.find(l => l.status === 'active');
        if (!activeLoan) {
            return { success: false, error: 'no_active_loan' };
        }
        
        if (account.balance < amount) {
            return { success: false, error: 'insufficient_funds' };
        }
        
        account.balance -= amount;
        activeLoan.remaining -= amount;
        
        if (activeLoan.remaining <= 0) {
            activeLoan.status = 'paid';
            activeLoan.remaining = 0;
            account.score = Math.min(100, account.score + 10);
            return { success: true, completed: true, newBalance: account.balance };
        }
        
        account.score = Math.min(100, account.score + 3);
        
        return { 
            success: true, 
            completed: false, 
            remaining: activeLoan.remaining,
            newBalance: account.balance
        };
    },

    getActiveLoans() {
        if (!this.session.isAuthenticated) return [];
        const account = this.getAccount(this.session.phone);
        if (!account) return [];
        return account.loans;
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.USSDState = USSDState;
}
