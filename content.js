processPage();
document.addEventListener('yt-navigate-finish', processPage);

function processPage() {
    // youtube shorts
    if (location.pathname.toLowerCase().startsWith('/shorts')) {
        const observer = new MutationObserver((_, obs) => {
            const text = getButtons();

            if (text) {
                text.style.display = 'none';
                obs.disconnect();

                fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${location.pathname.split('/shorts/')[1]}`)
                    .then(res => res.json())
                    .then((data) => {
                        const dislikes = formatNumber(data.dislikes);
                        if (text.textContent === dislikes) return;

                        // show original before cloning
                        text.style.display = 'block';

                        // make a clone and hide original dislike text because youtube checks
                        // for changes in these components and reverts them if they detect any
                        const clone = text.cloneNode(true);

                        clone.textContent = dislikes;
                        clone.style.fontSize = '14px';
                        clone.style.textAlign = 'center';
                        clone.style.display = 'block';
                        clone.style.fontWeight = 400;
                        clone.className = 'dislike-text-new-reshorts';

                        for (const button of document.querySelectorAll('#dislike-button')) {
                            if (isInViewport(button)) {
                                button.appendChild(clone);
                            }
                        }

                        text.style.display = 'none';
                    });
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => observer.disconnect(), 5000); // auto-disconnect
    }
}

function formatNumber(num) {
    return new Intl.NumberFormat('en', { notation: 'compact' }).format(num);
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    const height = innerHeight || document.documentElement.clientHeight;
    const width = innerWidth || document.documentElement.clientWidth;

    return (
        // When short (channel) is ignored, the element (like/dislike AND short itself) is
        // hidden with a 0 DOMRect. In this case, consider it outside of Viewport
        !(rect.top == 0 && rect.left == 0 && rect.bottom == 0 && rect.right == 0) &&
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= height &&
        rect.right <= width
    );
}

function getButtons() {
    let elements = document.querySelectorAll('#dislike-button > yt-button-shape > label > div > span');

    for (let element of elements) {
        if (isInViewport(element)) {
            return element;
        }
    }
}
