// ============================================================
//  footer.js — Black & Gold Footer Module | Clerks Website
//  Usage: <script src="/js/footer.js"></script>
//  Add anywhere in your <body>. The footer injects itself.
//  To add a link: add an entry to the relevant `links` array
//  To add a section: add a new object to the `columns` array
// ============================================================

const footerModule = (() => {

  // --- CONFIG: Edit your pages here ---
  const config = {
    brandName: 'Clerks',
    tagline: 'Comfort, reimagined. Premium footwear crafted for every step, every occasion.',
    columns: [
      {
        heading: 'Navigate',
        links: [
          { label: 'Home',     href: '/index.html' },
          { label: 'About Us', href: '/pages/about-us.html' },
          { label: 'Shop',     href: '/pages/shop.html' },
        ]
      },
      {
        heading: 'Account',
        links: [
          { label: 'Login',    href: '/pages/login.html' },
          { label: 'Register', href: '/pages/register.html' },
        ]
      },
      {
        heading: 'Shopping',
        links: [
          { label: 'Checkout', href: '/pages/checkout.html' },
          { label: 'Payment',  href: '/pages/payment.html' },
        ]
      },
    ]
  };

  // --- CSS ---
  const styles = `
    .footer {
      margin-top: auto;
      background-color: #000;
      color: var(--text-muted);
      font-family: var(--font-body);
      font-size: 0.875rem;
      line-height: 1.6;
      border-top: 1px solid var(--border);
      padding: 0 var(--s-6);
    }

    .footer__inner {
      max-width: calc(var(--maxw) - 2 * var(--s-6));
      margin: 0 auto;
      padding: var(--s-16) 0 var(--s-12);
      display: grid;
      grid-template-columns: 1.2fr 2fr;
      gap: var(--s-12);
      align-items: start;
    }

    .footer__brand {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
      max-width: 320px;
    }

    .footer__logo {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--gold);
      line-height: 1;
    }

    .footer__tagline {
      color: var(--text-muted);
    }

    .footer__nav {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: var(--s-8);
    }

    .footer__heading {
      font-family: var(--font-body);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--text);
      margin-bottom: var(--s-4);
    }

    .footer__list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }

    .footer__link {
      color: var(--text-muted);
      transition: color var(--ease);
    }

    .footer__link:hover {
      color: var(--gold);
    }

    .footer__bottom {
      max-width: calc(var(--maxw) - 2 * var(--s-6));
      margin: 0 auto;
      padding: var(--s-6) 0;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-4);
      flex-wrap: wrap;
    }

    .footer__copy {
      font-size: 0.8rem;
      color: var(--text-faint);
    }

    @media (max-width: 700px) {
      .footer {
        padding: 0 var(--s-4);
      }

      .footer__inner {
        grid-template-columns: 1fr;
        gap: var(--s-8);
        padding: var(--s-12) 0 var(--s-8);
      }
    }
  `;

  // --- Inject CSS ---
  function injectStyles() {
    if (document.querySelector('#footer-styles')) return;
    const style = document.createElement('style');
    style.id = 'footer-styles';
    style.textContent = styles;
    document.head.appendChild(style);
  }

  // --- Build HTML ---
  function buildFooter() {
    const columns = config.columns.map(col => `
      <div class="footer__col">
        <h3 class="footer__heading">${col.heading}</h3>
        <ul class="footer__list">
          ${col.links.map(link => `
            <li><a href="${link.href}" class="footer__link">${link.label}</a></li>
          `).join('')}
        </ul>
      </div>
    `).join('');

    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
      <div class="footer__inner">
        <div class="footer__brand">
          <span class="footer__logo">${config.brandName}</span>
          <p class="footer__tagline">${config.tagline}</p>
        </div>
        <nav class="footer__nav" aria-label="Footer navigation">
          ${columns}
        </nav>
      </div>
      <div class="footer__bottom">
        <p class="footer__copy">&copy; ${new Date().getFullYear()} ${config.brandName}. All rights reserved.</p>
        <p class="footer__copy">Handcrafted in Street, Somerset since 1825</p>
      </div>
    `;

    document.body.appendChild(footer);
  }

  // --- Init ---
  function init() {
    injectStyles();
    buildFooter();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();