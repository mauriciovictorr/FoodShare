const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { donationDisplayStatus } = require('../utils/formatTime');

function isApiRequest(req) {
  const contentType = req.headers['content-type'] || '';
  const accept = req.headers['accept'] || '';
  return contentType.includes('application/json') || accept.includes('application/json');
}

function isDoador(usuario) {
  return usuario.role === 'doador' || usuario.role === 'admin';
}

function normalizeItens(body) {
  let itens = body.itens;
  if (!itens && body.nome) itens = [body];
  if (itens && !Array.isArray(itens)) {
    itens = Object.keys(itens)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => itens[key]);
  }
  return itens || [];
}

function validateDoacao(body) {
  const errors = [];
  const itens = normalizeItens(body);

  if (itens.length === 0) {
    errors.push({ field: 'itens', message: 'Adicione pelo menos um item.' });
    return { errors, itens };
  }

  itens.forEach((item, i) => {
    if (!item.nome || !String(item.nome).trim()) {
      errors.push({ field: `itens.${i}.nome`, message: 'Informe o nome do alimento.' });
    }
    if (!item.categoria) {
      errors.push({ field: `itens.${i}.categoria`, message: 'Selecione uma categoria.' });
    }
    const qty = parseInt(item.quantidade, 10);
    if (!item.quantidade || Number.isNaN(qty) || qty < 1) {
      errors.push({ field: `itens.${i}.quantidade`, message: 'Informe uma quantidade válida.' });
    }
    if (!item.validade) {
      errors.push({ field: `itens.${i}.validade`, message: 'Informe a validade.' });
    }
  });

  return { errors, itens };
}

async function getDoadorIndexData(userId) {
  const doacoes = await prisma.doacao.findMany({
    where: { usuarioId: userId },
    include: { itens: { orderBy: { validade: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  const itens = doacoes.flatMap((doacao) =>
    doacao.itens.map((item) => ({
      id: item.id,
      nome: item.nome,
      quantidade: item.quantidade,
      categoria: item.categoria,
      validade: item.validade,
      displayStatus: donationDisplayStatus({
        status: doacao.status,
        validade: item.validade,
      }),
    }))
  );

  return { isDoador: true, itens, doacoes: [] };
}

/**
 * @swagger
 * tags:
 *   name: Doacoes
 *   description: Gerenciamento de doações de alimentos
 */

router.get('/', authenticate, async (req, res) => {
  try {
    const usuario = req.usuario;

    if (isDoador(usuario)) {
      const data = await getDoadorIndexData(usuario.id);
      if (isApiRequest(req)) {
        const doacoes = await prisma.doacao.findMany({
          where: { usuarioId: usuario.id },
          include: { itens: true },
          orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json(doacoes);
      }
      return res.render('doacoes/index', {
        title: 'Doações - FoodShare',
        activeNav: 'doacoes',
        pageHeadingPrefix: 'Aqui ficam suas',
        pageHeadingHighlight: 'doações',
        pageSubtitle: 'Gerencie os itens que você publicou e acompanhe validade e status.',
        headerActionLabel: 'Nova doação',
        headerActionModal: true,
        openDoacaoModal: req.query.nova === '1',
        ...data,
      });
    }

    const doacoes = await prisma.doacao.findMany({
      where: { status: 'disponivel' },
      include: {
        usuario: { select: { nome: true, email: true } },
        itens: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (isApiRequest(req)) return res.status(200).json(doacoes);
    return res.render('doacoes/index', {
      title: 'Doações - FoodShare',
      activeNav: 'doacoes',
      pageHeadingPrefix: 'Esse é o',
      pageHeadingHighlight: 'catálogo',
      pageSubtitle: 'Navegue pelas doações da comunidade e solicite o que precisar.',
      isDoador: false,
      itens: [],
      doacoes,
    });
  } catch (err) {
    console.error('[doacoes] Erro ao listar doações:', err);
    if (isApiRequest(req)) return res.status(500).json({ message: 'Erro interno' });
    res.status(500).render('error', { statusCode: 500, context: 'doacoes_list', error: err });
  }
});

router.get('/nova', authenticate, authorize(['doador', 'admin']), (req, res) => {
  res.redirect('/doacoes?nova=1');
});

router.post('/nova', authenticate, authorize(['doador', 'admin']), async (req, res) => {
  try {
    const { errors, itens } = validateDoacao(req.body);

    if (errors.length > 0) {
      if (isApiRequest(req)) return res.status(400).json({ errors });
      const data = await getDoadorIndexData(req.usuario.id);
      return res.status(400).render('doacoes/index', {
        title: 'Doações - FoodShare',
        activeNav: 'doacoes',
        pageHeadingPrefix: 'Aqui ficam suas',
        pageHeadingHighlight: 'doações',
        pageSubtitle: 'Gerencie os itens que você publicou e acompanhe validade e status.',
        headerActionLabel: 'Nova doação',
        headerActionModal: true,
        openDoacaoModal: true,
        doacaoErrors: errors,
        doacaoOld: req.body,
        ...data,
      });
    }

    await prisma.doacao.create({
      data: {
        observacoes: req.body.observacoes || null,
        usuarioId: req.usuario.id,
        status: 'disponivel',
        itens: {
          create: itens.map((item) => ({
            nome: String(item.nome).trim(),
            quantidade: parseInt(item.quantidade, 10),
            categoria: item.categoria,
            validade: new Date(item.validade),
          })),
        },
      },
    });

    if (isApiRequest(req)) return res.status(201).json({ message: 'Doações criadas com sucesso' });
    return res.redirect('/doacoes');
  } catch (err) {
    console.error('[doacoes] Erro ao criar doações:', err);
    if (isApiRequest(req)) return res.status(500).json({ message: 'Erro interno ao criar doação' });
    res.status(500).render('error', { statusCode: 500, context: 'doacoes_create', error: err });
  }
});

module.exports = router;
