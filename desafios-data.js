// ============================================================
// DESAFIOS — 12 semanas (dados compartilhados por todas as páginas)
// Altere apenas DESAFIOS_DATA_INICIO para definir quando começa a Semana 1.
// Formato: AAAA-MM-DD
// ============================================================
const DESAFIOS_DATA_INICIO = "2026-08-24";

const desafios = [
  { semana: 1, titulo: "Uma aula. Sem notificações.", descricao: "Coloque o celular no silencioso, guarde-o e veja como fica sua experiência.", acao: "Desative as notificações e mantenha o aparelho guardado durante uma aula.", dica: "Ative o modo “Não perturbe” antes de sair de casa para não depender da memória." },
  { semana: 2, titulo: "Celular longe do alcance.", descricao: "Deixe o aparelho fora da mesa para reduzir a vontade de conferir a tela.", acao: "Durante uma aula, coloque o celular na mochila ou em um local combinado pela escola.", dica: "Quanto mais difícil for pegar o aparelho, menor a chance de olhar sem pensar." },
  { semana: 3, titulo: "Uma aula sem desbloquear.", descricao: "Passe uma aula inteira sem desbloquear a tela do celular.", acao: "Resista ao impulso de olhar a tela, mesmo quando sentir vontade.", dica: "A vontade costuma passar em poucos minutos. Respire e volte para a explicação." },
  { semana: 4, titulo: "Primeiro a explicação.", descricao: "Dê prioridade total ao professor antes de pesquisar ou conferir qualquer coisa no aparelho.", acao: "Anote suas dúvidas e só use o celular quando a atividade realmente pedir.", dica: "Uma lista de dúvidas no caderno vale mais que dez abas abertas." },
  { semana: 5, titulo: "Modo avião na aula.", descricao: "Experimente uma aula inteira com o celular em modo avião.", acao: "Ative o modo avião antes da aula e perceba quantas distrações desaparecem.", dica: "Sem sinal, não há mensagem nova para te chamar a atenção." },
  { semana: 6, titulo: "Olhar para quem está falando.", descricao: "Troque a tela pela conversa e pratique presença durante explicações e debates.", acao: "Mantenha o celular guardado e direcione sua atenção para professor e colegas.", dica: "Participe de pelo menos uma discussão por aula: falar também ajuda a manter o foco." },
  { semana: 7, titulo: "Intervalo também é escolha.", descricao: "Não transforme todo intervalo em tempo de tela.", acao: "Passe pelo menos metade do intervalo longe do celular e observe o que acontece ao seu redor.", dica: "Convide um colega para conversar ou jogar algo sem tela." },
  { semana: 8, titulo: "Uma atividade 100% no papel.", descricao: "Faça uma atividade sem abrir aplicativos que não sejam necessários para a tarefa.", acao: "Use caderno, folha e caneta sempre que a atividade permitir.", dica: "Escrever à mão ajuda a fixar o conteúdo e deixa menos espaço para distração." },
  { semana: 9, titulo: "Menos checagens.", descricao: "Observe quantas vezes você sente vontade de verificar mensagens durante a aula.", acao: "Anote mentalmente cada impulso e adie a checagem para depois da aula.", dica: "Conte os impulsos: só de perceber, você já começa a controlá-los." },
  { semana: 10, titulo: "Foco por blocos.", descricao: "Escolha um período de 20 minutos para estudar sem nenhuma distração do celular.", acao: "Cronometre 20 minutos de foco e deixe o celular completamente fora da tarefa.", dica: "Depois dos 20 minutos, faça uma pausa curta de 5 minutos e recomece." },
  { semana: 11, titulo: "Se precisar, peça ajuda.", descricao: "Antes de pegar o celular para pesquisar algo, tente perguntar ao professor ou a um colega.", acao: "Em uma aula, tente resolver pelo diálogo uma dúvida que você normalmente pesquisaria imediatamente.", dica: "Perguntar também é aprender — e quase sempre é mais rápido que pesquisar." },
  { semana: 12, titulo: "Uma semana de foco total.", descricao: "Reúna os aprendizados das semanas anteriores e pratique o uso consciente do celular.", acao: "Escolha pelo menos três estratégias anteriores e use-as durante toda a semana.", dica: "Anote quais estratégias funcionaram melhor para você e mantenha-as depois do projeto." }
];

function calcularSemanaAtual(dataInicioISO = DESAFIOS_DATA_INICIO, agora = new Date()) {
  const [ano, mes, dia] = dataInicioISO.split("-").map(Number);
  const inicio = new Date(ano, mes - 1, dia);
  inicio.setHours(0, 0, 0, 0);
  const hoje = new Date(agora);
  hoje.setHours(0, 0, 0, 0);
  const dias = Math.floor((hoje - inicio) / 86400000);
  if (Number.isNaN(dias) || dias < 0) return 1;
  return (Math.floor(dias / 7) % desafios.length) + 1;
}

function formatarPeriodo(semana, dataInicioISO = DESAFIOS_DATA_INICIO) {
  const [ano, mes, dia] = dataInicioISO.split("-").map(Number);
  const inicio = new Date(ano, mes - 1, dia);
  inicio.setDate(inicio.getDate() + ((semana - 1) * 7));
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 6);
  const f = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
  return `${f.format(inicio)} — ${f.format(fim)}`;
}

// Progresso salvo no navegador (semanas concluídas)
function getConcluidos() {
  try { return JSON.parse(localStorage.getItem("modoaula:concluidos") || "[]"); } catch { return []; }
}
function setConcluidos(lista) {
  try { localStorage.setItem("modoaula:concluidos", JSON.stringify(lista)); } catch {}
}
