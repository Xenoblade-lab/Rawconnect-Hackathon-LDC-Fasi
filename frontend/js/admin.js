/**
 * RAWCONNECT — Dashboard Administrateur
 * Gestion de la navigation et des sections
 */

(function () {
    "use strict";

    const SECTIONS = [
        "users",
        "ussd",
        "services",
        "stats",
        "logs",
        "security",
        "integrations",
    ];

    function init() {
        const navItems = document.querySelectorAll(".nav-item[data-section]");
        const sections = document.querySelectorAll(".admin-section");

        // Navigation par clic
        navItems.forEach((item) => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                const sectionId = item.getAttribute("data-section");
                if (sectionId) {
                    showSection(sectionId);
                    updateHash(sectionId);
                }
            });
        });

        // Restaurer la section depuis l'URL (#users, #ussd, etc.)
        const hash = window.location.hash.slice(1);
        if (hash && SECTIONS.includes(hash)) {
            showSection(hash);
        } else {
            showSection("users");
        }

        // Réagir aux changements de hash (navigation navigateur)
        window.addEventListener("hashchange", () => {
            const h = window.location.hash.slice(1);
            if (h && SECTIONS.includes(h)) {
                showSection(h);
            }
        });
    }

    function showSection(sectionId) {
        const navItems = document.querySelectorAll(".nav-item[data-section]");
        const sections = document.querySelectorAll(".admin-section");

        navItems.forEach((item) => {
            if (item.getAttribute("data-section") === sectionId) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });

        sections.forEach((section) => {
            const id = section.id.replace("section-", "");
            if (id === sectionId) {
                section.classList.add("active");
            } else {
                section.classList.remove("active");
            }
        });
    }

    function updateHash(sectionId) {
        if (window.history.replaceState) {
            window.history.replaceState(null, null, "#" + sectionId);
        } else {
            window.location.hash = sectionId;
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
