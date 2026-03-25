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
    tagline: 'Comfort, Reimagined',
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
    :root {
      --footer-bg:         #0a0a0a;
      --footer-gold:       #c9a84c;
      --footer-gold-light: #e8c97a;
      --footer-gold-mute:  rgba(201, 168, 76, 0.12);
      --footer-text:       #909090;
      --footer-border:     rgba(201, 168, 76, 0.18);
      --footer-transition: 0.22s ease;
    }

    .footer {
      background-color: var(--footer-bg);
      color: var(--footer-text);
      font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
      font-size: 0.875rem;
      line-height: 1.6;
      border-top: 1px solid var(--footer-border);
      padding: 0 clamp(1.5rem, 5vw, 4rem);
    }

    .footer__inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 3.5rem 0 2.5rem;
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 3rem;
      align-items: start;
    }

    .footer__brand {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .footer__logo {
      font-family: 'Cormorant Garamond', 'Georgia', serif;
      font-size: clamp(1.6rem, 2.5vw, 2.1rem);
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      background: linear-gradient(135deg, var(--footer-gold), var(--footer-gold-light));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .footer__tagline {
      font-size: 0.78rem;
      color: var(--footer-text);
      letter-spacing: 0.04em;
      font-style: italic;
      margin: 0;
    }

    .footer__nav {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 2rem;
    }

    .footer__heading {
      font-family: 'Cormorant Garamond', 'Georgia', serif;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--footer-gold);
      margin: 0 0 0.9rem;
      padding-bottom: 0.45rem;
      border-bottom: 1px solid var(--footer-border);
    }

    .footer__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .footer__link {
      color: var(--footer-text);
      text-decoration: none;
      display: inline-block;
      position: relative;
      transition: color var(--footer-transition), padding-left var(--footer-transition);
    }

    .footer__link::before {
      content: '';
      position: absolute;
      left: -10px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 1px;
      background: var(--footer-gold);
      transition: width var(--footer-transition);
    }

    .footer__link:hover {
      color: var(--footer-gold-light);
      padding-left: 10px;
    }

    .footer__link:hover::before {
      width: 6px;
    }

    .footer__divider {
      max-width: 1100px;
      margin: 0 auto;
      height: 1px;
      background: linear-gradient(
        to right,
        transparent,
        var(--footer-gold-mute) 20%,
        var(--footer-border) 50%,
        var(--footer-gold-mute) 80%,
        transparent
      );
    }

    .footer__bottom {
      max-width: 1100px;
      margin: 0 auto;
      padding: 1.25rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .footer__copy {
      margin: 0;
      font-size: 0.75rem;
      color: var(--footer-text);
      letter-spacing: 0.04em;
    }

    @media (max-width: 700px) {
      .footer__inner {
        grid-template-columns: 1fr;
        gap: 2rem;
        padding: 2.5rem 0 2rem;
      }

      .footer__nav {
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 1.5rem;
      }
    }
  `;

  // --- Inject Google Fonts ---
  function injectFonts() {
    if (document.querySelector('#footer-fonts')) return;
    const link = document.createElement('link');
    link.id = 'footer-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=DM+Sans&display=swap';
    document.head.appendChild(link);
  }

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
      <div class="footer__divider"></div>
      <div class="footer__bottom">
        <p class="footer__copy">&copy; ${new Date().getFullYear()} ${config.brandName}. All rights reserved.</p>
      </div>
    `;

    document.body.appendChild(footer);
  }

  // --- Init ---
  function init() {
    injectFonts();
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