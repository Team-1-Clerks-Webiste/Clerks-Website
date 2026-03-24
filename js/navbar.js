
export function loadNavbar() {
  const navbar = `
  <div class="top-nav"></div>
    <nav>
      <div class="logo">
        <a href="../index.html">
          <img src="../assets/clerks logo.png" />
        </a>
      </div>
      <div class="links">
        <ul>
          <li>Men</li>
          <li>Women</li>
          <li>Children</li>
          <li>Sport</li>
          <li>School</li>
          <li><a href="/pages/about-us.html">About</a></li>
          <li>Sale</li>
        </ul>
      </div>
      <div class="icons">
        <input type="text" placeholder=" Search..." />
        <img class="cart-wrapper" src="../assets/heart.png" />
        <a href="../pages/login.html"><img class="cart-wrapper" src="../assets/user.png" /></a>
        <a href="../pages/checkout.html">
          <div class="cart-wrapper">
            <img class="icon" src="../assets/shopping-bag.png" />
            <span id="cart-count"></span>
          </div>
        </a>
      </div>
    </nav>
  `;

  document.getElementById("navbar-container").innerHTML = navbar;
}