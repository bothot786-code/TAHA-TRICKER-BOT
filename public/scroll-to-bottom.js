(function() {
    'use strict';

    if (window._scrollToBottomInitialized) return;
    window._scrollToBottomInitialized = true;

    const targetEl = document.getElementById('terminalOutput');

    class ScrollToBottom {
        constructor() {
            this.scrollThreshold = 200;
            this.button = null;
            this.progressBar = null;
            this.ticking = false;
            this.init();
        }

        init() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        }

        setup() {
            this.createButton();
            if (!this.button) return;
            this.bindEvents();
            this.updateProgress();
        }

        createButton() {
            const existing = document.querySelector('.scroll-to-bottom');
            if (existing) {
                this.button = existing;
                this.progressBar = existing.querySelector('.progress-bar');
                return;
            }

            const container = document.createElement('div');
            container.className = 'scroll-to-bottom';
            container.setAttribute('role', 'button');
            container.setAttribute('aria-label', 'Scroll to bottom');
            container.setAttribute('tabindex', '0');

            const circumferenceValue = 2 * Math.PI * 22;

            container.innerHTML = `
                <svg class="scroll-progress-ring" viewBox="0 0 50 50">
                    <circle class="progress-bg" cx="25" cy="25" r="22"></circle>
                    <circle class="progress-bar" cx="25" cy="25" r="22"></circle>
                </svg>
                <button class="scroll-to-bottom-btn" aria-hidden="true">
                    <i class="fas fa-arrow-down"></i>
                </button>
            `;

            document.body.appendChild(container);

            this.button = container;
            this.progressBar = container.querySelector('.progress-bar');
            this.progressBar.style.strokeDasharray = circumferenceValue;
            this.progressBar.style.strokeDashoffset = circumferenceValue;
        }

        bindEvents() {
            if (targetEl) {
                targetEl.addEventListener('scroll', () => this.onScroll(), { passive: true });
            }

            if (this.button) {
                this.button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.scrollToBottom();
                });
                this.button.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.scrollToBottom();
                    }
                });
            }
        }

        onScroll() {
            if (!this.ticking) {
                window.requestAnimationFrame(() => {
                    this.updateVisibility();
                    this.updateProgress();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        }

        updateVisibility() {
            if (!this.button || !targetEl) return;
            const atBottom = targetEl.scrollTop + targetEl.clientHeight >= targetEl.scrollHeight - this.scrollThreshold;
            this.button.classList.toggle('visible', !atBottom);
        }

        updateProgress() {
            if (!this.progressBar || !targetEl) return;
            const scrollTop = targetEl.scrollTop;
            const scrollHeight = targetEl.scrollHeight - targetEl.clientHeight;
            if (scrollHeight <= 0) return;
            const scrollPercent = Math.min(scrollTop / scrollHeight, 1);
            const circumference = 2 * Math.PI * 22;
            this.progressBar.style.strokeDashoffset = circumference * (1 - scrollPercent);
        }

        scrollToBottom() {
            if (!targetEl) return;
            targetEl.scrollTo({ top: targetEl.scrollHeight, behavior: 'smooth' });
        }
    }

    window.ScrollToBottom = ScrollToBottom;
    new ScrollToBottom();
})();
