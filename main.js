document.addEventListener("DOMContentLoaded", () => {
    highlightActiveNav();
    initMobileNav();
    window.addEventListener("hashchange", highlightActiveNav);
    initMusicTabs();
    initReveals(document);
    document.body.classList.add("is-loaded");
});

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

        const selectTab = index => {
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
