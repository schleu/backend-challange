const fakePosts = [
  {
    id: 1,
    titulo: 'Primeiro post do blog',
    conteudo: 'Apenas um teste.',
    publicado: true,
    autor: 'João',
  },
  {
    id: 2,
    titulo: 'Testes unitários',
    conteudo: 'Conteúdo sobre testes unitários.',
    publicado: true,
    autor: 'Vitor',
  },
  {
    id: 3,
    titulo: 'Javascript',
    conteudo: 'Conteúdo sobre testes Javascript.',
    publicado: false,
    autor: 'Teste',
  },
];

// E depois nosso objeto de mock do Prisma, retornando os dados falsos
const prismaMock = {
  post: {
    create: jest.fn().mockReturnValue(fakePosts[0]),
    findMany: jest.fn().mockResolvedValue(fakePosts),
    findUnique: jest.fn().mockResolvedValue(fakePosts[0]),
    update: jest.fn().mockResolvedValue(fakePosts[0]),
    delete: jest.fn(), // O método delete não retorna nada
  },
};
