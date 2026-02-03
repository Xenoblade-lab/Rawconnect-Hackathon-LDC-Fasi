// Lingala translations
const LINGALA = {
    welcome: "Boyei malamu na RAWCONNECT",
    mainMenu: {
        title: "Menu ya liboso",
        options: [
            "Fungola compte",
            "Tala mbongo",
            "Bomba mbongo",
            "Senga credit",
            "Lisungi / Monoko"
        ]
    },
    register: {
        title: "Kofungola compte",
        enterName: "Koma nkombo na yo mobimba:",
        enterPhone: "Koma numero na yo (ex: 081XXXXXXX):",
        enterPin: "Pona code PIN (ba chiffres 4):",
        confirmPin: "Confirmer code PIN na yo:",
        success: "Compte efungwami malamu!",
        phoneExists: "Numero oyo ezali deja.",
        invalidPhone: "Numero ya telephone ezali malamu te.",
        pinMismatch: "Ba code PIN ezali ndenge moko te.",
        invalidPin: "PIN esengeli kozala na ba chiffres 4."
    },
    balance: {
        title: "Kotala mbongo",
        enterPhone: "Koma numero ya telephone na yo:",
        enterPin: "Koma code PIN na yo:",
        yourBalance: "Mbongo na yo:",
        yourScore: "Score na yo:",
        accountNotFound: "Compte emonani te.",
        wrongPin: "Code PIN ezali malamu te."
    },
    savings: {
        title: "Kobomba mbongo",
        enterPhone: "Koma numero ya telephone na yo:",
        enterPin: "Koma code PIN na yo:",
        menu: {
            title: "Menu ya kobomba",
            options: [
                "Kotia mbongo",
                "Kozwa mbongo",
                "Historique"
            ]
        },
        enterAmount: "Koma montant (na FC):",
        depositSuccess: "Otie {amount} FC malamu!",
        withdrawSuccess: "Ozwi {amount} FC malamu!",
        insufficientFunds: "Mbongo ezali mingi te.",
        invalidAmount: "Montant ezali malamu te.",
        newBalance: "Mbongo ya sika: {balance} FC"
    },
    loan: {
        title: "Credit moke",
        enterPhone: "Koma numero ya telephone na yo:",
        enterPin: "Koma code PIN na yo:",
        menu: {
            title: "Menu ya Credit",
            options: [
                "Tala eligibilite",
                "Senga pret",
                "Zongisa mbongo",
                "Ba prets na ngai"
            ]
        },
        eligibility: {
            title: "Eligibilite na yo",
            score: "Score: {score}/100",
            maxAmount: "Montant max: {amount} FC",
            eligible: "Okoki kozwa credit!",
            notEligible: "Score ezali mingi te (minimum 40)."
        },
        request: {
            enterAmount: "Montant olingi (max {max} FC):",
            success: "Pret ya {amount} FC endimami!",
            repayment: "Kozongisa: {total} FC",
            duration: "Mikolo: {days}",
            denied: "Demande eboyami. Score ezali mingi te."
        },
        repay: {
            enterAmount: "Montant ya kozongisa (na FC):",
            success: "Ozongisi {amount} FC malamu!",
            remaining: "Etikali: {remaining} FC",
            noLoan: "Ozali na pret te.",
            completed: "Longonya! Pret ezongisami mobimba!"
        },
        history: {
            title: "Historique ya ba prets",
            noLoans: "Pret moko te.",
            active: "Ezali kokende",
            paid: "Ezongisami"
        }
    },
    help: {
        title: "Lisungi & Monoko",
        options: [
            "Ndenge nini esalaka",
            "Benga support",
            "Bobongola monoko"
        ],
        howItWorks: [
            "1. Fungola compte na numero na yo",
            "2. Bomba mbongo mbala na mbala",
            "3. Bakisa score na yo",
            "4. Zwa credit"
        ],
        support: "Benga 0800-RAWCONNECT to tinda SMS na 444",
        language: {
            title: "Pona monoko",
            options: ["Francais", "Lingala"],
            returnToMainMenu: "Tapa 0 mpo kozonga na menu ya liboso."
        }
    },
    common: {
        back: "0. Kozonga",
        returnToPrevious: "0. Kozonga na ngambo ya liboso",
        returnToMain: "1. Kozonga na menu ya liboso",
        quit: "2. Kobanda",
        cancel: "Koboya",
        confirm: "Kondima",
        loading: "Kozela",
        error: "Likambo moko esalemi.",
        fc: "FC",
        typeBelowThenSend: "Toma na esika ya nsé, sima Envoyer."
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.LINGALA = LINGALA;
}
