const { z } = require('zod');

const registerSchema = z.object({
  nome: z
    .string({ message: 'Informe seu nome completo.' })
    .min(3, 'O nome precisa ter pelo menos 3 caracteres.'),
  email: z
    .string({ message: 'Informe seu e-mail.' })
    .email('Digite um e-mail válido (ex: seu@email.com).'),
  senha: z
    .string({ message: 'Crie uma senha.' })
    .min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
  telefone: z
    .string({ message: 'Informe seu telefone ou WhatsApp.' })
    .regex(
      /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/,
      'Use um telefone válido, como (82) 91234-5678.'
    ),
  role: z.enum(['doador', 'receptor'], {
    message: 'Selecione se você quer doar ou receber alimentos.',
  }),
});

const loginSchema = z.object({
  email: z
    .string({ message: 'Informe seu e-mail.' })
    .email('Digite um e-mail válido (ex: seu@email.com).'),
  senha: z.string({ message: 'Digite sua senha.' }).min(1, 'Digite sua senha.'),
});

module.exports = { registerSchema, loginSchema };
