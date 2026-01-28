// French translations
const FR = {
    welcome: "Bienvenue sur RAWCONNECT",
    mainMenu: {
        title: "Menu Principal",
        options: [
            "Creer un compte",
            "Consulter solde",
            "Epargner",
            "Demander credit",
            "Aide / Langue"
        ]
    },
    register: {
        title: "Creation de compte",
        enterName: "Entrez votre nom complet:",
        enterPhone: "Entrez votre numero (ex: 081XXXXXXX):",
        enterPin: "Choisissez un code PIN (4 chiffres):",
        confirmPin: "Confirmez votre code PIN:",
        success: "Compte cree avec succes!",
        phoneExists: "Ce numero est deja enregistre.",
        invalidPhone: "Numero de telephone invalide.",
        pinMismatch: "Les codes PIN ne correspondent pas.",
        invalidPin: "Le PIN doit contenir 4 chiffres."
    },
    balance: {
        title: "Consultation de solde",
        enterPhone: "Entrez votre numero de telephone:",
        enterPin: "Entrez votre code PIN:",
        yourBalance: "Votre solde:",
        yourScore: "Votre score:",
        accountNotFound: "Compte non trouve.",
        wrongPin: "Code PIN incorrect."
    },
    savings: {
        title: "Epargne",
        enterPhone: "Entrez votre numero de telephone:",
        enterPin: "Entrez votre code PIN:",
        menu: {
            title: "Menu Epargne",
            options: [
                "Deposer",
                "Retirer",
                "Historique"
            ]
        },
        enterAmount: "Entrez le montant (en FC):",
        depositSuccess: "Depot de {amount} FC effectue avec succes!",
        withdrawSuccess: "Retrait de {amount} FC effectue avec succes!",
        insufficientFunds: "Solde insuffisant.",
        invalidAmount: "Montant invalide.",
        newBalance: "Nouveau solde: {balance} FC"
    },
    loan: {
        title: "Microcredit",
        enterPhone: "Entrez votre numero de telephone:",
        enterPin: "Entrez votre code PIN:",
        menu: {
            title: "Menu Credit",
            options: [
                "Voir eligibilite",
                "Demander un pret",
                "Rembourser",
                "Mes prets"
            ]
        },
        eligibility: {
            title: "Votre eligibilite",
            score: "Score: {score}/100",
            maxAmount: "Montant max: {amount} FC",
            eligible: "Vous etes eligible au credit!",
            notEligible: "Score insuffisant (minimum 40 requis)."
        },
        request: {
            enterAmount: "Montant souhaite (max {max} FC):",
            success: "Pret de {amount} FC approuve!",
            repayment: "A rembourser: {total} FC",
            duration: "Duree: {days} jours",
            denied: "Demande refusee. Score insuffisant."
        },
        repay: {
            enterAmount: "Montant a rembourser (en FC):",
            success: "Remboursement de {amount} FC effectue!",
            remaining: "Reste a payer: {remaining} FC",
            noLoan: "Aucun pret en cours.",
            completed: "Felicitations! Pret rembourse integralement!"
        },
        history: {
            title: "Historique des prets",
            noLoans: "Aucun pret enregistre.",
            active: "En cours",
            paid: "Rembourse"
        }
    },
    help: {
        title: "Aide & Langue",
        options: [
            "Comment ca marche",
            "Contacter support",
            "Changer langue"
        ],
        howItWorks: [
            "1. Creez un compte avec votre numero",
            "2. Epargnez regulierement",
            "3. Ameliorez votre score",
            "4. Accedez au credit"
        ],
        support: "Appelez le 0800-RAWCONNECT ou envoyez un SMS au 444",
        language: {
            title: "Choisir la langue",
            options: ["Francais", "Lingala"]
        }
    },
    common: {
        back: "0. Retour",
        cancel: "Annuler",
        confirm: "Confirmer",
        loading: "Chargement",
        error: "Une erreur est survenue.",
        fc: "FC"
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.FR = FR;
}
