// assets/dashboard.js - Fixed Absolute Paths & Clean Links for GitHub Pages
// Developed by Arshdeep Singh - DairyCare Pro

async function loadComponent(elementId, fileName) {
    const placeholder = document.getElementById(elementId);
    if (!placeholder) return;

    // ਚੈੱਕ ਕਰੋ ਕਿ ਸਾਈਟ GitHub 'ਤੇ ਚੱਲ ਰਹੀ ਹੈ ਜਾਂ ਲੋਕਲ ਕੰਪਿਊਟਰ 'ਤੇ
    const isGitHub = window.location.hostname.includes("github.io");
    const repoName = window.location.pathname.split('/')[1];
    const basePath = isGitHub ? `/${repoName}/` : "/";

    try {
        const response = await fetch(`${basePath}components/${fileName}`);
        if (!response.ok) throw new Error(`Failed to load ${basePath}components/${fileName}`);
        const data = await response.text();
        placeholder.innerHTML = data;
        
        // ਜਦੋਂ ਹੈਡਰ ਲੋਡ ਹੋ ਜਾਵੇ, ਤਾਂ ਲਿੰਕਾਂ ਨੂੰ ਆਟੋਮੈਟਿਕ ਸਾਫ਼ ਕਰੋ
        if (elementId === "header-placeholder") {
            highlightActiveNav();
            cleanHeaderLinks(basePath); // 👈 ਇੱਥੇ ਲਿੰਕ ਸਾਫ਼ ਕਰਨ ਵਾਲਾ ਜੁਗਾੜ ਚੱਲੇਗਾ
        }
    } catch (error) {
        console.error("Error loading component:", error);
    }
}

// ਹੈਡਰ ਦੇ ਲਿੰਕਾਂ ਵਿੱਚੋਂ index.html ਅਤੇ ਵੱਡੇ C ਦੀ ਗਲਤੀ ਹਟਾਉਣ ਵਾਲਾ ਫੰਕਸ਼ਨ
function cleanHeaderLinks(basePath) {
    const logoLink = document.querySelector(".logo");
    const navLinks = document.querySelectorAll(".nav-link, .nav-menu a");

    // 1. ਮੇਨ ਲੋਗੋ/ਬਟਨ ਦੇ ਲਿੰਕ ਵਿੱਚੋਂ index.html ਹਟਾਓ ਅਤੇ ਪਾਥ ਸਹੀ ਕਰੋ
    if (logoLink) {
        logoLink.setAttribute("href", basePath); // ਇਹ ਸਿੱਧਾ '/Dairycare_Pro/' 'ਤੇ ਲੈ ਕੇ ਜਾਵੇਗਾ
    }

    // 2. ਬਾਕੀ ਸਾਰੇ ਲਿੰਕਾਂ ਨੂੰ ਵੀ ਚੈੱਕ ਕਰਕੇ ਸਹੀ ਕਰੋ
    navLinks.forEach(link => {
        let href = link.getAttribute("href");
        if (href) {
            // ਜੇਕਰ ਕਿਸੇ ਲਿੰਕ ਵਿੱਚ index.html ਲਿਖਿਆ ਹੈ, ਤਾਂ ਉਸਨੂੰ ਸਿੱਧਾ ਮੇਨ ਪਾਥ ਬਣਾ ਦਿਓ
            if (href.includes("index.html")) {
                link.setAttribute("href", basePath);
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    // ਹੈਡਰ ਅਤੇ ਫੁੱਟਰ ਲੋਡ ਕਰੋ
    await loadComponent("header-placeholder", "header.html");
    await loadComponent("footer-placeholder", "footer.html");
});

function highlightActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".nav-link, .nav-menu a");
    
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href && currentPath.includes(href)) {
            link.classList.add("active");
        }
    });
}
