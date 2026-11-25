/*! clients.js — animations de la page "Nos clients" (sans dépendance) */
(function () {
    'use strict';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- Apparition au défilement ---- */
    var els = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !reduce) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        Array.prototype.forEach.call(els, function (el) { io.observe(el); });
    } else {
        Array.prototype.forEach.call(els, function (el) { el.classList.add('in'); });
    }

    /* ---- Compteurs ---- */
    function countUp(el) {
        var end = parseInt(el.getAttribute('data-count'), 10) || 0;
        if (reduce) { el.textContent = end; return; }
        var dur = 1600, t0 = null;
        function step(t) {
            if (!t0) t0 = t;
            var p = Math.min((t - t0) / dur, 1);
            var e = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(end * e);
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    var nums = document.querySelectorAll('[data-count]');
    if ('IntersectionObserver' in window) {
        var co = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { countUp(en.target); co.unobserve(en.target); }
            });
        }, { threshold: 0.6 });
        Array.prototype.forEach.call(nums, function (n) { co.observe(n); });
    } else {
        Array.prototype.forEach.call(nums, countUp);
    }

    /* ---- Effet 3D + lumière sur les cartes (souris uniquement) ---- */
    var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (fine && !reduce) {
        Array.prototype.forEach.call(document.querySelectorAll('.client-card'), function (card) {
            card.addEventListener('mousemove', function (e) {
                var r = card.getBoundingClientRect();
                var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
                card.style.setProperty('--ry', ((x - 0.5) * 10).toFixed(2) + 'deg');
                card.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
                card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
                card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
            });
            card.addEventListener('mouseleave', function () {
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
            });
        });
    }
})();
