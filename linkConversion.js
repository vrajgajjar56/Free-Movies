// linkConversion.js
// Global to store the generated link or state
window._generatedDirectLink = null;
window._directLinkPromise = null;

function startTeraboxConversion(link) {
    if (!link || (!link.includes('terabox') && !link.includes('1024tera') && !link.includes('terashare'))) {
        return; // Only process Terabox links
    }

    // Extract shorturl
    let shorturl = '';
    try {
        const urlObj = new URL(link);
        shorturl = urlObj.searchParams.get('surl');
        if (!shorturl) {
            const parts = urlObj.pathname.split('/');
            shorturl = parts[parts.length - 1];
        }
    } catch(err) {
        shorturl = link.split('/').pop().split('?')[0];
    }
    
    if (shorturl && !shorturl.startsWith('1') && link.includes('surl=')) {
        shorturl = '1' + shorturl;
    }

    const apis = [
        `https://terabox-dl.qtcloud.workers.dev/api/get-info?shorturl=${shorturl}`,
        `https://terabox.hnn.workers.dev/api/get-info?shorturl=${shorturl}`
    ];

    async function fetchDirectLink() {
        for (const api of apis) {
            try {
                // Add an AbortController to implement the 30-second timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000);
                
                const res = await fetch(api, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = await res.json();
                    if (data && data.list && data.list.length > 0 && data.list[0].dlink) {
                        return data.list[0].dlink;
                    }
                }
            } catch (err) {
                console.warn("API failed or timed out:", api);
            }
        }
        return null;
    }

    // Start fetching and store the promise
    window._directLinkPromise = fetchDirectLink().then(directLink => {
        window._generatedDirectLink = directLink || "FAILED";
        return window._generatedDirectLink;
    }).catch(err => {
        console.error('Terabox conversion completely failed', err);
        window._generatedDirectLink = "FAILED";
        return "FAILED";
    });
}

function handleTeraboxDownload(link, finalBtn, e) {
    if (link.includes('terabox') || link.includes('1024tera') || link.includes('terashare')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const originalText = finalBtn.innerHTML;
        finalBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating Link...`;
        finalBtn.disabled = true;

        const completeDownload = (directLink) => {
            if (directLink && directLink !== "FAILED") {
                window.open(directLink, '_self');
            } else {
                alert('Sorry, the direct link is not avilable right now, Please download via TeraBox.');
                window.open(link, '_blank');
            }

            // Clean up UI and state
            const currentModal = document.getElementById('subscribeModal');
            if (currentModal) {
                currentModal.classList.add('modal-hiding', 'opacity-0');
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
                setTimeout(() => {
                    currentModal.classList.add('hidden');
                    currentModal.classList.remove('flex', 'modal-active', 'modal-hiding');
                }, 400);
            }
            
            finalBtn.innerHTML = originalText;
            finalBtn.disabled = false;
            window._selectedDownloadLink = null;
            window._generatedDirectLink = null;
            window._directLinkPromise = null;
        };

        // If it's already generated (or failed) before user clicks Download
        if (window._generatedDirectLink) {
            completeDownload(window._generatedDirectLink);
        } else if (window._directLinkPromise) {
            // Wait for it to finish because clicking was faster than API response
            window._directLinkPromise.then(completeDownload);
        } else {
            // Highly unlikely, but fallback if startTeraboxConversion was never called
            startTeraboxConversion(link);
            window._directLinkPromise.then(completeDownload);
        }
        
        return true; // Handled
    }
    return false; // Not handled
}
