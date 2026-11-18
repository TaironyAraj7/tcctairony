// Home: desafio da semana (dados em desafios-data.js)
function carregarDesafioDaSemana() {
  const semanaAtual = calcularSemanaAtual();
  const d = desafios[semanaAtual - 1];
  const $ = (id) => document.getElementById(id);
  if (!$("challengeTitle")) return;

  $("challengeWeek").textContent = `Semana ${d.semana} de ${desafios.length}`;
  $("challengePeriod").textContent = formatarPeriodo(d.semana);
  $("challengeTitle").textContent = d.titulo;
  $("challengeDescription").textContent = d.descricao;
  $("challengeAction").textContent = `Como fazer: ${d.acao}`;
  $("challengeProgressLabel").textContent = `${semanaAtual} / ${desafios.length} desafios`;
  $("challengeLink").href = `desafio.html?semana=${d.semana}`;
  requestAnimationFrame(() => { $("challengeProgressFill").style.width = `${(semanaAtual / desafios.length) * 100}%`; });
}
carregarDesafioDaSemana();
