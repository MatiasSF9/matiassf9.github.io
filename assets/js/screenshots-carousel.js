(() => {
    const init = () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        document.querySelectorAll('[data-screenshots-carousel]').forEach((container) => {
            if (container.dataset.carouselReady === 'true') {
                return;
            }
            container.dataset.carouselReady = 'true';

            const images = Array.from(container.querySelectorAll('img'));
            if (!images.length) {
                return;
            }

            const track = document.createElement('div');
            track.className = 'screenshots-track';

            container.innerHTML = '';
            images.forEach((img) => track.appendChild(img));
            images.forEach((img) => track.appendChild(img.cloneNode(true)));
            container.appendChild(track);

            const updateSizes = () => {
                const styles = window.getComputedStyle(container);
                const gapValue = styles.getPropertyValue('--carousel-gap') || '24px';
                const itemsValue = styles.getPropertyValue('--carousel-items') || '3';
                const maxValue = styles.getPropertyValue('--carousel-item-max') || '';
                const gap = parseFloat(gapValue) || 24;
                const itemsPerView = parseFloat(itemsValue) || 3;
                const containerWidth = container.clientWidth;
                if (!containerWidth) {
                    return;
                }

                let itemWidth = (containerWidth - gap * (itemsPerView - 1)) / itemsPerView;
                const maxWidth = parseFloat(maxValue);
                if (!Number.isNaN(maxWidth) && maxWidth > 0) {
                    itemWidth = Math.min(itemWidth, maxWidth);
                }
                const distance = images.length * itemWidth + gap * (images.length - 1);

                track.style.setProperty('--item-width', `${itemWidth}px`);
                track.style.setProperty('--scroll-distance', `${distance}px`);
            };

            updateSizes();
            window.addEventListener('resize', updateSizes);

            if (!prefersReducedMotion) {
                track.classList.add('is-animated');
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
