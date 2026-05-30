// router.js
document.addEventListener('DOMContentLoaded', () => {
    // Page entrance animation
    document.body.classList.add('loaded');
});

// Single Page Application Router
const pageLevels = {
    '': 0,
    'index.html': 0,
    'all-movies.html': 1,
    'categories.html': 2,
    'mcu.html': 3,
    'dcu.html': 3,
    'movie.html': 4
};

async function navigateTo(url, isBack = false) {
    const targetPath = new URL(url, window.location.href).pathname.split('/').pop() || 'index.html';
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    const currentLevel = pageLevels[currentPath] !== undefined ? pageLevels[currentPath] : 0;
    const targetLevel = pageLevels[targetPath] !== undefined ? pageLevels[targetPath] : 0;

    const navigateBackwards = isBack || targetLevel < currentLevel;

    // Track state to identify back/forward popstate
    sessionStorage.setItem('lastPageLevel', targetLevel);

    document.body.classList.remove('loaded');
    if (navigateBackwards) {
        sessionStorage.setItem('navigationDirection', 'back');
        document.documentElement.classList.add('nav-back');
        document.body.classList.add('exiting-back');
    } else {
        document.documentElement.classList.remove('nav-back');
        document.body.classList.add('exiting');
    }

    try {
        // Fetch new page in the background while exiting animation plays
        const response = await fetch(url);
        const html = await response.text();

        // Wait for exit animation to finish (approx 400ms)
        await new Promise(resolve => setTimeout(resolve, 450));

        // Parse new HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Update document title
        document.title = doc.title;

        // Swap new body content
        document.body.innerHTML = doc.body.innerHTML;
        // Copy body classes
        document.body.className = doc.body.className;

        // Push state if not from back/forward navigation
        if (!isBack && window.location.href !== url) {
            window.history.pushState({ path: url }, '', url);
        }

        // Re-execute scripts in the new body
        const scripts = document.body.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));

            // Re-evaluate inline scripts to reattach event listeners
            // Exclude external scripts like tailwindcss or movies.js to prevent double execution/fetching
            if (!oldScript.hasAttribute('src') || oldScript.getAttribute('src') === 'router.js') {
                newScript.textContent = oldScript.textContent;
                oldScript.parentNode.replaceChild(newScript, oldScript);
            }
        });

        // Trigger entrance animation
        if (navigateBackwards) {
            document.documentElement.classList.add('nav-back');
        } else {
            document.documentElement.classList.remove('nav-back');
        }

        document.body.classList.remove('exiting', 'exiting-back');

        // Quick reflow
        void document.body.offsetWidth;

        requestAnimationFrame(() => {
            document.body.classList.add('loaded');
        });

    } catch (e) {
        console.error("Navigation failed", e);
        // Fallback to normal navigation if fetch fails
        window.location.href = url;
    }
}

document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (link &&
        link.hostname === window.location.hostname &&
        link.target !== '_blank' &&
        !link.getAttribute('href').startsWith('#') &&
        !e.ctrlKey && !e.metaKey && !e.shiftKey) {

        e.preventDefault();
        const targetUrl = link.href;

        const isBackText = link.textContent.trim().toLowerCase() === 'back';
        navigateTo(targetUrl, isBackText);
    }
});

// Handle Back/Forward buttons and bfcache
window.addEventListener('popstate', (e) => {
    const newPath = window.location.pathname.split('/').pop() || 'index.html';
    const newLevel = pageLevels[newPath] !== undefined ? pageLevels[newPath] : 0;
    const lastLevel = parseInt(sessionStorage.getItem('lastPageLevel') || '0', 10);
    const isBackwards = newLevel < lastLevel;

    navigateTo(window.location.href, isBackwards);
});

window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
        document.documentElement.classList.add('nav-back');
        document.body.classList.remove('exiting', 'exiting-back', 'loaded');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.add('loaded');
            });
        });
    }
});
