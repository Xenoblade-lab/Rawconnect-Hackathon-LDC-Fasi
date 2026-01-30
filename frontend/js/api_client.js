// API Client for RAWCONNECT Backend
// Base URL : backend Flask (ex. http://localhost:5000)

const RAWCONNECT_API_BASE = (typeof window !== 'undefined' && window.RAWCONNECT_API_BASE)
    ? window.RAWCONNECT_API_BASE
    : 'http://localhost:5000/api';

function getUrl(path) {
    const base = String(RAWCONNECT_API_BASE).replace(/\/$/, '');
    const p = (path.startsWith('/') ? path : '/' + path).replace(/^\/api/, '');
    return base + (p.startsWith('/') ? p : '/' + p);
}

async function request(method, path, body) {
    const url = getUrl(path);
    const opt = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body != null && (method === 'POST' || method === 'PUT')) {
        opt.body = JSON.stringify(body);
    }
    const res = await fetch(url, opt);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = (data.error && data.error.message) || data.error || 'Erreur serveur';
        return { success: false, error: msg, _status: res.status };
    }
    return data;
}

const ApiClient = {
    async register(phone, name, activityType, pin) {
        try {
            const data = await request('POST', '/register', {
                phone,
                name,
                activity_type: activityType || 'autre',
                pin: pin || '0000'
            });
            if (data.success && data.data) {
                return { success: true, user_id: data.data.user_id, initial_score: data.data.initial_score };
            }
            return { success: false, error: (data.error && data.error.message) || data.error || 'Erreur' };
        } catch (e) {
            console.error('Register error:', e);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    async getUser(phone) {
        try {
            const data = await request('GET', '/user/' + encodeURIComponent(phone));
            if (data.success && data.data && data.data.user) {
                return { success: true, user: data.data.user };
            }
            return { success: false, error: (data.error && data.error.message) || data.error || 'Non trouvé' };
        } catch (e) {
            console.error('Get user error:', e);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    async authenticate(phone, pin) {
        try {
            const data = await request('POST', '/authenticate', { phone, pin });
            if (data.success && data.data) {
                return {
                    success: true,
                    user: data.data.user,
                    account: data.data.account
                };
            }
            return {
                success: false,
                error: (data.error && data.error.code) ? data.error.code : 'auth_failed',
                message: (data.error && data.error.message) || data.error || 'Erreur'
            };
        } catch (e) {
            console.error('Authenticate error:', e);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    async getBalance(phone) {
        try {
            const data = await request('GET', '/balance/' + encodeURIComponent(phone));
            if (data.success && data.data) {
                return {
                    success: true,
                    balance: data.data.balance,
                    user: data.data.user,
                    currency: data.data.currency || 'FC'
                };
            }
            return { success: false, error: (data.error && data.error.message) || data.error || 'Erreur' };
        } catch (e) {
            console.error('Balance error:', e);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    async getScore(phone) {
        try {
            const data = await request('GET', '/score/' + encodeURIComponent(phone));
            if (data.success && data.data) {
                return { success: true, score: data.data.score, breakdown: data.data.breakdown };
            }
            return { success: false, error: (data.error && data.error.message) || data.error || 'Erreur' };
        } catch (e) {
            console.error('Score error:', e);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    async deposit(phone, amount) {
        try {
            const data = await request('POST', '/deposit', { phone, amount });
            if (data.success && data.data) {
                return {
                    success: true,
                    newBalance: data.data.new_balance,
                    newScore: data.data.new_score,
                    transaction: data.data.transaction
                };
            }
            return { success: false, error: (data.error && data.error.message) || data.error || 'Erreur' };
        } catch (e) {
            console.error('Deposit error:', e);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    async withdraw(phone, amount) {
        try {
            const data = await request('POST', '/withdraw', { phone, amount });
            if (data.success && data.data) {
                return {
                    success: true,
                    newBalance: data.data.new_balance,
                    transaction: data.data.transaction
                };
            }
            const code = (data.error && data.error.code) ? data.error.code : null;
            return {
                success: false,
                error: code || (data.error && data.error.message) || data.error || 'Erreur',
                isInsufficient: code === 'insufficient_funds'
            };
        } catch (e) {
            console.error('Withdraw error:', e);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    async getLoanEligibility(phone) {
        try {
            const data = await request('POST', '/loan/request', { phone });
            if (data.success && data.data) {
                return {
                    success: true,
                    eligible: data.data.eligible,
                    score: data.data.score,
                    maxAmount: data.data.max_amount,
                    interestRate: data.data.interest_rate,
                    durationDays: data.data.duration_days,
                    breakdown: data.data.breakdown
                };
            }
            return { success: false, error: (data.error && data.error.message) || data.error || 'Erreur' };
        } catch (e) {
            console.error('Loan eligibility error:', e);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    async acceptLoan(phone, amount) {
        try {
            const data = await request('POST', '/loan/accept', { phone, amount });
            if (data.success && data.data) {
            return {
                success: true,
                loan: data.data.loan,
                newBalance: data.data.new_balance,
                totalRepayment: data.data.total_repayment,
                dueDate: data.data.due_date,
                durationDays: data.data.duration_days
            };
            }
            const code = (data.error && data.error.code) ? data.error.code : null;
            return {
                success: false,
                error: (data.error && data.error.message) || data.error || 'Erreur',
                code
            };
        } catch (e) {
            console.error('Accept loan error:', e);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    async repayLoan(phone, amount) {
        try {
            const data = await request('POST', '/loan/repay', { phone, amount });
            if (data.success && data.data) {
                return {
                    success: true,
                    remaining: data.data.remaining,
                    completed: data.data.completed,
                    newBalance: data.data.new_balance,
                    newScore: data.data.new_score
                };
            }
            const code = (data.error && data.error.code) ? data.error.code : null;
            return {
                success: false,
                error: (data.error && data.error.message) || data.error || 'Erreur',
                code,
                isInsufficient: code === 'insufficient_funds',
                noActiveLoan: code === 'no_active_loan'
            };
        } catch (e) {
            console.error('Repay loan error:', e);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    }
};

if (typeof window !== 'undefined') {
    window.ApiClient = ApiClient;
    window.RAWCONNECT_API_BASE = RAWCONNECT_API_BASE;
}
