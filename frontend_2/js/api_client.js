// API Client for RAWCONNECT Backend
const API_BASE_URL = 'http://localhost:5000/api';

const ApiClient = {
    // User endpoints
    async register(name, phone, pin) {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, pin })
            });
            return await response.json();
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    async getUser(phone) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/${phone}`);
            return await response.json();
        } catch (error) {
            console.error('Get user error:', error);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    // Account endpoints
    async getBalance(phone, pin) {
        try {
            const response = await fetch(`${API_BASE_URL}/balance/${phone}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin })
            });
            return await response.json();
        } catch (error) {
            console.error('Balance error:', error);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    async deposit(phone, pin, amount) {
        try {
            const response = await fetch(`${API_BASE_URL}/deposit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, pin, amount })
            });
            return await response.json();
        } catch (error) {
            console.error('Deposit error:', error);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    async withdraw(phone, pin, amount) {
        try {
            const response = await fetch(`${API_BASE_URL}/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, pin, amount })
            });
            return await response.json();
        } catch (error) {
            console.error('Withdraw error:', error);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    // Score endpoints
    async getScore(phone, pin) {
        try {
            const response = await fetch(`${API_BASE_URL}/score/${phone}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin })
            });
            return await response.json();
        } catch (error) {
            console.error('Score error:', error);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    // Loan endpoints
    async requestLoan(phone, pin, amount) {
        try {
            const response = await fetch(`${API_BASE_URL}/loan/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, pin, amount })
            });
            return await response.json();
        } catch (error) {
            console.error('Loan request error:', error);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    async repayLoan(phone, pin, amount) {
        try {
            const response = await fetch(`${API_BASE_URL}/loan/repay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, pin, amount })
            });
            return await response.json();
        } catch (error) {
            console.error('Loan repay error:', error);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    },

    async getLoans(phone, pin) {
        try {
            const response = await fetch(`${API_BASE_URL}/loans/${phone}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin })
            });
            return await response.json();
        } catch (error) {
            console.error('Get loans error:', error);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ApiClient = ApiClient;
}
