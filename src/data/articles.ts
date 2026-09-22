import { BlogPost } from '../types';

export const INITIAL_ARTICLES: BlogPost[] = [
  {
    id: 'art-1',
    title: 'Superalimentos Compartilháveis: O que você e seu pet podem comer juntos na mesma refeição',
    slug: 'superalimentos-compartilhaveis-humano-e-pet',
    excerpt: 'Descubra como cenoura, abóbora, maçã e mirtilos trazem benefícios antioxidantes potentes para a sua imunidade e para a vitalidade do seu companheiro.',
    category: 'receitas-compartilhadas',
    author: {
      name: 'Dra. Camila Vasconcelos',
      role: 'Médica Veterinária Nutróloga & Tutora do Pipoca',
      avatar: 'https://images.unsplash.com/photo-1594824813589-32a061456254?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '12 de Setembro de 2026',
    readTimeMinutes: 5,
    coverImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
    tags: ['Superalimentos', 'Receitas', 'Antioxidantes', 'Saúde Duo'],
    likes: 342,
    pawReactions: 289,
    usefulReactions: 195,
    content: [
      'Você sabia que quando vai à feira comprar alimentos frescos para a sua dieta, pode estar abastecendo ao mesmo tempo os petiscos mais saudáveis do seu cão ou gato? Muitos vegetais e frutas compartilham perfis nutricionais extraordinários que beneficiam humanos e animais.',
      '1. Abóbora Cabotiá ou Moranga:\nRica em fibras solúveis, betacaroteno (precursor da Vitamina A) e potássio. Para você, ela traz saciedade e melhora a circulação. Para cães e gatos, o purê de abóbora pura cozida no vapor é um regulador intestinal lendário, auxiliando tanto em quadros de fezes amolecidas quanto de constipação.',
      '2. Cenoura Crua ou Cozida:\nPara os humanos, previne o envelhecimento precoce e cuida da visão. Para cães, um pedaço de cenoura gelada serve como um "mordedor natural" que auxilia na limpeza mecânica dos dentes e alivia a ansiedade mastigatória.',
      '3. Mirtilos (Blueberries):\nConsiderados uma das maiores fontes de antocianinas do reino vegetal, os mirtilos auxiliam na função cognitiva de idosos (humanos e pets!), reduzindo o estresse oxidativo celular.',
      'Regra de Ouro: Para humanos, você pode temperar seu prato com azeite, sal e ervas. Já a porção do pet deve ser estritamente separada ANTES do sal, do alho e da cebola (que são proibidos para eles!).'
    ],
    comments: [
      {
        id: 'c-1',
        author: 'Juliana Mendes',
        petName: 'Bolinha (Golden)',
        date: 'Há 2 dias',
        content: 'Fiz o purê de abóbora sem sal e coloquei no tapete de lamber do Bolinha. Ele ficou entretido por 25 minutos e eu comi o resto temperadinho com alecrim. Maravilhoso!',
        likes: 18
      },
      {
        id: 'c-2',
        author: 'Lucas Pinheiro',
        petName: 'Mimi (Gatinha persa)',
        date: 'Há 1 dia',
        content: 'Mimi adora uma colherzinha de abóbora amassada no sachê! Ajudou muito na digestão dela.',
        likes: 9
      }
    ]
  },
  {
    id: 'art-2',
    title: 'Batch Cooking: Como planejar e congelar as marmitas saudáveis da semana para você e seu cão',
    slug: 'batch-cooking-planejamento-marmitas-tutor-e-pet',
    excerpt: 'Economize tempo e dinheiro cozinhando em lote. Aprenda técnicas seguras de congelamento em potes de vidro sem perda de nutrientes.',
    category: 'nutricao-humana',
    author: {
      name: 'Renato Furtado',
      role: 'Nutricionista Clínico Funcional',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '08 de Setembro de 2026',
    readTimeMinutes: 7,
    coverImage: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    tags: ['Batch Cooking', 'Planejamento', 'Marmitas', 'Sem Desperdício'],
    likes: 215,
    pawReactions: 178,
    usefulReactions: 240,
    content: [
      'A falta de tempo é a maior vilã da alimentação saudável. Quando bate a correria da semana, acabamos pedindo delivery ultraprocessado e oferecendo petiscos industriais carregados de sódio para nossos pets.',
      'O método do Batch Cooking (cozinhar em lotes no domingo) transforma a rotina. Em apenas 2 horas na cozinha, é possível estruturar as refeições dos próximos 5 a 7 dias.',
      'Como sincronizar o preparo:\n- Cozinhe uma panela grande de peito de frango ou patinho moído sem alho ou cebola.\n- Separe a proporção da dieta do seu pet prescrita pelo veterinário.\n- Adicione legumes adequados (abobrinha, chuchu, cenoura).\n- Na sua metade da panela, finalize com azeite de oliva extra virgem, alho, cebola, páprica e sal integral.',
      'Armazenamento Seguro:\nUse potes herméticos de vidro borossilicato para evitar contaminação por microplásticos. Congele as porções do dia 3 em diante, deixando na geladeira apenas as refeições que serão consumidas nas primeiras 48 horas.'
    ],
    comments: [
      {
        id: 'c-3',
        author: 'Marcela Duarte',
        petName: 'Thor (Bulldog Francês)',
        date: 'Há 3 dias',
        content: 'Depois que comecei a pesar as porções na balança digital de precisão e guardar em potes de vidro, a rotina ficou 10 vezes mais rápida!',
        likes: 12
      }
    ]
  },
  {
    id: 'art-3',
    title: 'O Guia da Hidratação: Por que você e seu gato estão bebendo pouca água (e como resolver)',
    slug: 'guia-hidratacao-gatos-e-humanos-saude-renal',
    excerpt: 'Problemas renais são silenciosos em tutores e felinos. Conheça estratégias comportamentais para dobrar a ingestão hídrica diária.',
    category: 'bem-estar-animal',
    author: {
      name: 'Dra. Camila Vasconcelos',
      role: 'Médica Veterinária Nutróloga',
      avatar: 'https://images.unsplash.com/photo-1594824813589-32a061456254?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '03 de Setembro de 2026',
    readTimeMinutes: 6,
    coverImage: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1200&q=80',
    tags: ['Hidratação', 'Gatos', 'Saúde Renal', 'Fontes de Cerâmica'],
    likes: 412,
    pawReactions: 365,
    usefulReactions: 310,
    content: [
      'Gatos são descendentes de felinos do deserto (Felis lybica), o que significa que evolutivamente eles possuem baixa sensação de sede voluntária e dependem da umidade das presas na natureza.',
      'Na vida moderna com ração seca (que possui cerca de 10% de umidade contra 75% da carne fresca), a incidência de Doença Renal Crônica (DRC) e cálculos urinários atinge números alarmantes.',
      'E os tutores? A maioria dos adultos não atinge os recomendados 35ml de água por quilo corporal por dia, gerando fadiga mental e sobrecarga renal.',
      '3 Soluções Práticas para a Casa:\n1. Adote fontes de água de cerâmica ou inox: A água corrente oxigenada atrai o instinto felino, enquanto recipientes plásticos soltam odores e causam acne felina.\n2. Caldo de ossos caseiro ou sachê com água morna: Adicione 2 colheres de água ao alimento úmido do seu bichano.\n3. Tenha sua garrafa térmica sempre por perto: Se a sua água estiver fresca à sua frente durante o trabalho, você beberá inconscientemente o dobro ao longo do dia.'
    ],
    comments: [
      {
        id: 'c-4',
        author: 'Roberto Alencar',
        petName: 'Luna & Simba (Gatinhos)',
        date: 'Há 5 dias',
        content: 'Troquei as vasilhas de plástico pela fonte de cerâmica e a Luna que quase não bebia água agora passa minutos se hidratando. Excelente artigo!',
        likes: 24
      }
    ]
  },
  {
    id: 'art-4',
    title: 'Alerta Vermelho: 8 Alimentos comuns na sua cozinha que são veneno para cães e gatos',
    slug: 'alimentos-toxicos-proibidos-para-pets',
    excerpt: 'Chocolate, cebola, alho, uvas e xilitol: saiba exatamente por que são perigosos e o que fazer em caso de ingestão acidental.',
    category: 'saude-integrada',
    author: {
      name: 'Dr. Fernando Siqueira',
      role: 'Médico Veterinário Toxicologista',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '28 de Agosto de 2026',
    readTimeMinutes: 8,
    coverImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    tags: ['Prevenção', 'Toxicologia', 'Cuidado', 'Segurança'],
    likes: 580,
    pawReactions: 490,
    usefulReactions: 620,
    content: [
      'Quando decidimos compartilhar mais do nosso estilo de vida saudável com os animais, precisamos de um discernimento rigoroso: o metabolismo canino e felino processa toxinas de maneira muito diferente do nosso fígado humano.',
      '1. Cebola e Alho (Família Allium):\nContêm compostos dissulfetos e tiossulfatos que oxidam a hemoglobina dos glóbulos vermelhos em cães e gatos, podendo causar anemia hemolítica severa (corpos de Heinz). Nunca use restos de refogados!',
      '2. Uvas e Uvas-Passas:\nPodem causar falência renal aguda súbita e irreversível em cães, mesmo em quantidades minúsculas (1 ou 2 bagas). A substância exata ainda é estudada (ácido tartárico), portanto zero tolerância.',
      '3. Chocolate e Café (Metilxantinas):\nA teobromina e cafeína estimulam excessivamente o sistema nervoso central e cardíaco, provocando taquicardia, tremores e convulsões.',
      '4. Xilitol (Adoçante de produtos fit):\nEnquanto em humanos o xilitol é inofensivo, em cães ele provoca uma liberação massiva de insulina pelo pâncreas em 30 minutos, levando a hipoglicemia letal e necrose hepática aguda.',
      'Em caso de acidente: Não force vômito sem orientação profissional. Contate imediatamente um hospital veterinário 24h levando a embalagem do produto ingerido.'
    ],
    comments: [
      {
        id: 'c-5',
        author: 'Patrícia Zanin',
        petName: 'Mel (SRD)',
        date: 'Há 1 semana',
        content: 'Eu não fazia ideia sobre a uva passa! Costumava cair do panetone ou saladas no fim do ano. Alerta importantíssimo para todos os donos.',
        likes: 41
      }
    ]
  },
  {
    id: 'art-5',
    title: 'A Conexão Intestino-Cérebro: Como a microbiota de tutores e pets reflete o humor da casa',
    slug: 'microbiota-saude-intestinal-tutor-e-pet',
    excerpt: 'Estudos recentes comprovam que famílias que convivem com animais têm microbiomas mais ricos e resilientes. Saiba como nutrir as bactérias do bem.',
    category: 'saude-integrada',
    author: {
      name: 'Renato Furtado',
      role: 'Nutricionista Clínico Funcional',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '20 de Agosto de 2026',
    readTimeMinutes: 6,
    coverImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    tags: ['Microbiota', 'Imunidade', 'Prebióticos', 'Bem-Estar'],
    likes: 198,
    pawReactions: 143,
    usefulReactions: 187,
    content: [
      'Cerca de 70% a 80% do sistema imunológico reside no trato gastrointestinal — tanto nos seres humanos quanto nos carnívoros domésticos.',
      'Pesquisas de universidades pioneiras apontam que crianças criadas em lares com cães e gatos apresentam menores taxas de asma e alergias alimentares na vida adulta, devido à rica diversidade de microorganismos transferida no convívio saudável.',
      'Como fortalecer a microbiota da casa:\n- Para você: Consuma fibras prebióticas (aveia, psyllium, maçãs) e alimentos fermentados (kombucha, kefir, iogurte natural integral).\n- Para seu pet: Forneça petiscos ricos em fibras funcionais, como purê de abóbora cozida, biomassa de banana verde em doses veterinárias ou iogurte natural 100% puro (sem lactose para gatos e em pequena quantidade para cães).'
    ],
    comments: [
      {
        id: 'c-6',
        author: 'Guilherme Castro',
        petName: 'Pipoca (Beagle)',
        date: 'Há 2 semanas',
        content: 'Artigo fascinante! Desde que comecei a cuidar da digestão do Pipoca com comidinhas mais naturais, até a disposição dele nos passeios melhorou.',
        likes: 15
      }
    ]
  }
];
