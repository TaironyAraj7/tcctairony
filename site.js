// Layout compartilhado (cabeçalho, rodapé), animações e navegação fluida
const TELEFONE = { exibir: "(83) 99405-2626", tel: "+5583994052626", whats: "5583994052626" };

(function () {
  const pagina = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const links = [
    ["Início", "index.html"], ["Notícias", "blog.html"], ["Aprenda", "aprenda.html"],
    ["Desafios", "desafios.html"], ["Quiz", "quiz.html"], ["Contato", "contato.html"]
  ];
  const ativo = (href) => {
    if (href === pagina) return true;
    if (href === "desafios.html" && pagina === "desafio.html") return true;
    return false;
  };

  const header = document.getElementById("site-header");
  if (header) {
    header.outerHTML = `
    <header class="topbar" id="topbar">
      <a class="brand-mark" href="index.html" aria-label="Início"><span class="brand-icon">◎</span></a>
      <nav class="main-nav" id="mainNav" aria-label="Navegação principal">
        ${links.map(([t, h]) => `<a href="${h}"${ativo(h) ? ' aria-current="page"' : ""}>${t}</a>`).join("")}
      </nav>
      <a class="topbar-phone" href="tel:${TELEFONE.tel}">☎ ${TELEFONE.exibir}</a>
      <button class="menu-toggle" id="menuToggle" type="button" aria-label="Abrir menu" aria-expanded="false">☰</button>
    </header>`;
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.outerHTML = `
    <footer class="footer" id="rodape">
      <div class="container footer-inner">
        <span>Projeto de TCC • Uso consciente da tecnologia na escola</span>
        <a class="footer-phone" href="contato.html">☎ ${TELEFONE.exibir}</a>
      </div>
    </footer>`;
  }

  // Menu mobile
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  toggle?.addEventListener("click", () => {
    const aberto = nav.classList.toggle("show");
    toggle.setAttribute("aria-expanded", aberto);
    toggle.textContent = aberto ? "✕" : "☰";
  });

  // Sombra no topo ao rolar
  const topbar = document.getElementById("topbar");
  const onScroll = () => topbar?.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Revelar elementos ao rolar
  const alvos = () => document.querySelectorAll("[data-reveal]:not(.in)");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    window.revealObserve = () => alvos().forEach((el) => io.observe(el));
  } else {
    window.revealObserve = () => alvos().forEach((el) => el.classList.add("in"));
  }
  document.addEventListener("DOMContentLoaded", () => {
    // escalonar entradas
    document.querySelectorAll("[data-stagger]").forEach((grupo) => {
      [...grupo.children].forEach((c, i) => { c.setAttribute("data-reveal", ""); c.style.transitionDelay = `${Math.min(i, 8) * 60}ms`; });
    });
    window.revealObserve();
    // observa conteúdo inserido depois (notícias)
    new MutationObserver(() => window.revealObserve()).observe(document.body, { childList: true, subtree: true });
  });

  // Transição suave entre páginas
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !["http:", "https:", "file:"].includes(url.protocol)) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(() => { location.href = url.href; }, 180);
  });
  window.addEventListener("pageshow", () => document.body.classList.remove("leaving"));
})();
