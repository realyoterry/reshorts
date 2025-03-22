// made with Return YouTube Dislike API
// https://returnyoutubedislikeapi.com/swagger/index.html

processPage(true);
document.addEventListener('yt-navigate-finish', processPage);

function processPage(first = false) {
    // youtube videos
    if (location.pathname.toLowerCase().startsWith('/watch')) {
        const observer = new MutationObserver((_, obs) => {
            const button = document.querySelector('.yt-spec-touch-feedback-shape__fill');

            if (button) {
                obs.disconnect();

                fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${new URLSearchParams(location.search).get('v')}`)
                    .then(res => res.json())
                    .then((data) => {
                        const parent = document.querySelector('dislike-button-view-model .yt-spec-button-shape-next--segmented-end');
                        if (!parent || parent.querySelector('.dislike-count')) return;

                        const dislikes = data.dislikes;
                        const text = document.createElement('div');
                        let updatedDislikes = data.dislikes;

                        parent.className = 'yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m yt-spec-button-shape-next--icon-leading yt-spec-button-shape-next--segmented-end';
                        text.className = 'dislike-count yt-spec-button-shape-next__button-text-content';

                        if (!isDisliked()) {
                            text.textContent = formatNumber(dislikes);
                        } else {
                            updatedDislikes++;
                            text.textContent = formatNumber(updatedDislikes);
                        }

                        parent.appendChild(text);

                        document.querySelector('dislike-button-view-model').addEventListener('click', () => {
                            if (isDisliked()) {
                                updatedDislikes++;
                                text.textContent = formatNumber(updatedDislikes);
                                parent.appendChild(text);
                            } else {
                                updatedDislikes--;
                                text.textContent = formatNumber(updatedDislikes);
                                parent.appendChild(text);

                                const observer = new MutationObserver((_, obs) => {
                                    const newText = parent.querySelector('.dislike-count');

                                    if (!newText) {
                                        obs.disconnect();
                                        parent.appendChild(text);
                                    }
                                });

                                observer.observe(document.body, { childList: true, subtree: true });
                                setTimeout(observer.disconnect, 5000);
                            }
                        });
                    });
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => observer.disconnect(), 5000); // auto-disconnect
    }

    // youtube shorts
    if (location.pathname.toLowerCase().startsWith('/shorts')) {
        if (location.pathname.toLowerCase().startsWith('/shorts')) {
            const observer = new MutationObserver((_, obs) => {
                const ads = document.querySelectorAll('dislike-button-view-model > toggle-button-view-model > button-view-model > label > div');
                const buttons = document.querySelectorAll('#dislike-button > yt-button-shape > label > div > span');
    
                let text;
                let isAd = false;
    
                if (ads && ads[0]) {
                    for (const ad of ads) {
                        if (isInViewport(ad) === true) {
                            text = ad;
                            isAd = true;
                        }
                    }
                }
    
                for (const button of buttons) {
                    button.style.display = 'block';
    
                    if (isInViewport(button) === true) {
                        text = button;
                    } else {
                        button.style.display = 'none';
                    }
                }
    
                if (text) {
                    obs.disconnect();
                    text.style.display = 'none';
    
                    fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${location.pathname.split('/shorts/')[1]}`)
                        .then((res) => res.json())
                        .then((res) => {
                            const dislikes = formatNumber(res.dislikes);
                            const checks = document.querySelectorAll('.returnDislikesButton');
    
                            if (checks[0]) {
                                for (let check of checks) {
                                    if (isInViewport(check)) {
                                        return;
                                    }
                                }
                            }
    
                            const clone = text.cloneNode(true);
    
                            clone.textContent = dislikes;
                            clone.style.display = 'block';
                            clone.className = 'returnDislikesButton';
                            clone.style.fontSize = '14px';
                            clone.style.textAlign = 'center';
                            clone.style.fontWeight = 400;
    
                            if (first === true) {
                                document.querySelectorAll('#dislike-button')[0].appendChild(clone);
                            } else {
                                for (const button of isAd ? document.querySelectorAll('dislike-button-view-model') : document.querySelectorAll('#dislike-button')) {
                                    if (isInViewport(button)) {
                                        button.appendChild(clone);
                                    }
                                }
                            }
                        });
                }
            });
    
            observer.observe(document.body, { childList: true, subtree: true });
            // auto disconnect after 5 seconds of waiting
            setTimeout(() => observer.disconnect(), 5000);
        }
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

function isDisliked() {
    const parent = document.querySelector('dislike-button-view-model .yt-spec-button-shape-next--segmented-end');

    if (parent.attributes['aria-pressed'].value === 'true') {
        return true;
    } else {
        return false;
    }
}
