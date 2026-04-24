import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const posts = [
  {
    title: "Como filas ajudam a absorver picos de carga",
    content:
      "Processar likes de forma assincrona evita acoplamento entre a API HTTP e a escrita definitiva no banco."
  },
  {
    title: "Consistencia sob concorrencia com constraint unica",
    content:
      "Quando a duplicidade e garantida pelo banco, o sistema continua correto mesmo com varias requisicoes simultaneas."
  },
  {
    title: "Cache de ranking com invalidacao simples",
    content:
      "Cachear o ranking dos posts mais curtidos reduz leituras repetidas e continua facil de explicar em entrevista."
  },
  {
    title: "Fastify com TypeScript para APIs objetivas",
    content:
      "Uma estrutura enxuta com controllers, services e repositories ajuda na manutencao e na clareza da implementacao."
  },
  {
    title: "BullMQ com Redis para workloads simples",
    content:
      "BullMQ cobre o caso de uso de enfileiramento de likes sem adicionar a complexidade de brokers mais pesados."
  }
];

async function main() {
  const existingPostsCount = await prisma.post.count();

  if (existingPostsCount > 0) {
    console.log(`Seed skipped because ${existingPostsCount} posts already exist`);
    return;
  }

  await prisma.post.createMany({ data: posts });

  console.log(`Seed completed with ${posts.length} posts`);
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
