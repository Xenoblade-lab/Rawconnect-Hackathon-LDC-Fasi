<<<<<<< HEAD
// USSD State Machine — RAWCONNECT
// useApi: true => appels backend réels (ApiClient). false => démo locale.
// sessionStorage : persistance des mini-sessions client/agent par onglet (2 navigateurs démo)

const SESSION_STORAGE_KEY = "rawconnect-session";

const USSDState = {
    currentMenu: 'idle',
    menuStack: [],
    language: 'fr',
    useApi: true,

    session: {
        phone: null,
        pin: null,
        name: null,
        isAuthenticated: false,
        tempData: {},
        agentPhone: null,
        agentPin: null,
        agentName: null,
        agentFloat: 0,
        agentCommissionBalance: 0,
        tempClientPhone: null
    },
    agentMenuStack: [],

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

    t() {
        return this.language === 'fr' ? window.FR : window.LINGALA;
    },

    getActionCompletedFooter() {
        const t = this.t();
        return `<p>&nbsp;</p><p>${t.common.returnToPrevious}</p><p>${t.common.returnToMain}</p><p>${t.common.quit}</p>`;
    },

    resetSession() {
        this.session = {
            phone: null,
            pin: null,
            name: null,
            isAuthenticated: false,
            tempData: {},
            agentPhone: null,
            agentPin: null,
            agentName: null,
            agentFloat: 0,
            agentCommissionBalance: 0,
            tempClientPhone: null
        };
        this.menuStack = [];
        this.agentMenuStack = [];
        this.currentMenu = 'idle';
        this.clearPollingSession();
    },

    /** Sauvegarde la mini-session (client ou agent) pour le polling après reload */
    savePollingSession() {
        try {
            const s = this.session;
            if (s.agentPhone) {
                sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ role: 'agent', phone: s.agentPhone }));
            } else if (s.phone) {
                sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ role: 'client', phone: s.phone }));
            }
        } catch (e) { /* ignore */ }
    },

    /** Restaure la mini-session depuis sessionStorage (pour le polling SMS) */
    restorePollingSession() {
        try {
            const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (!data || !data.phone) return;
            if (data.role === 'agent') {
                this.session.agentPhone = data.phone;
            } else {
                this.session.phone = data.phone;
            }
        } catch (e) { /* ignore */ }
    },

    /** Efface la mini-session persistée */
    clearPollingSession() {
        try {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        } catch (e) { /* ignore */ }
    },

    navigateToAgent(menu) {
        if (this.currentMenu !== 'agent_phone' && this.currentMenu !== 'agent_main') {
            this.agentMenuStack.push(this.currentMenu);
        }
        this.currentMenu = menu;
    },

    goBackAgent() {
        if (this.agentMenuStack.length > 0) {
            this.currentMenu = this.agentMenuStack.pop();
        } else {
            this.currentMenu = 'agent_menu';
        }
    },

    async getAgentTransactions() {
        if (!this.useApi || !this.session.agentPhone || !this.session.agentPin) return [];
        const r = await (window.ApiClient || {}).agentTransactions(this.session.agentPhone, this.session.agentPin, 20);
        if (!r || !r.success || !Array.isArray(r.transactions)) return [];
        return r.transactions;
    },

    navigateTo(menu) {
        if (this.currentMenu !== 'idle') {
            this.menuStack.push(this.currentMenu);
        }
        this.currentMenu = menu;
    },

    goBack() {
        if (this.menuStack.length > 0) {
            this.currentMenu = this.menuStack.pop();
        } else {
            this.currentMenu = 'main';
        }
    },

    getAccount(phone) {
        if (this.useApi) return null;
        return this.demoAccounts[phone] || null;
    },

    async phoneExists(phone) {
        if (!this.useApi) return !!this.demoAccounts[phone];
        const r = await (window.ApiClient || {}).getUser(phone);
        return !!(r && r.success);
    },

    async createAccount(phone, name, pin) {
        if (!this.useApi) {
            this.demoAccounts[phone] = {
                name, pin, balance: 0, score: 10, savings: 0,
                loans: [], transactions: []
            };
            return { success: true };
        }
        const r = await (window.ApiClient || {}).register(phone, name, 'autre', pin);
        if (r && r.success) return { success: true };
        return { success: false, error: (r && r.error) || 'Erreur' };
    },

    async authenticate(phone, pin) {
        if (!this.useApi) {
            const account = this.demoAccounts[phone] || null;
            if (!account) return { success: false, error: 'account_not_found' };
            if (account.pin !== pin) return { success: false, error: 'wrong_pin' };
        this.session.phone = phone;
        this.session.pin = pin;
        this.session.name = account.name;
        this.session.isAuthenticated = true;
        this.savePollingSession();
        return { success: true, account };
        }
        const r = await (window.ApiClient || {}).authenticate(phone, pin);
        if (!r || !r.success) {
            const err = (r && r.error) || 'account_not_found';
            return {
                success: false,
                error: err === 'wrong_pin' ? 'wrong_pin' : err === 'connection_error' ? 'connection_error' : 'account_not_found'
            };
        }
        this.session.phone = phone;
        this.session.pin = pin;
        this.session.name = (r.user && r.user.name) || '';
        this.session.isAuthenticated = true;
        this.savePollingSession();
        return { success: true, account: r.account || r.user };
    },

    async getAccountForDisplay(phone) {
        if (!this.useApi) {
            const a = this.demoAccounts[phone];
            return a ? { balance: a.balance, score: a.score, name: a.name } : null;
        }
        const api = window.ApiClient;
        if (!api) return null;
        const [bal, sc] = await Promise.all([api.getBalance(phone), api.getScore(phone)]);
        if (!bal || !bal.success) return null;
        const name = (bal.user && bal.user.name) || '';
        const score = (sc && sc.success && sc.score != null) ? sc.score : 0;
        return { balance: bal.balance, score, name };
    },

    async getTransactions(phone) {
        if (!this.useApi) {
            const a = this.demoAccounts[phone];
            return a && a.transactions ? a.transactions : [];
        }
        const api = window.ApiClient;
        if (!api) return [];
        const r = await api.getTransactions(phone);
        if (!r || !r.success || !Array.isArray(r.transactions)) return [];
        return r.transactions.map(function(tx) {
            const created = tx.created_at || tx.date || '';
            const dateStr = created.length >= 10 ? created.substring(0, 10) : created;
            return { type: tx.type, amount: tx.amount, date: dateStr };
        });
    },

    async deposit(amount) {
        if (!this.session.isAuthenticated) return { success: false };
        if (!this.useApi) {
            const account = this.demoAccounts[this.session.phone];
            if (!account) return { success: false };
            account.balance += amount;
            account.savings += amount;
            account.transactions.unshift({
                type: 'deposit',
                amount,
                date: new Date().toISOString().split('T')[0]
            });
            account.score = Math.min(100, account.score + 2);
            return { success: true, newBalance: account.balance };
        }
        const r = await (window.ApiClient || {}).deposit(this.session.phone, amount);
        if (!r || !r.success) return { success: false };
        return { success: true, newBalance: r.newBalance };
    },

    async withdraw(amount) {
        if (!this.session.isAuthenticated) return { success: false };
        if (!this.useApi) {
            const account = this.demoAccounts[this.session.phone];
            if (!account) return { success: false };
            if (account.balance < amount) return { success: false, error: 'insufficient_funds' };
            account.balance -= amount;
            account.transactions.unshift({
                type: 'withdrawal',
                amount,
                date: new Date().toISOString().split('T')[0]
            });
            return { success: true, newBalance: account.balance };
        }
        const r = await (window.ApiClient || {}).withdraw(this.session.phone, amount);
        if (!r || !r.success) {
            return {
                success: false,
                error: r && r.isInsufficient ? 'insufficient_funds' : (r && r.error) || 'Erreur'
            };
        }
        return { success: true, newBalance: r.newBalance };
    },

    async getEligibility() {
        if (!this.session.isAuthenticated) return null;
        if (!this.useApi) {
            const account = this.demoAccounts[this.session.phone];
            if (!account) return null;
            const score = account.score;
            let maxAmount = 0;
            if (score >= 80) maxAmount = 100000;
            else if (score >= 60) maxAmount = 50000;
            else if (score >= 40) maxAmount = 25000;
            return { score, maxAmount, eligible: score >= 40 };
        }
        const r = await (window.ApiClient || {}).getLoanEligibility(this.session.phone);
        if (!r || !r.success) return null;
        return {
            score: r.score,
            maxAmount: r.maxAmount,
            eligible: !!r.eligible,
            durationDays: r.durationDays
        };
    },

    async requestLoan(amount) {
        if (!this.session.isAuthenticated) return { success: false };
        if (!this.useApi) {
            const account = this.demoAccounts[this.session.phone];
            if (!account) return { success: false };
            const eligibility = await this.getEligibility();
            if (!eligibility || !eligibility.eligible || amount > eligibility.maxAmount) {
                return { success: false, error: 'not_eligible' };
            }
            const totalRepayment = Math.round(amount * 1.10);
            account.loans.push({
                amount,
                remaining: totalRepayment,
                status: 'active',
                date: new Date().toISOString().split('T')[0]
            });
            account.balance += amount;
            return { success: true, amount, totalRepayment, newBalance: account.balance };
        }
        const r = await (window.ApiClient || {}).acceptLoan(this.session.phone, amount);
        if (!r || !r.success) {
            return { success: false, error: (r && r.error) || 'not_eligible' };
        }
        return {
            success: true,
            amount,
            totalRepayment: r.totalRepayment,
            newBalance: r.newBalance,
            durationDays: r.durationDays
        };
    },

    async repayLoan(amount) {
        if (!this.session.isAuthenticated) return { success: false };
        if (!this.useApi) {
            const account = this.demoAccounts[this.session.phone];
            if (!account) return { success: false };
            const activeLoan = account.loans.find(l => l.status === 'active');
            if (!activeLoan) return { success: false, error: 'no_active_loan' };
            if (account.balance < amount) return { success: false, error: 'insufficient_funds' };
            account.balance -= amount;
            activeLoan.remaining -= amount;
            if (activeLoan.remaining <= 0) {
                activeLoan.status = 'paid';
                activeLoan.remaining = 0;
                account.score = Math.min(100, account.score + 10);
                return { success: true, completed: true, remaining: 0, newBalance: account.balance };
            }
            account.score = Math.min(100, account.score + 3);
            return { success: true, completed: false, remaining: activeLoan.remaining, newBalance: account.balance };
        }
        const r = await (window.ApiClient || {}).repayLoan(this.session.phone, amount);
        if (!r || !r.success) {
            return {
                success: false,
                error: (r && r.noActiveLoan) ? 'no_active_loan' : ((r && r.isInsufficient) ? 'insufficient_funds' : (r && r.error) || 'Erreur')
            };
        }
        return {
            success: true,
            completed: !!r.completed,
            remaining: r.remaining,
            newBalance: r.newBalance
        };
    },

    getActiveLoans() {
        if (!this.session.isAuthenticated) return [];
        if (this.useApi) return [];
        const account = this.demoAccounts[this.session.phone];
        return account ? account.loans : [];
    }
};

if (typeof window !== 'undefined') {
    window.USSDState = USSDState;
}
=======
// USSD State Machine — RAWCONNECT
// useApi: true => appels backend réels (ApiClient). false => démo locale.

const USSDState = {
    currentMenu: 'idle',
    menuStack: [],
    language: 'fr',
    useApi: true,

    session: {
        phone: null,
        pin: null,
        name: null,
        isAuthenticated: false,
        tempData: {}
    },

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

    t() {
        return this.language === 'fr' ? window.FR : window.LINGALA;
    },

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

    navigateTo(menu) {
        if (this.currentMenu !== 'idle') {
            this.menuStack.push(this.currentMenu);
        }
        this.currentMenu = menu;
    },

    goBack() {
        if (this.menuStack.length > 0) {
            this.currentMenu = this.menuStack.pop();
        } else {
            this.currentMenu = 'main';
        }
    },

    getAccount(phone) {
        if (this.useApi) return null;
        return this.demoAccounts[phone] || null;
    },

    async phoneExists(phone) {
        if (!this.useApi) return !!this.demoAccounts[phone];
        const r = await (window.ApiClient || {}).getUser(phone);
        return !!(r && r.success);
    },

    async createAccount(phone, name, pin) {
        if (!this.useApi) {
            this.demoAccounts[phone] = {
                name, pin, balance: 0, score: 10, savings: 0,
                loans: [], transactions: []
            };
            return { success: true };
        }
        const r = await (window.ApiClient || {}).register(phone, name, 'autre', pin);
        if (r && r.success) return { success: true };
        return { success: false, error: (r && r.error) || 'Erreur' };
    },

    async authenticate(phone, pin) {
        if (!this.useApi) {
            const account = this.demoAccounts[phone] || null;
            if (!account) return { success: false, error: 'account_not_found' };
            if (account.pin !== pin) return { success: false, error: 'wrong_pin' };
            this.session.phone = phone;
            this.session.pin = pin;
            this.session.name = account.name;
            this.session.isAuthenticated = true;
            return { success: true, account };
        }
        const r = await (window.ApiClient || {}).authenticate(phone, pin);
        if (!r || !r.success) {
            return {
                success: false,
                error: (r && (r.error === 'wrong_pin' ? 'wrong_pin' : 'account_not_found')) || 'account_not_found'
            };
        }
        this.session.phone = phone;
        this.session.pin = pin;
        this.session.name = (r.user && r.user.name) || '';
        this.session.isAuthenticated = true;
        return { success: true, account: r.account || r.user };
    },

    async getAccountForDisplay(phone) {
        if (!this.useApi) {
            const a = this.demoAccounts[phone];
            return a ? { balance: a.balance, score: a.score, name: a.name } : null;
        }
        const api = window.ApiClient;
        if (!api) return null;
        const [bal, sc] = await Promise.all([api.getBalance(phone), api.getScore(phone)]);
        if (!bal || !bal.success) return null;
        const name = (bal.user && bal.user.name) || '';
        const score = (sc && sc.success && sc.score != null) ? sc.score : 0;
        return { balance: bal.balance, score, name };
    },

    async deposit(amount) {
        if (!this.session.isAuthenticated) return { success: false };
        if (!this.useApi) {
            const account = this.demoAccounts[this.session.phone];
            if (!account) return { success: false };
            account.balance += amount;
            account.savings += amount;
            account.transactions.unshift({
                type: 'deposit',
                amount,
                date: new Date().toISOString().split('T')[0]
            });
            account.score = Math.min(100, account.score + 2);
            return { success: true, newBalance: account.balance };
        }
        const r = await (window.ApiClient || {}).deposit(this.session.phone, amount);
        if (!r || !r.success) return { success: false };
        return { success: true, newBalance: r.newBalance };
    },

    async withdraw(amount) {
        if (!this.session.isAuthenticated) return { success: false };
        if (!this.useApi) {
            const account = this.demoAccounts[this.session.phone];
            if (!account) return { success: false };
            if (account.balance < amount) return { success: false, error: 'insufficient_funds' };
            account.balance -= amount;
            account.transactions.unshift({
                type: 'withdrawal',
                amount,
                date: new Date().toISOString().split('T')[0]
            });
            return { success: true, newBalance: account.balance };
        }
        const r = await (window.ApiClient || {}).withdraw(this.session.phone, amount);
        if (!r || !r.success) {
            return {
                success: false,
                error: r && r.isInsufficient ? 'insufficient_funds' : (r && r.error) || 'Erreur'
            };
        }
        return { success: true, newBalance: r.newBalance };
    },

    async getEligibility() {
        if (!this.session.isAuthenticated) return null;
        if (!this.useApi) {
            const account = this.demoAccounts[this.session.phone];
            if (!account) return null;
            const score = account.score;
            let maxAmount = 0;
            if (score >= 80) maxAmount = 100000;
            else if (score >= 60) maxAmount = 50000;
            else if (score >= 40) maxAmount = 25000;
            return { score, maxAmount, eligible: score >= 40 };
        }
        const r = await (window.ApiClient || {}).getLoanEligibility(this.session.phone);
        if (!r || !r.success) return null;
        return {
            score: r.score,
            maxAmount: r.maxAmount,
            eligible: !!r.eligible,
            durationDays: r.durationDays
        };
    },

    async requestLoan(amount) {
        if (!this.session.isAuthenticated) return { success: false };
        if (!this.useApi) {
            const account = this.demoAccounts[this.session.phone];
            if (!account) return { success: false };
            const eligibility = await this.getEligibility();
            if (!eligibility || !eligibility.eligible || amount > eligibility.maxAmount) {
                return { success: false, error: 'not_eligible' };
            }
            const totalRepayment = Math.round(amount * 1.10);
            account.loans.push({
                amount,
                remaining: totalRepayment,
                status: 'active',
                date: new Date().toISOString().split('T')[0]
            });
            account.balance += amount;
            return { success: true, amount, totalRepayment, newBalance: account.balance };
        }
        const r = await (window.ApiClient || {}).acceptLoan(this.session.phone, amount);
        if (!r || !r.success) {
            return { success: false, error: (r && r.error) || 'not_eligible' };
        }
        return {
            success: true,
            amount,
            totalRepayment: r.totalRepayment,
            newBalance: r.newBalance,
            durationDays: r.durationDays
        };
    },

    async repayLoan(amount) {
        if (!this.session.isAuthenticated) return { success: false };
        if (!this.useApi) {
            const account = this.demoAccounts[this.session.phone];
            if (!account) return { success: false };
            const activeLoan = account.loans.find(l => l.status === 'active');
            if (!activeLoan) return { success: false, error: 'no_active_loan' };
            if (account.balance < amount) return { success: false, error: 'insufficient_funds' };
            account.balance -= amount;
            activeLoan.remaining -= amount;
            if (activeLoan.remaining <= 0) {
                activeLoan.status = 'paid';
                activeLoan.remaining = 0;
                account.score = Math.min(100, account.score + 10);
                return { success: true, completed: true, remaining: 0, newBalance: account.balance };
            }
            account.score = Math.min(100, account.score + 3);
            return { success: true, completed: false, remaining: activeLoan.remaining, newBalance: account.balance };
        }
        const r = await (window.ApiClient || {}).repayLoan(this.session.phone, amount);
        if (!r || !r.success) {
            return {
                success: false,
                error: (r && r.noActiveLoan) ? 'no_active_loan' : ((r && r.isInsufficient) ? 'insufficient_funds' : (r && r.error) || 'Erreur')
            };
        }
        return {
            success: true,
            completed: !!r.completed,
            remaining: r.remaining,
            newBalance: r.newBalance
        };
    },

    getActiveLoans() {
        if (!this.session.isAuthenticated) return [];
        if (this.useApi) return [];
        const account = this.demoAccounts[this.session.phone];
        return account ? account.loans : [];
    }
};

if (typeof window !== 'undefined') {
    window.USSDState = USSDState;
}
>>>>>>> 463e3abd36884f251c14dea4f64c592739b8804e
