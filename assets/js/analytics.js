(() => {
    document.addEventListener('click', (event) => {
        const el = event.target.closest('[data-ga-event]');
        if (!el) return;
        if (typeof window.gtag !== 'function') return;

        const eventName = el.getAttribute('data-ga-event');
        const label = el.getAttribute('data-ga-label');
        const params = { event_category: 'engagement' };
        if (label) params.event_label = label;

        window.gtag('event', eventName, params);
    });
})();
