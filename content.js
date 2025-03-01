// made with Return YouTube Dislike API
// https://returnyoutubedislikeapi.com/swagger/index.html

processPage();
document.addEventListener('yt-navigate-finish', processPage);

function processPage() {
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
        const observer = new MutationObserver((_, obs) => {
            let text;

            // make sure to hide preloaded 'Dislike' labels
            let elements = document.querySelectorAll('#dislike-button > yt-button-shape > label > div > span');

            for (let element of elements) {
                element.style.display = 'block';

                if (!isInViewport(element)) {
                    element.style.display = 'none';
                } else {
                    text = element;
                }
            }

            if (text) {
                text.style.display = 'none';
                obs.disconnect();

                fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${location.pathname.split('/shorts/')[1]}`)
                    .then(res => res.json())
                    .then((data) => {
                        const dislikes = formatNumber(data.dislikes);
                        const currentDislikes = document.getElementsByClassName('dislike-text-new-reshorts');

                        if (currentDislikes[0]) {
                            for (let dislike of currentDislikes) {
                                if (isInViewport(dislike)) {
                                    return;
                                }
                            }
                        }

                        // make a clone and hide original dislike text because youtube checks
                        // for changes in these components and reverts them if they detect any
                        const clone = text.cloneNode(true);

                        clone.textContent = dislikes;
                        clone.style.fontSize = '14px';
                        clone.style.textAlign = 'center';
                        clone.style.display = 'block';
                        clone.style.fontWeight = 400;
                        clone.style.opacity = 1;
                        clone.className = 'dislike-text-new-reshorts';

                        for (const button of document.querySelectorAll('#dislike-button')) {
                            if (isInViewport(button)) {
                                button.appendChild(clone);
                            }
                        }
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

function isDisliked() {
    const parent = document.querySelector('dislike-button-view-model .yt-spec-button-shape-next--segmented-end');

    if (parent.attributes['aria-pressed'].value === 'true') {
        return true;
    } else {
        return false;
    }
}
