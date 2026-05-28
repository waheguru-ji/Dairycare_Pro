// assets/dashboard.js - Fully Optimized for GitHub Pages
// Developed by Arshdeep Singh - DairyCare Pro

async function loadComponent(elementId, fileName) {
    const placeholder = document.getElementById(elementId);
    if (!placeholder) return;

    // 1. ਡਾਇਨਾਮਿਕਲੀ ਰੈਪੋਜ਼ਿਟਰੀ ਦਾ ਸਹੀ ਨਾਮ (Case-Sensitive) URL ਵਿੱਚੋਂ ਚੁੱਕੋ
    const isGitHub = window.location.hostname.includes("github.io");
    const repoName = window.location.pathname.split('/')[1];
    const basePath = isGitHub ? `/${repoName}/` : "/";

    try {
        const response = await fetch(`${basePath}components/${fileName}`);
        if (!response.ok) throw new Error(`Failed to load ${basePath}components/${fileName}`);
        const data = await response.text();
        placeholder.innerHTML = data;
        
        // ਜਦੋਂ ਹੈਡਰ ਲੋਡ ਹੋ ਜਾਵੇ, ਤਾਂ ਲਿੰਕਾਂ ਨੂੰ ਸਹੀ ਕਰੋ
        if (elementId === "header-placeholder") {
            highlightActiveNav();
            fixAndCleanLinks(basePath); // 👈 ਸੁਧਾਰਿਆ ਹੋਇਆ ਸੁਰੱਖਿਅਤ ਫੰਕਸ਼ਨ
        }
    } catch (error) {
        console.error("Error loading component:", error);
    }
}

// ਹੈਡਰ ਦੇ ਲਿੰਕਾਂ ਨੂੰ ਬਿਨਾਂ ਬ੍ਰੋਕਨ ਕੀਤੇ ਸਾਫ਼ ਕਰਨ ਦਾ ਸਹੀ ਤਰੀਕਾ
function fixAndCleanLinks(basePath) {
    const isGitHub = window.location.hostname.includes("github.io");
    const logoLink = document.querySelector(".logo");
    const navLinks = document.querySelectorAll(".nav-link, .nav-menu a");

    // 1. ਮੇਨ ਲੋਗੋ ਬਟਨ ਨੂੰ ਸਿੱਧਾ ਹੋਮ ਪੇਜ ਦੀ ਰੂਟ ਡਾਇਰੈਕਟਰੀ ਨਾਲ ਲਿੰਕ ਕਰੋ (No index.html)
    if (logoLink) {
        logoLink.setAttribute("href", basePath);
    }

    // 2. ਬਾਕੀ ਸਾਰੇ ਨੇਵੀਗੇਸ਼ਨ ਲਿੰਕਾਂ ਨੂੰ GitHub Pages ਦੇ ਸਬ-ਫੋਲਡਰ ਮੁਤਾਬਕ ਸੈੱਟ ਕਰੋ
    if (isGitHub) {
        navLinks.forEach(link => {
            let href = link.getAttribute("href");
            
            // ਜੇਕਰ ਹੋਮ ਬਟਨ ਦਾ ਲਿੰਕ 'index.html' ਹੈ, ਤਾਂ ਉਸਨੂੰ ਵੀ ਮੇਨ ਰੂਟ ਬਣਾ ਦਿਓ
            if (href === "index.html" || href === "/index.html") {
                link.setAttribute("href", basePath);
                return;
            }

            // ਜੇਕਰ ਲਿੰਕ ਪਹਿਲਾਂ ਹੀ ਪੂਰਾ URL (http) ਨਹੀਂ ਹੈ ਅਤੇ ਰੈਪੋ ਨਾਮ ਨਾਲ ਸ਼ੁਰੂ ਨਹੀਂ ਹੁੰਦਾ
            if (href && !href.startsWith("http") && !href.startsWith("#") && !href.startsWith(basePath)) {
                // ਪਾਥ ਦੇ ਅੱਗੇ ਲੱਗੇ ਡੌਟਸ (../) ਸਾਫ਼ ਕਰੋ ਕਿਉਂਕਿ ਆਪਾਂ Absolute Path ਵਰਤ ਰਹੇ ਹਾਂ
                const cleanHref = href.replace(/^(\.\.\/|\.\/|\/)/, "");
                link.setAttribute("href", basePath + cleanHref);
            }
        });
    }
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
