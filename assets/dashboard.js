// dashboard.js - load header and footer, language switcher
// Developed by Arshdeep Singh - 100% Fixed Absolute Version

// Function to load HTML components
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Failed to load ' + filePath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(error);
        // Fallback content if component missing
        if (elementId === 'header-placeholder') {
            document.getElementById(elementId).innerHTML = `
                <header style="background:#2d6a4f; color:white; padding:1rem;">
                    <div style="display:flex; justify-content:space-between;">
                        <span>🐄 DairyCare Pro</span>
                    </div>
                </header>
            `;
        } else if (elementId === 'footer-placeholder') {
            document.getElementById(elementId).innerHTML = `
                <footer style="background:#1e293b; color:#cbd5e1; text-align:center; padding:1rem;">
                    Developed by Arshdeep Singh © 2026
                </footer>
            `;
        }
    }
}

// Initialize language switcher
function initLanguageSwitcher() {
    const select = document.getElementById('langSelect') || document.getElementById('langSelectFallback');
    if (!select) return;

    // Load saved language from localStorage
    const savedLang = localStorage.getItem('dairycare_lang') || 'pa';
    select.value = savedLang;

    // Apply language (change HTML lang attribute)
    document.documentElement.lang = savedLang;

    select.addEventListener('change', function (e) {
        const lang = e.target.value;
        localStorage.setItem('dairycare_lang', lang);
        document.documentElement.lang = lang;
    });
}

// ✅ ਇਹ ਮਿਸਿੰਗ ਫੰਕਸ਼ਨ ਆਪਾਂ ਵਾਪਸ ਜੋੜ ਦਿੱਤਾ ਹੈ ਜੋ ਐਬਸੋਲਿਊਟ ਪਾਥ ਨਾਲ ਲੋਡ ਕਰੇਗਾ
document.addEventListener('DOMContentLoaded', async () => {
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    if (isGitHubPages) {
        // GitHub Pages ਲਈ ਸਬ-ਫੋਲਡਰ ਰੂਟ ਪਾਥ
        await loadComponent('header-placeholder', '/DairyCare_Pro/components/header.html');
        await loadComponent('footer-placeholder', '/DairyCare_Pro/components/footer.html');
    } else {
        // Localhost (127.0.0.1:8000) ਲਈ ਬਿਲਕੁਲ ਸਿੱਧਾ ਐਬਸੋਲਿਊਟ ਪਾਥ
        // ਚਾਹੇ ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਫੋਲਡਰ ਵਿੱਚ ਹੋਵੋ, ਇਹ ਸਿੱਧਾ ਮੇਨ ਰੂਟ ਤੋਂ ਅਸਲੀ ਫਾਈਲ ਚੁੱਕੇਗਾ
        await loadComponent('header-placeholder', '/components/header.html');
        await loadComponent('footer-placeholder', '/components/footer.html');
    }

    initLanguageSwitcher();
});

// ਗਲੋਬਲ ਨੈਵੀਗੇਸ਼ਨ ਫੰਕਸ਼ਨ - 404 ਐਰਰ ਅਤੇ ReferenceError ਨੂੰ ਖਤਮ ਕਰਨ ਲਈ
window.getAppBasePath = function () {
    const isGH = window.location.hostname.includes('github.io');
    return isGH ? '/DairyCare_Pro' : '';
};

window.navigateLegal = function (page) {
    window.location.href = window.location.origin + window.getAppBasePath() + '/legal/' + page;
};

window.navigateRoot = function (page) {
    window.location.href = window.location.origin + window.getAppBasePath() + '/' + page;
};
