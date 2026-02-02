/**
 * Fonte única dos tutoriais. Substitua os youtubeVideoId pelos IDs reais
 * dos seus vídeos do YouTube (ex.: em youtu.be/XYZ o ID é "XYZ").
 */

export interface TutorialTopic {
  slug: string;
  label: string;
  description: string;
}

export interface TutorialItem {
  id: string;
  topicSlug: string;
  title: string;
  description: string;
  youtubeVideoId: string;
  order: number;
  duration?: string;
  featured?: boolean;
}

export const TUTORIAL_TOPICS: TutorialTopic[] = [
  {
    slug: "introducao",
    label: "Introdução",
    description:
      "Conheça o MentionOne, faça seu primeiro acesso e entenda o dashboard.",
  },
  {
    slug: "configuracoes",
    label: "Configurações da empresa",
    description:
      "Nome, endereço, descrição, e-mail, fuso horário e imagem de capa.",
  },
  {
    slug: "boxes",
    label: "Boxes",
    description:
      "Criar e editar boxes, branding (cores, logo), opções de feedback e QR Code.",
  },
  {
    slug: "feedback",
    label: "Feedback",
    description: "Ver feedbacks recebidos e marcar como pendente ou resolvido.",
  },
  {
    slug: "relatorios",
    label: "Relatórios",
    description: "Filtros, gráficos e exportação em CSV.",
  },
  {
    slug: "planos",
    label: "Planos e limites",
    description: "Entenda os limites do seu plano e como fazer upgrade.",
  },
];

/** Vídeos por tópico. Substitua youtubeVideoId pelos IDs dos seus vídeos. */
export const TUTORIAL_ITEMS: TutorialItem[] = [
  // Introdução
  {
    id: "intro-1",
    topicSlug: "introducao",
    title: "O que é o MentionOne",
    description: "Visão geral do produto e primeiros passos.",
    youtubeVideoId: "dQw4w9WgXcQ",
    order: 1,
    duration: "2:00",
    featured: true,
  },
  {
    id: "intro-2",
    topicSlug: "introducao",
    title: "Primeiro acesso e visão do dashboard",
    description: "Navegação e métricas principais.",
    youtubeVideoId: "dQw4w9WgXcQ",
    order: 2,
  },
  // Configurações
  {
    id: "config-1",
    topicSlug: "configuracoes",
    title: "Configurando dados da empresa",
    description: "Nome, endereço, descrição, e-mail e fuso horário.",
    youtubeVideoId: "dQw4w9WgXcQ",
    order: 1,
    featured: true,
  },
  {
    id: "config-2",
    topicSlug: "configuracoes",
    title: "Imagem de capa da empresa",
    description: "Como fazer upload e alterar a capa.",
    youtubeVideoId: "dQw4w9WgXcQ",
    order: 2,
  },
  // Boxes
  {
    id: "boxes-1",
    topicSlug: "boxes",
    title: "Criando sua primeira box",
    description: "Nome, local, slug e opções de feedback.",
    youtubeVideoId: "dQw4w9WgXcQ",
    order: 1,
    featured: true,
  },
  {
    id: "boxes-2",
    topicSlug: "boxes",
    title: "Editar box e branding",
    description: "Cores, logo e nome do cliente na identidade visual.",
    youtubeVideoId: "dQw4w9WgXcQ",
    order: 2,
  },
  {
    id: "boxes-3",
    topicSlug: "boxes",
    title: "Opções de feedback (crítica, sugestão, elogio)",
    description: "Como configurar as categorias de feedback da box.",
    youtubeVideoId: "dQw4w9WgXcQ",
    order: 3,
  },
  {
    id: "boxes-4",
    topicSlug: "boxes",
    title: "QR Code e link da box",
    description: "Gerar QR Code e copiar o link para compartilhar.",
    youtubeVideoId: "dQw4w9WgXcQ",
    order: 4,
  },
  // Feedback
  {
    id: "feedback-1",
    topicSlug: "feedback",
    title: "Visualizando feedbacks recebidos",
    description: "Lista de feedbacks e informações exibidas.",
    youtubeVideoId: "dQw4w9WgXcQ",
    order: 1,
    featured: true,
  },
  {
    id: "feedback-2",
    topicSlug: "feedback",
    title: "Marcar como pendente ou resolvido",
    description: "Como organizar o status dos feedbacks.",
    youtubeVideoId: "dQw4w9WgXcQ",
    order: 2,
  },
  // Relatórios
  {
    id: "rel-1",
    topicSlug: "relatorios",
    title: "Filtros: box, período e categoria",
    description: "Como filtrar os dados dos relatórios.",
    youtubeVideoId: "dQw4w9WgXcQ",
    order: 1,
    featured: true,
  },
  {
    id: "rel-2",
    topicSlug: "relatorios",
    title: "Gráficos e visualizações",
    description: "Entendendo os gráficos por categoria, dia e tipo.",
    youtubeVideoId: "dQw4w9WgXcQ",
    order: 2,
  },
  {
    id: "rel-3",
    topicSlug: "relatorios",
    title: "Exportar em CSV",
    description: "Exportar a lista de feedbacks para planilha.",
    youtubeVideoId: "dQw4w9WgXcQ",
    order: 3,
  },
  // Planos
  {
    id: "planos-1",
    topicSlug: "planos",
    title: "Limites do plano e funcionalidades",
    description: "O que cada plano oferece e limites de uso.",
    youtubeVideoId: "dQw4w9WgXcQ",
    order: 1,
    featured: true,
  },
  {
    id: "planos-2",
    topicSlug: "planos",
    title: "Como fazer upgrade",
    description: "Passos para alterar de plano.",
    youtubeVideoId: "dQw4w9WgXcQ",
    order: 2,
  },
];

export function getTutorialsByTopic(): Map<string, TutorialItem[]> {
  const byTopic = new Map<string, TutorialItem[]>();
  const sorted = [...TUTORIAL_ITEMS].sort((a, b) => a.order - b.order);
  for (const item of sorted) {
    const list = byTopic.get(item.topicSlug) ?? [];
    list.push(item);
    byTopic.set(item.topicSlug, list);
  }
  return byTopic;
}
