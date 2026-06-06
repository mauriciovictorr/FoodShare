const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function mesAtual() {
  return MESES[new Date().getMonth()];
}

function formatValidade(date) {
  const d = new Date(date);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}`;
}

function timeAgo(date) {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `Há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Há ${diffH} ${diffH === 1 ? 'hora' : 'horas'}`;

  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `Há ${diffD} ${diffD === 1 ? 'dia' : 'dias'}`;

  const diffM = Math.floor(diffD / 30);
  return `Há ${diffM} ${diffM === 1 ? 'mês' : 'meses'}`;
}

function isExpired(validade) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(validade) < today;
}

function donationDisplayStatus(doacao) {
  if (isExpired(doacao.validade)) return 'expirado';
  if (doacao.status === 'disponivel') return 'ativo';
  if (doacao.status === 'reservado') return 'reservado';
  if (doacao.status === 'entregue') return 'entregue';
  return doacao.status;
}

function solicitationDisplayStatus(status) {
  const map = {
    pendente: 'pendente',
    aprovado: 'aprovado',
    recusado: 'recusado',
    cancelado: 'cancelado',
  };
  return map[status] || status;
}

function formatDateShort(date) {
  const d = new Date(date);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

module.exports = {
  mesAtual,
  formatValidade,
  timeAgo,
  isExpired,
  donationDisplayStatus,
  solicitationDisplayStatus,
  formatDateShort,
};
