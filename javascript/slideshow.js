(() => {
    const modal = document.querySelector('[data-slideshow-modal]');
    if (!modal) {
        return;
    }

    const imageEl = modal.querySelector('[data-slideshow-image]');
    const titleEl = modal.querySelector('[data-slideshow-title]');
    const counterEl = modal.querySelector('[data-slideshow-counter]');
    const closeBtn = modal.querySelector('[data-slideshow-close]');
    const prevBtn = modal.querySelector('[data-slideshow-prev]');
    const nextBtn = modal.querySelector('[data-slideshow-next]');

    let images = [];
    let index = 0;
    let currentTitle = '';
    let lastActive = null;

    const isOpen = () => modal.classList.contains('is-open');

    const setOpen = (open) => {
        modal.classList.toggle('is-open', open);
        modal.hidden = !open;
        modal.setAttribute('aria-hidden', open ? 'false' : 'true');
        document.body.classList.toggle('slideshow-open', open);
        if (!open && lastActive) {
            lastActive.focus();
            lastActive = null;
        }
    };

    const update = () => {
        if (!images.length) {
            return;
        }
        const total = images.length;
        const safeIndex = ((index % total) + total) % total;
        index = safeIndex;
        imageEl.src = images[safeIndex];
        const lang = document.documentElement.lang || 'es';
        const label = lang.startsWith('en') ? 'Preview' : 'Preview';
        imageEl.alt = `${label} ${safeIndex + 1} ${lang.startsWith('en') ? 'of' : 'de'} ${currentTitle}`;
        counterEl.textContent = `${safeIndex + 1} / ${total}`;
        prevBtn.disabled = total <= 1;
        nextBtn.disabled = total <= 1;
    };

    const openFromCard = (card) => {
        const list = card.getAttribute('data-previews') || '';
        images = list
            .split('|')
            .map((item) => item.trim())
            .filter(Boolean);
        if (!images.length) {
            return;
        }
        currentTitle = card.getAttribute('data-slideshow-title') || 'Dolar +';
        titleEl.textContent = currentTitle;
        index = 0;
        lastActive = document.activeElement;
        setOpen(true);
        update();
        closeBtn.focus();
    };

    const close = () => {
        setOpen(false);
    };

    prevBtn.addEventListener('click', () => {
        index -= 1;
        update();
    });

    nextBtn.addEventListener('click', () => {
        index += 1;
        update();
    });

    closeBtn.addEventListener('click', close);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            close();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (!isOpen()) {
            return;
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
        }
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            index += 1;
            update();
        }
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            index -= 1;
            update();
        }
    });

    document.querySelectorAll('[data-slideshow]').forEach((card) => {
        card.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                event.preventDefault();
            }
            openFromCard(card);
        });

        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openFromCard(card);
            }
        });
    });
})();
