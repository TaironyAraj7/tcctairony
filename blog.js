const NEWS_JSON = "noticias.json";

const placeholderClasses = [
  "thumb-ink", "thumb-paper", "thumb-lines",
  "thumb-face", "thumb-eye", "thumb-window"
];

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(isoDate) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "long", year: "numeric"
  }).format(new Date(`${isoDate}T12:00:00`));
}

function formatShortDate(isoDate) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric"
  }).format(new Date(`${isoDate}T12:00:00`));
}

function sortNews(news) {
  return [...news].sort((a, b) =>
    new Date(`${b.data}T12:00:00`) - new Date(`${a.data}T12:00:00`)
  );
}

function getThumbMarkup(news, index) {
  const fallbackClass = placeholderClasses[Math.abs(Number(index) || 0) % placeholderClasses.length];
  if (news.imagem) {
    return `<div class="news-thumb">
      <img src="${escapeHtml(news.imagem)}" alt="${escapeHtml(news.titulo)}" loading="lazy"
           onerror="this.style.display='none'; this.nextElementSibling.hidden=false;">
      <div class="thumb-placeholder ${fallbackClass}" hidden></div>
    </div>`;
  }
  return `<div class="news-thumb"><div class="thumb-placeholder ${fallbackClass}"></div></div>`;
}

function renderNewsCard(news, index) {
  const link = `blog.html?noticia=${encodeURIComponent(news.id)}`;
  const sourceLink = news.url || "";
  return `<article class="news-card col-12 col-md-6 col-xl-4">
    <div class="news-card-top">
      <span>${escapeHtml(formatShortDate(news.data))}</span>
      <span class="news-tag">${escapeHtml(news.categoria)}</span>
    </div>
    <a class="news-card-image-link" href="${link}" aria-label="Ler: ${escapeHtml(news.titulo)}">
      ${getThumbMarkup(news, index)}
    </a>
    <div class="news-card-body">
      <h3><a href="${link}">${escapeHtml(news.titulo)}</a></h3>
      <p>${escapeHtml(news.resumo)}</p>
      <div class="news-card-footer">
        <span>${escapeHtml(news.autor)}</span>
        <span>${escapeHtml(news.tempoLeitura)}</span>
      </div>
      ${sourceLink
        ? `<a class="news-source" href="${escapeHtml(sourceLink)}" target="_blank" rel="noopener noreferrer">Fonte: ${escapeHtml(news.fonte || "g1")} ↗</a>`
        : `<span class="news-source">Fonte: ${escapeHtml(news.fonte || "g1")}</span>`}
    </div>
  </article>`;
}

function renderHomeNews(news) {
  const target = document.getElementById("latestNewsGrid");
  if (!target) return;
  const latest = sortNews(news).slice(0, 3);
  target.innerHTML = latest.length
    ? latest.map(renderNewsCard).join("")
    : `<div class="empty-state">Nenhuma publicação encontrada.</div>`;

  const label = document.getElementById("latestNewsLabel");
  if (label && latest[0]) {
    label.textContent = `Atualizado em ${formatShortDate(latest[0].data)}`;
  }
}

function renderBlogList(news) {
  const grid = document.getElementById("blogNewsGrid");
  if (!grid) return;
  const sorted = sortNews(news);
  grid.innerHTML = sorted.length
    ? sorted.map((item, index) => renderNewsCard(item, index)).join("")
    : `<div class="empty-state">Nenhuma publicação encontrada.</div>`;
  const count = document.getElementById("newsCount");
  if (count) count.textContent = `${sorted.length} publicações`;
}

function renderArticle(news) {
  const list = document.getElementById("blogListing");
  const detail = document.getElementById("articleDetail");
  const articleContainer = document.getElementById("articleContent");
  if (!list || !detail || !articleContainer) return;

  const id = new URLSearchParams(window.location.search).get("noticia");
  if (!id) return;
  const article = news.find(item => String(item.id) === String(id));
  if (!article) return;

  list.hidden = true;
  detail.hidden = false;
  articleContainer.innerHTML = `
    <div class="article-back-row"><a class="prototype-btn" href="blog.html">← Voltar para as notícias</a></div>
    <header class="article-header">
      <div class="news-card-top">
        <span>${escapeHtml(formatDate(article.data))}</span>
        <span class="news-tag">${escapeHtml(article.categoria)}</span>
      </div>
      <h1>${escapeHtml(article.titulo)}</h1>
      <p class="article-lead">${escapeHtml(article.resumo)}</p>
      <div class="news-card-footer">
        <span>${escapeHtml(article.autor)}</span>
        <span>${escapeHtml(article.tempoLeitura)}</span>
      </div>
      <p class="article-source"><a href="${escapeHtml(article.url || "#")}" target="_blank" rel="noopener noreferrer">Ver matéria original — ${escapeHtml(article.fonte || "fonte")} ↗</a></p>
    </header>
    <div class="article-hero">${getThumbMarkup(article, article.id)}</div>
    <div class="article-text">
      ${(article.conteudo || []).map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    </div>`;
}

function showLoadWarning(usingFallback = false) {
  const messages = usingFallback
    ? "Modo local: exibindo uma cópia de segurança. Para que novas alterações no noticias.json apareçam automaticamente, abra o projeto com Live Server."
    : "Não foi possível carregar as publicações.";
  document.querySelectorAll("[data-news-error]").forEach(element => {
    element.hidden = false;
    element.textContent = messages;
  });
}

function setupCategoryFilters(news) {
  const pills = document.querySelectorAll(".category-pill");
  const grid = document.getElementById("blogNewsGrid");
  if (!pills.length || !grid) return;

  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(item => item.classList.remove("active"));
      pill.classList.add("active");
      const category = pill.dataset.category;
      const filtered = category === "Notícias" || category === "all"
        ? news
        : news.filter(item => item.categoria === category);
      const sorted = sortNews(filtered);
      grid.innerHTML = sorted.length
        ? sorted.map((item, index) => renderNewsCard(item, index)).join("")
        : `<div class="empty-state">Nenhuma publicação nesta categoria.</div>`;
      const count = document.getElementById("newsCount");
      if (count) count.textContent = `${sorted.length} publicações`;
    });
  });
}

const FALLBACK_NEWS = [
  {
    "id": 1,
    "data": "2026-06-30",
    "categoria": "Notícias",
    "titulo": "1 em cada 3 escolas ainda enfrenta obstáculos para aplicar lei que proíbe celulares, mostra levantamento",
    "resumo": "Entre os principais desafios estão a adesão dos estudantes, a falta de infraestrutura para guardar os aparelhos e a fiscalização contínua nos intervalos e nas aulas.",
    "imagem": "https://s2-g1.glbimg.com/hm9vLFYUrok-c1Hlqc-WkH-uw1o=/0x0:680x386/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2025/0/T/ZUt27LQgCX0wVBPOxhGA/celular-na-sala-de-aula.jpg",
    "autor": "Emily Santos e Ana Clara Alves — g1 e TV Globo",
    "tempoLeitura": "4 min",
    "fonte": "g1",
    "url": "https://g1.globo.com/",
    "conteudo": [
      "Uma pesquisa nacional sobre a lei que proíbe o uso de celulares nas escolas revelou que 92% das escolas brasileiras já dizem ter implementado a restrição ao uso de aparelhos eletrônicos para fins não pedagógicos. Mesmo assim, 39% dos gestores afirmam ter dificuldade alta para conquistar a adesão dos estudantes às novas regras, e outro 39% apontam falta de infraestrutura para guardar os aparelhos.",
      "A pesquisa nacional sobre o 1º ano da Lei nº 15.100/2025 foi realizada pelo Ministério da Educação (MEC), em parceria com o Inep e o Instituto Alana, com cooperação da UNESCO. O levantamento ouviu gestores de 8.189 escolas públicas e privadas, selecionadas por amostragem probabilística, e buscou entender como a legislação está sendo interpretada e aplicada nas unidades escolares.",
      "A Lei nº 15.100/2025 foi sancionada pelo presidente Lula em janeiro de 2025 e entrou em vigor no início do ano letivo. A norma prevê a proibição do uso de celulares na escola durante as aulas, recreios, intervalos e atividades extracurriculares, com exceções previstas na própria legislação."
    ]
  },
  {
    "id": 2,
    "data": "2026-03-09",
    "categoria": "Notícias",
    "titulo": "Adolescentes passam um terço do horário letivo no celular e têm prejuízos na atenção, revela estudo",
    "resumo": "Pesquisa do Departamento de Psicologia e Neurociência da Universidade da Carolina do Norte acompanhou jovens de 11 a 18 anos e descobriu que o uso do aparelho é persistente ao longo de todas as horas de aula.",
    "imagem": "https://s2-g1.glbimg.com/KtaYgsUL_JNsvDQ4iKWwnc6MwmQ=/0x0:1920x1080/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2025/M/L/7LnPpBQdGAhcflQmnWxw/img-celular-escola-14-01-25.mp4-snapshot-00.01.900.jpg",
    "autor": "Emily Santos — g1",
    "tempoLeitura": "4 min",
    "fonte": "g1",
    "url": "https://g1.globo.com/",
    "conteudo": [
      "Adolescentes passam quase um terço do dia letivo conectados a smartphones e checam os aparelhos dezenas de vezes para acessar redes sociais e aplicativos de entretenimento. É o que revela um estudo do Departamento de Psicologia e Neurociência da Universidade da Carolina do Norte.",
      "Os resultados mostram que esse comportamento está diretamente ligado a uma menor capacidade de atenção e a um controle de impulsos mais fraco entre os estudantes.",
      "A pesquisa acompanhou jovens de 11 a 18 anos do sudoeste dos Estados Unidos e mostrou que o uso do celular não ocorre apenas nos intervalos, mas de forma persistente ao longo de todas as horas de aula. De acordo com os pesquisadores, essa fragmentação da atenção prejudica habilidades fundamentais para o sucesso acadêmico."
    ]
  },
  {
    "id": 3,
    "data": "2025-05-27",
    "categoria": "Notícias",
    "titulo": "Mesmo com proibição, maioria dos estudantes do Ensino Médio segue levando celular para a escola e admite uso em sala de aula",
    "resumo": "Professores apoiam medida, mas alunos relatam dificuldade em ficar longe das telas e dizem que usam os aparelhos para comunicação com a família e redes sociais.",
    "imagem": "https://s2-g1.glbimg.com/aJ3xolcDqX5t_cZVGjpLNyB-bB4=/0x0:1920x1080/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2025/m/L/GtciACQ4iQAIliKUt6iQ/antes-proibicao-.01-frame-5195.jpeg",
    "autor": "Paloma Rodrigues — TV Globo, Brasília",
    "tempoLeitura": "3 min",
    "fonte": "TV Globo",
    "url": "https://g1.globo.com/",
    "conteudo": [
      "Uma pesquisa da iniciativa Equidade.info em parceria com a Frente Parlamentar da Educação apontou que 63% dos estudantes do Ensino Médio ainda levam o aparelho celular para a escola todos os dias, apesar da entrada em vigor da lei que proíbe seu uso em instituições de ensino.",
      "Entre os estudantes que levam o celular para a escola, mais da metade dizem que acessam o aparelho durante a aula: 54%.",
      "A pesquisa também registra que professores apoiam a medida, enquanto estudantes relatam dificuldade em ficar longe das telas e citam comunicação com a família e redes sociais entre os motivos para manter o aparelho por perto."
    ]
  },
  {
    "id": 4,
    "data": "2026-08-04",
    "categoria": "Notícias",
    "titulo": "Celular vira ferramenta pedagógica em escolas, mas infraestrutura tecnológica e conexão de internet são desafios, dizem gestores",
    "resumo": "4 em cada 10 instituições permitem que o aluno leve o aparelho pessoal para as dependências escolares, e algumas até permitem o uso para fins tecnológicos. Dados são do TIC Educação 2025.",
    "imagem": "https://s2-g1.glbimg.com/KtaYgsUL_JNsvDQ4iKWwnc6MwmQ=/0x0:1920x1080/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2025/M/L/7LnPpBQdGAhcflQmnWxw/img-celular-escola-14-01-25.mp4-snapshot-00.01.900.jpg",
    "autor": "Redação g1 — São Paulo",
    "tempoLeitura": "Não informado",
    "fonte": "g1",
    "url": "",
    "conteudo": [
      "Quase dois anos após a proibição do uso de celulares nas escolas do país, 4 em cada 10 instituições permitem que o aluno leve o aparelho pessoal para as dependências escolares. O desafio para essas escolas é definir critérios para alocação dos celulares durante as atividades letivas.",
      "Entre as escolas que garantem a permanência do aparelho nas dependências, 66% permitem o uso dos celulares pessoais para fins pedagógicos. A alternativa é ainda mais comum em escolas do Norte e do Nordeste, de áreas rurais e de pequeno porte, com até 150 alunos.",
      "O cenário foi detalhado no TIC Educação 2025, realizado pelo Cetic.br, do Núcleo de Informação e Coordenação do Ponto BR (NIC.br). Nesta edição, foram ouvidos por telefone 2.404 gestores de escolas públicas e particulares, de áreas urbanas e rurais."
    ]
  },
  {
    "id": 5,
    "data": "2026-07-02",
    "categoria": "Notícias",
    "titulo": "Alunos estão menos ansiosos e mais sociáveis um ano após lei que restringe celulares nas escolas entrar em vigor, avaliam diretores",
    "resumo": "Uma pesquisa do Ministério da Educação, com mais de 8 mil diretores de escolas públicas e particulares, mostrou que 90% das escolas já aplicam a restrição.",
    "imagem": "https://s2-g1.glbimg.com/wPyXLTvIl6gIj_EmP5OKWRu47N0=/0x0:3840x2160/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2026/t/8/anWteSR5S5lHoqLBqq6A/globo-canal-4-20260702-2000-frame-125759.jpeg",
    "autor": "Jornal Nacional",
    "tempoLeitura": "Não informado",
    "fonte": "Jornal Nacional",
    "url": "",
    "conteudo": [
      "A lei que restringe celulares nas escolas está em vigor há um ano e uma pesquisa do Ministério da Educação, com mais de 8 mil diretores de escolas públicas e particulares, apontou resultados positivos.",
      "Segundo os diretores ouvidos, os alunos estão menos ansiosos e mais sociáveis. A pesquisa também relacionou a restrição à queda no cyberbullying, nos conflitos digitais e em conflitos dentro da escola.",
      "O levantamento mostrou ainda que 90% das escolas já aplicam a restrição aos aparelhos."
    ]
  },
  {
    "id": 6,
    "data": "2025-08-23",
    "categoria": "Notícias",
    "titulo": "Lei que proibiu celulares nas escolas do Rio gera melhora no aprendizado, aponta Stanford",
    "resumo": "Levantamento da Universidade de Stanford em parceria com a Secretaria de Educação do Rio mostra melhora média de 25,7% em matemática e 13,4% em português entre alunos do 6º ao 9º ano.",
    "imagem": "https://s2-g1.glbimg.com/KY-Iv7E6YS4EYOvDsVObXADs5g0=/0x0:598x321/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2025/e/h/Na1szOQ6ikjq0b7bA5dg/captura-de-tela-2025-08-23-205422.png",
    "autor": "Jornal Nacional",
    "tempoLeitura": "Não informado",
    "fonte": "Jornal Nacional",
    "url": "",
    "conteudo": [
      "Um levantamento da Universidade de Stanford em parceria com a Secretaria de Educação do Rio de Janeiro apontou melhora no aprendizado após a restrição ao uso de celulares nas escolas.",
      "Entre alunos do 6º ao 9º ano, a melhora média foi de 25,7% em matemática e 13,4% em português, segundo o levantamento citado na matéria.",
      "A restrição ao uso de celulares nas redes pública e privada do Rio de Janeiro havia sido adotada no início do ano letivo de 2024 e depois foi ampliada para todo o país."
    ]
  }
];

async function loadNews() {
  try {
    const response = await fetch(`./${NEWS_JSON}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const news = await response.json();
    if (!Array.isArray(news)) throw new Error("Formato inválido no noticias.json");
    renderHomeNews(news);
    renderBlogList(news);
    renderArticle(news);
    setupCategoryFilters(news);
  } catch (error) {
    // file:// bloqueia fetch de JSON em muitos navegadores.
    // O fallback evita uma tela vazia, mas o JSON continua sendo a fonte oficial.
    console.warn("Não foi possível acessar noticias.json. Usando fallback local.", error);
    renderHomeNews(FALLBACK_NEWS);
    renderBlogList(FALLBACK_NEWS);
    renderArticle(FALLBACK_NEWS);
    setupCategoryFilters(FALLBACK_NEWS);
    showLoadWarning(true);
  }
}

document.addEventListener("DOMContentLoaded", loadNews);
