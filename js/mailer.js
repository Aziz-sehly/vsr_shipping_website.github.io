/*!
 * mailer.js — envoie les formulaires Contact et Devis par e-mail (via send-mail.php)
 * Aucune modification du formulaire n'est necessaire : ce script ajoute tout seul
 * les noms de champs, l'action, l'anti-spam, le message de succes/erreur.
 * Il suffit de l'ajouter en bas de contact.html et quote.html :
 *     <script src="js/mailer.js"></script>
 */
(function () {
    'use strict';

    var CSS = '.mailer-status{display:none;margin-top:1rem;padding:.9rem 1.1rem;border-radius:8px;font-size:.95rem;text-align:left}' +
        '.mailer-status.show{display:block;animation:mailerIn .5s ease both}' +
        '.mailer-status.is-success{background:#e8f7ee;color:#146c3a;border:1px solid #b7e4c7}' +
        '.mailer-status.is-error{background:#fdecec;color:#a12622;border:1px solid #f5c2c0}' +
        '@keyframes mailerIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}';

    var QUOTE_MAP = {
        'Votre nom complet': 'fullname', 'Votre email': 'email', 'Votre téléphone': 'phone',
        'Nom de votre entreprise': 'company', 'Ville de départ': 'departure', 'Ville de destination': 'destination'
    };
    var CONTACT_IDS = ['name', 'email', 'subject', 'message'];

    function hidden(form, name, value, honey) {
        var i = document.createElement('input');
        i.type = honey ? 'text' : 'hidden'; i.name = name; i.value = value || '';
        if (honey) { i.tabIndex = -1; i.autocomplete = 'off'; i.setAttribute('aria-hidden', 'true'); i.style.cssText = 'position:absolute;left:-9999px;opacity:0'; }
        form.appendChild(i);
    }

    function configure(form) {
        var isQuote = !!form.querySelector('select');
        form.setAttribute('action', 'send-mail.php');
        form.setAttribute('method', 'post');
        form.dataset.mailerReady = '1';
        hidden(form, 'form_type', isQuote ? 'quote' : 'contact');
        hidden(form, 'website', '', true);

        if (isQuote) {
            Array.prototype.forEach.call(form.querySelectorAll('input[type="text"],input[type="email"],input[type="tel"],textarea'), function (el) {
                var n = QUOTE_MAP[el.getAttribute('placeholder')];
                if (n) el.name = n; else if (el.tagName === 'TEXTAREA') el.name = 'details';
            });
            var sel = form.querySelectorAll('select');
            if (sel[0]) sel[0].name = 'service';
            if (sel[1]) sel[1].name = 'sector';
            var terms = form.querySelector('input[type="checkbox"]');
            if (terms) { terms.name = 'terms'; terms.value = 'oui'; }
        } else {
            CONTACT_IDS.forEach(function (id) {
                var el = form.querySelector('#' + id);
                if (el) el.name = id;
            });
            ['name', 'email', 'message'].forEach(function (id) {
                var el = form.querySelector('#' + id);
                if (el) el.required = true;
            });
        }
    }

    function init() {
        var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

        Array.prototype.forEach.call(document.querySelectorAll('form'), function (form) {
            if (form.dataset.mailerReady) return;
            configure(form);

            var btn = form.querySelector('button[type="submit"]');
            var btnHtml = btn ? btn.innerHTML : '';
            var status = document.createElement('div');
            status.className = 'mailer-status';
            status.setAttribute('role', 'status');
            status.setAttribute('aria-live', 'polite');
            form.appendChild(status);

            function show(ok, msg) {
                status.className = 'mailer-status show ' + (ok ? 'is-success' : 'is-error');
                status.innerHTML = '<i class="fa ' + (ok ? 'fa-check-circle' : 'fa-exclamation-circle') + ' me-2"></i>';
                status.appendChild(document.createTextNode(msg));
                status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            form.addEventListener('submit', function (e) {
                e.preventDefault();
                if (!form.checkValidity()) { form.reportValidity(); return; }
                status.className = 'mailer-status';
                if (btn) {
                    btn.disabled = true;
                    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Envoi en cours...';
                }
                fetch('send-mail.php', { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
                    .then(function (r) {
                        return r.json().catch(function () {
                            return { ok: false, message: "send-mail.php n'a pas pu s'exécuter (code HTTP " + r.status + "). Le site doit être hébergé sur un serveur avec PHP et send-mail.php doit être à côté de la page. Appelez-nous au +216 71 444 707." };
                        });
                    })
                    .then(function (d) {
                        show(!!d.ok, d.message || (d.ok ? 'Message envoyé.' : "Erreur lors de l'envoi."));
                        if (d.ok) form.reset();
                    })
                    .catch(function () {
                        show(false, "Impossible d'envoyer le message. Vérifiez votre connexion ou appelez-nous au +216 71 444 707.");
                    })
                    .then(function () { if (btn) { btn.disabled = false; btn.innerHTML = btnHtml; } });
            });
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
