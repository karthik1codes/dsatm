(function () {
    const STORAGE_KEY = 'brightwords_accessibility_mode';
    const body = document.body;
    const toggle = document.getElementById('accessibilityToggle');
    const announcement = document.getElementById('accessibilityAnnouncement');
    const skipLink = document.getElementById('skipLink');
    const mainContent = document.getElementById('mainContent');
    const focusableSelector = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    function emitAnalytics(enabled) {
        window.dispatchEvent(new CustomEvent('accessibility_toggle', { detail: { enabled } }));
    }

    function announce(message) {
        if (announcement) {
            announcement.textContent = message;
        }
    }

    function applyMode(enabled, announceChange, emitEvent = true) {
        body.classList.toggle('accessibility-mode', enabled);
        document.documentElement.classList.toggle('accessibility-mode', enabled);
        if (toggle) {
            toggle.setAttribute('aria-pressed', String(enabled));
            toggle.setAttribute('aria-label', enabled ? 'Turn accessibility mode off' : 'Turn accessibility mode on');
            toggle.textContent = enabled ? 'Accessibility Mode On' : '♿ Accessibility Mode';
        }
        try {
            localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
        } catch (error) {
            console.warn('Unable to persist accessibility preference', error);
        }
        if (announceChange) {
            announce(`Accessibility mode ${enabled ? 'enabled' : 'disabled'}.`);
        }
        if (emitEvent) {
            emitAnalytics(enabled);
        }
    }

    function handleToggle() {
        const enabled = !body.classList.contains('accessibility-mode');
        applyMode(enabled, true);
    }

    function initToggle() {
        if (!toggle) return;
        toggle.addEventListener('click', handleToggle);
        toggle.addEventListener('keyup', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleToggle();
            }
        });

        let stored = false;
        try {
            stored = localStorage.getItem(STORAGE_KEY) === 'on';
        } catch (error) {
            stored = false;
        }
        applyMode(stored, false, false);
    }

    function getFocusable(element) {
        return Array.from(element.querySelectorAll(focusableSelector))
            .filter((node) => !node.hasAttribute('disabled') && node.tabIndex !== -1 && node.offsetParent !== null);
    }

    function setupFocusTrap(element) {
        if (!element) return;
        const activeClass = element.dataset.focusTrap || 'open';
        let lastFocus = null;

        const handleKeydown = (event) => {
            if (event.key !== 'Tab' || !element.classList.contains(activeClass)) return;
            const focusable = getFocusable(element);
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeydown);

        const observer = new MutationObserver(() => {
            const isOpen = element.classList.contains(activeClass);
            if (isOpen) {
                lastFocus = document.activeElement;
                const focusable = getFocusable(element);
                (focusable[0] || element).focus();
            } else if (lastFocus) {
                lastFocus.focus();
                lastFocus = null;
            }
        });

        observer.observe(element, { attributes: true, attributeFilter: ['class'] });
    }

    function initSkipLink() {
        if (!skipLink || !mainContent) return;
        skipLink.addEventListener('click', (event) => {
            event.preventDefault();
            mainContent.focus({ preventScroll: true });
            mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initToggle();
        initSkipLink();
        document.querySelectorAll('[data-focus-trap]').forEach(setupFocusTrap);
    });
})();

