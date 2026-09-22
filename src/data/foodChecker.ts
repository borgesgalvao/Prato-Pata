import { FoodCheckItem } from '../types';

export const FOOD_CHECK_DATABASE: FoodCheckItem[] = [
  {
    id: 'food-1',
    name: 'Cenoura',
    category: 'vegetais',
    safeForDogs: 'seguro',
    safeForCats: 'seguro',
    humanBenefits: 'Rica em betacaroteno, vitamina A e fibras; protege a visão e a saúde da pele.',
    petNotes: 'Excelente para cães: crua atua como escova de dentes natural; cozida no vapor é de fácil digestão para cães e gatos.',
    preparationTip: 'Lave bem, corte em rodelas ou palitos seguros para evitar engasgo e sirva sem sal ou tempero.'
  },
  {
    id: 'food-2',
    name: 'Abóbora (Cabotiá ou Moranga)',
    category: 'vegetais',
    safeForDogs: 'seguro',
    safeForCats: 'seguro',
    humanBenefits: 'Baixas calorias, rica em potássio, auxilia no controle glicêmico e saciedade.',
    petNotes: 'Curinga digestivo: ajuda tanto em diarreia quanto em constipação devido às fibras solúveis.',
    preparationTip: 'Sempre cozinhe no vapor ou asse sem casca, sem sementes e sem temperos (apenas o purê puro).'
  },
  {
    id: 'food-3',
    name: 'Maçã',
    category: 'frutas',
    safeForDogs: 'seguro',
    safeForCats: 'seguro',
    humanBenefits: 'Fonte de quercetina, vitamina C e pectina que protege a saúde cardiovascular.',
    petNotes: 'Fruta crocante e adocicada muito amada. ATENÇÃO: Nunca ofereça o miolo com as sementes (contêm traços de cianeto).',
    preparationTip: 'Retire totalmente as sementes e o caule; corte em cubos pequenos ou fatias finas.'
  },
  {
    id: 'food-4',
    name: 'Chocolate & Cacau',
    category: 'temperos-ervas',
    safeForDogs: 'proibido',
    safeForCats: 'proibido',
    humanBenefits: 'Rico em flavonoides e antioxidantes no caso do chocolate amargo (>70%).',
    petNotes: 'EXTREMAMENTE TÓXICO: Contém teobromina e cafeína. Causa taquicardia, tremores, convulsões e risco de óbito.',
    preparationTip: 'NUNCA dê ao animal. Em caso de ingestão acidental, procure atendimento veterinário com urgência imediata.'
  },
  {
    id: 'food-5',
    name: 'Uva & Uva-Passa',
    category: 'frutas',
    safeForDogs: 'proibido',
    safeForCats: 'proibido',
    humanBenefits: 'Rica em resveratrol e potássio, ótima para a circulação humana.',
    petNotes: 'ALTAMENTE TÓXICA: Pode induzir insuficiência renal aguda severa em cães com ingestão de poucas unidades.',
    preparationTip: 'Mantenha fora do alcance de cães e gatos. Não use nem mesmo em receitas caseiras compartilhadas.'
  },
  {
    id: 'food-6',
    name: 'Banana',
    category: 'frutas',
    safeForDogs: 'com-moderacao',
    safeForCats: 'com-moderacao',
    humanBenefits: 'Rica em potássio, vitamina B6 e triptofano, combate cãibras e melhora o humor.',
    petNotes: 'Petisco seguro e energético, mas com alto teor de frutose e carboidratos. Ofereça em pequenas porções.',
    preparationTip: 'Descasque e corte em rodelas. Pode ser congelada em dias quentes ou amassada com aveia.'
  },
  {
    id: 'food-7',
    name: 'Alho e Cebola',
    category: 'temperos-ervas',
    safeForDogs: 'proibido',
    safeForCats: 'proibido',
    humanBenefits: 'Potentes antimicrobianos e cardioprotetores na alimentação humana.',
    petNotes: 'TÓXICOS: Destroem os glóbulos vermelhos do sangue (anemia hemolítica com corpos de Heinz). Gatos são ainda mais sensíveis.',
    preparationTip: 'Separe a carne ou legumes do seu pet antes de refogar com alho, cebola ou cebolinha.'
  },
  {
    id: 'food-8',
    name: 'Ovo Cozido',
    category: 'carnes-proteinas',
    safeForDogs: 'seguro',
    safeForCats: 'seguro',
    humanBenefits: 'Proteína padrão-ouro de alto valor biológico, colina e luteína.',
    petNotes: 'Excelente para cães e gatos: fortalece músculos e pelagem. Sempre sirva bem cozido para evitar salmonela e avidina crua.',
    preparationTip: 'Cozinhe bem em água sem sal ou óleo. Pique em pedacinhos e misture à refeição.'
  },
  {
    id: 'food-9',
    name: 'Mirtilo (Blueberry)',
    category: 'frutas',
    safeForDogs: 'seguro',
    safeForCats: 'seguro',
    humanBenefits: 'Campeão em antioxidantes antocianinas, cuida da memória e protege os vasos sanguíneos.',
    petNotes: 'Superalimento para animais idosos, auxiliando no combate ao envelhecimento celular cerebral.',
    preparationTip: 'Lave bem e sirva inteiro ou levemente amassado como recompensa no adestramento.'
  },
  {
    id: 'food-10',
    name: 'Abacate',
    category: 'frutas',
    safeForDogs: 'proibido',
    safeForCats: 'proibido',
    humanBenefits: 'Gorduras monoinsaturadas excelentes para o coração e absorção de vitaminas.',
    petNotes: 'A casca, o caroço e as folhas contêm persina, substância que causa vômitos, diarreia e congestão em pets.',
    preparationTip: 'Evite oferecer aos animais domésticos para segurança total contra a toxicidade da persina.'
  },
  {
    id: 'food-11',
    name: 'Batata-Doce',
    category: 'vegetais',
    safeForDogs: 'seguro',
    safeForCats: 'seguro',
    humanBenefits: 'Carboidrato de baixo índice glicêmico, rica em fibras e vitamina A.',
    petNotes: 'Muito benéfica para a digestão canina, fornecendo energia sustentável. NUNCA ofereça crua.',
    preparationTip: 'Cozinhe bem em água ou no vapor até ficar bem macia. Sirva sem casca em cubos pequenos.'
  },
  {
    id: 'food-12',
    name: 'Peito de Frango Desfiado',
    category: 'carnes-proteinas',
    safeForDogs: 'seguro',
    safeForCats: 'seguro',
    humanBenefits: 'Proteína magra indispensável para manutenção da massa muscular e saciedade.',
    petNotes: 'Uma das melhores proteínas para cães e gatos em recuperação gástrica ou como recompensa de alto valor.',
    preparationTip: 'Cozinhe apenas em água filtrada. Desfie e NUNCA ofereça ossos de frango cozidos (eles lascam e perfuram o estômago).'
  }
];
