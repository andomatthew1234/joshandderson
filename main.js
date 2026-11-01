document.addEventListener("DOMContentLoaded", async () => {
    // Older cached pages may still have empty shared-element placeholders.
    await Promise.all([ensureSharedPart("header", ".site-header"), ensureSharedPart("footer", ".site-footer")]);
    highlightActiveNav();
    initMobileNav();
    window.addEventListener("hashchange", highlightActiveNav);
    initMusicTabs();
    initReveals(document);
    document.body.classList.add("is-loaded");
});

async function ensureSharedPart(name, selector) {
    const host = document.getElementById(`${name}-placeholder`);
    if (!host || host.querySelector(selector)) return;
    try {
        const response = await fetch(`${name}.html`, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Could not load ${name}`);
        host.innerHTML = await response.text();
    } catch (error) {
        console.error(error);
    }
}

// Follow page navigation and in-page music links without duplicate active items.
function highlightActiveNav() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    const links = Array.from(document.querySelectorAll(".site-nav a"));
    const exact = page + window.location.hash;
    const activeHref = links.some(link => link.getAttribute("href") === exact) ? exact : page;
    links.forEach(link => {
        const active = link.getAttribute("href") === activeHref;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", activeHref.includes('#') ? 'location' : 'page');
        else link.removeAttribute("aria-current");
    });
}

function initMobileNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");
    const label = toggle?.querySelector(".nav-toggle-label");
    if (!toggle || !nav) return;

    const setMenuState = (isOpen, returnFocus = false) => {
        toggle.setAttribute("aria-expanded", String(isOpen));
        nav.classList.toggle("is-open", isOpen);
        if (label) label.textContent = isOpen ? "Close" : "Menu";
        if (returnFocus) toggle.focus();
    };

    toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        setMenuState(!isOpen);
    });

    nav.addEventListener("click", event => {
        if (event.target.closest("a")) setMenuState(false);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
            setMenuState(false, true);
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900 && toggle.getAttribute("aria-expanded") === "true") {
            setMenuState(false);
        }
    });
}

function initMusicTabs() {
    document.querySelectorAll("[data-music-tabs]").forEach(group => {
        const tablist = group.querySelector('[role="tablist"]');
        const tabs = Array.from(group.querySelectorAll('[role="tab"]'));
        const panels = tabs.map(tab => document.getElementById(tab.getAttribute("aria-controls")));
        if (!tablist || !tabs.length || panels.some(panel => !panel)) return;

        const indicator = document.createElement("span");
        indicator.className = "music-tab-indicator";
        indicator.setAttribute("aria-hidden", "true");
        tablist.prepend(indicator);
        let indicatorAnimation;
        let previousIndex = null;
        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

        const selectTab = index => {
            const from = getComputedStyle(indicator).transform;
            if (indicatorAnimation) indicatorAnimation.cancel();
            const target = `translate3d(${index * 100}%, 0, 0)`;
            indicator.style.transform = target;
            if (previousIndex !== null && previousIndex !== index && !motionPreference.matches && indicator.animate) {
                const restShadow = '0 2px 6px rgba(25,62,84,.08)';
                const liftedShadow = '0 16px 26px rgba(25,62,84,.18)';
                indicatorAnimation = indicator.animate([
                    { transform: from, boxShadow: restShadow, offset: 0 },
                    { transform: `${from} translateZ(18px) scale(1.035, 1.09)`, boxShadow: liftedShadow, offset: .2 },
                    { transform: `${target} translateZ(18px) scale(1.035, 1.09)`, boxShadow: liftedShadow, offset: .72 },
                    { transform: target, boxShadow: restShadow, offset: 1 }
                ], { duration: 560, easing: 'cubic-bezier(.22,.7,.2,1)' });
            }
            previousIndex = index;
            tabs.forEach((tab, i) => {
                const selected = i === index;
                tab.setAttribute("aria-selected", String(selected));
                tab.tabIndex = selected ? 0 : -1;
                panels[i].hidden = !selected;
            });
        };

        tabs.forEach((tab, index) => {
            tab.addEventListener("click", () => selectTab(index));
            tab.addEventListener("keydown", event => {
                let next;
                if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
                else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = tabs.length - 1;
                else return;
                event.preventDefault();
                selectTab(next);
                tabs[next].focus();
            });
        });
        selectTab(0);
        tablist.hidden = false;
    });
}

// Reveal once, then release the observer. All content is visible without JS.
function initReveals(root) {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });
    root.querySelectorAll('.intro-section .container, .music-section .container, .page-header, .team-card, .contact-option, .footer-brand, .footer-links-block, .footer-feature, .footer-bottom').forEach(element => {
        element.classList.add('reveal-ready');
        observer.observe(element);
    });
}
