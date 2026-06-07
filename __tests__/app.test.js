const request = require('supertest');
const app = require('../app');

describe('FoodShare Basic Routes', () => {
  it('deve redirecionar para a página de login ao acessar a raiz sem estar logado (status 302)', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toBe('/auth');
  });

  it('deve redirecionar para o login se acessar /historico sem token (status 302)', async () => {
    const res = await request(app).get('/historico');
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toBe('/auth/login');
  });

  it('deve retornar 404 para uma rota inexistente', async () => {
    const res = await request(app).get('/rota-que-nao-existe');
    expect(res.statusCode).toEqual(404);
  });
});
