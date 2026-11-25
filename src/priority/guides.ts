export const priorityLevels = ["Muito alta", "Alta", "Média", "Baixa"] as const;
export type Priority = typeof priorityLevels[number];
export type PriorityTopic = { id: string; curriculumId?: string; priorityOverride?: Priority };
export type Basis = "sas" | "dossie" | "base" | "redacao" | "estetica";
export type TopicGuide = { level: Priority; basis: Basis; reason: string };

export const priorityGuides: Readonly<Record<string, TopicGuide>> = {
  "Matemática-1": {
    level: "Alta", basis: "base",
    reason: "As quatro operações sustentam cálculos de proporção, medidas e porcentagem. Se já calcula com segurança, concentre a sessão nos problemas."
  },
  "Matemática-2": {
    level: "Alta", basis: "base",
    reason: "Passar de fração a decimal permite comparar taxas, probabilidades e descontos na mesma escala."
  },
  "Matemática-3": {
    level: "Muito alta", basis: "sas",
    reason: "Proporcionalidade foi a categoria mais frequente em Matemática no SAS. Treine reconhecer se duas grandezas variam no mesmo sentido ou em sentidos opostos."
  },
  "Matemática-4": {
    level: "Muito alta", basis: "dossie",
    reason: "Porcentagem integra o bloco de matemática básica e também aparece em descontos, variações e juros. Comece por comparar dois preços."
  },
  "Matemática-5": {
    level: "Média", basis: "base",
    reason: "Dominar potências e raízes ajuda em escalas, áreas e juros compostos. Reserve as manipulações longas para outra sessão."
  },
  "Matemática-6": {
    level: "Alta", basis: "base",
    reason: "Transformar um enunciado em uma equação com uma incógnita prepara você para funções, tarifas e problemas de consumo."
  },
  "Matemática-7": {
    level: "Média", basis: "base",
    reason: "A relação entre raízes e gráfico ajuda em funções quadráticas. Aprofunde sistemas e inequações depois que essa relação estiver clara."
  },
  "Matemática-8": {
    level: "Muito alta", basis: "dossie",
    reason: "Funções estão entre os cinco blocos mais recorrentes. Treine passar do texto para o gráfico e interpretar o crescimento de uma tarifa."
  },
  "Matemática-9": {
    level: "Muito alta", basis: "sas",
    reason: "Geometria plana está entre os destaques da série histórica. Priorize áreas, perímetros e semelhança em plantas e figuras."
  },
  "Matemática-10": {
    level: "Muito alta", basis: "dossie",
    reason: "Geometria espacial correspondeu a 11,2% das questões de Matemática no Dossiê. Compare volume e capacidade em embalagens e reservatórios."
  },
  "Matemática-11": {
    level: "Média", basis: "dossie",
    reason: "Trigonometria respondeu por 3,7% das questões de Matemática no Dossiê. Comece pelas razões em triângulos e deixe identidades para aprofundamento."
  },
  "Matemática-12": {
    level: "Alta", basis: "base",
    reason: "Juros e progressões usam porcentagens e padrões de crescimento. Em uma sessão curta, compare crescimento constante e juros sobre juros."
  },
  "Matemática-13": {
    level: "Alta", basis: "sas",
    reason: "Probabilidade e contagem aparecem entre os destaques do SAS. Treine primeiro definir os resultados possíveis de um evento."
  },
  "Matemática-14": {
    level: "Muito alta", basis: "sas",
    reason: "Estatística foi o segundo assunto mais frequente em Matemática no SAS. Leia a escala de um gráfico e escolha a medida que representa os dados."
  },
  "Física-1": {
    level: "Alta", basis: "base",
    reason: "Converter unidades e interpretar escalas é necessário para calcular velocidade, potência e consumo sem perder pontos por unidade."
  },
  "Física-2": {
    level: "Alta", basis: "base",
    reason: "Distinguir distância, deslocamento e intervalo de tempo prepara a leitura dos gráficos dos movimentos."
  },
  "Física-3": {
    level: "Média", basis: "base",
    reason: "O movimento uniforme é um modelo simples dentro de cinemática. Use uma questão curta para ligar a inclinação do gráfico à velocidade."
  },
  "Física-4": {
    level: "Alta", basis: "dossie",
    reason: "Cinemática aparece entre os principais blocos do Dossiê. Aqui o foco é associar aceleração à variação de velocidade e interpretar frenagens."
  },
  "Física-5": {
    level: "Média", basis: "sas",
    reason: "Lançamentos aparecem no levantamento do SAS, abaixo de circuitos e calorimetria. Para revisar, compare velocidade e aceleração no ponto mais alto."
  },
  "Física-6": {
    level: "Alta", basis: "sas",
    reason: "Força e movimento figuram entre os destaques. Treine identificar as forças em um corpo antes de calcular a resultante."
  },
  "Física-7": {
    level: "Alta", basis: "sas",
    reason: "Trabalho e energia aparecem no levantamento e permitem resolver problemas de máquinas e transportes. Identifique primeiro a transformação de energia."
  },
  "Física-8": {
    level: "Média", basis: "base",
    reason: "Impulso e conservação do momento resolvem situações específicas de colisão. Revise depois de dominar forças e movimento."
  },
  "Física-9": {
    level: "Média", basis: "dossie",
    reason: "Fluidos e estática aparecem abaixo de termologia e eletrodinâmica no Dossiê. Comece com pressão e equilíbrio em situações do cotidiano."
  },
  "Física-10": {
    level: "Muito alta", basis: "dossie",
    reason: "Ondulatória representa 13,7% das questões de Física no Dossiê. Priorize período, frequência e aplicações do som e da luz."
  },
  "Física-11": {
    level: "Muito alta", basis: "sas",
    reason: "Calorimetria lidera o levantamento de Física do SAS e termodinâmica também se destaca. Interprete trocas de calor ou o ciclo de uma máquina."
  },
  "Física-12": {
    level: "Alta", basis: "dossie",
    reason: "O tópico reúne corrente e eletrostática. Priorize corrente, tensão e potência para avançar em eletrodinâmica e depois retome campo e potencial."
  },
  "Física-13": {
    level: "Alta", basis: "base",
    reason: "As leis de Ohm são a base para calcular corrente, interpretar resistores e resolver boa parte dos exercícios de circuitos."
  },
  "Física-14": {
    level: "Muito alta", basis: "sas",
    reason: "Circuitos estão entre os assuntos mais frequentes de Física no SAS. Treine associações e o consumo de aparelhos em kWh."
  },
  "Química-1": {
    level: "Alta", basis: "base",
    reason: "Reconhecer fases, propriedades e transformações prepara a leitura de misturas e de curvas de aquecimento."
  },
  "Química-2": {
    level: "Muito alta", basis: "dossie",
    reason: "Separação de misturas representou 6,6% das questões de Química no Dossiê. Relacione cada método à propriedade que permite separar."
  },
  "Química-3": {
    level: "Alta", basis: "dossie",
    reason: "Átomos aparecem no levantamento recente e o tema prepara ligações e tabela periódica. Priorize as relações entre prótons, elétrons e carga."
  },
  "Química-4": {
    level: "Média", basis: "base",
    reason: "Família, período e tendências ajudam a prever propriedades. Deixe a memorização de posições isoladas para depois."
  },
  "Química-5": {
    level: "Alta", basis: "dossie",
    reason: "Estrutura e propriedades das substâncias têm destaque no Dossiê. Compare ligação e condutividade em materiais do cotidiano."
  },
  "Química-6": {
    level: "Alta", basis: "dossie",
    reason: "Funções inorgânicas aparecem entre os blocos de maior incidência no Dossiê. Treine identificar ácidos, bases, sais e óxidos em contexto."
  },
  "Química-7": {
    level: "Alta", basis: "sas",
    reason: "Reações químicas figuram entre os destaques do SAS. O balanceamento também é necessário aos cálculos de estequiometria."
  },
  "Química-8": {
    level: "Muito alta", basis: "dossie",
    reason: "Estequiometria correspondeu a 7,9% das questões de Química no Dossiê. Treine ler coeficientes antes de converter mol em massa."
  },
  "Química-9": {
    level: "Alta", basis: "sas",
    reason: "Concentração está entre os assuntos destacados pelo SAS. Priorize leitura de unidades e diluição em soluções do cotidiano."
  },
  "Química-10": {
    level: "Muito alta", basis: "sas",
    reason: "Aplicações de cinética estão entre os três principais assuntos de Química no SAS. Comece pelos fatores de velocidade e depois compare entalpias."
  },
  "Química-11": {
    level: "Média", basis: "dossie",
    reason: "Equilíbrio teve incidência intermediária no Dossiê. Pratique prever deslocamentos e interpretar pH antes de aprofundar cálculos."
  },
  "Química-12": {
    level: "Muito alta", basis: "sas",
    reason: "Pilhas estão entre os assuntos destacados e a eletroquímica também envolve operações industriais. Comece identificando quem perde elétrons."
  },
  "Química-13": {
    level: "Muito alta", basis: "sas",
    reason: "Funções e reações orgânicas lideram a classificação do SAS em Química. Treine reconhecer grupos funcionais em moléculas conhecidas."
  },
  "Biologia-1": {
    level: "Média", basis: "base",
    reason: "Distinguir célula, organismo, população e comunidade prepara citologia e ecologia. Use uma revisão curta de conceitos."
  },
  "Biologia-2": {
    level: "Alta", basis: "sas",
    reason: "Bioquímica aparece entre os destaques do SAS. Relacione água, sais e moléculas orgânicas às funções que exercem."
  },
  "Biologia-3": {
    level: "Alta", basis: "sas",
    reason: "Biologia celular é recorrente e sustenta fisiologia e genética. Priorize membrana, transporte e função das organelas."
  },
  "Biologia-4": {
    level: "Média", basis: "base",
    reason: "Mitose e meiose sustentam genética, reprodução e variação. Compare o resultado das duas divisões em um esquema."
  },
  "Biologia-5": {
    level: "Alta", basis: "base",
    reason: "Cruzamentos e heredogramas treinam probabilidades e interpretação de evidências de herança. Comece identificando o padrão do heredograma."
  },
  "Biologia-6": {
    level: "Alta", basis: "dossie",
    reason: "Evolução é um dos blocos recorrentes no Dossiê. Identifique nos exemplos a variação herdável e a seleção natural."
  },
  "Biologia-7": {
    level: "Alta", basis: "dossie",
    reason: "Fisiologia humana aparece entre os três blocos mais frequentes de Biologia no Dossiê. Observe como dois sistemas atuam juntos."
  },
  "Biologia-8": {
    level: "Alta", basis: "dossie",
    reason: "Zoologia e botânica aparecem entre os grupos mais frequentes no Dossiê. Priorize relação entre estrutura, função e ambiente."
  },
  "Biologia-9": {
    level: "Muito alta", basis: "sas",
    reason: "Os desequilíbrios nos ecossistemas lideram Biologia no SAS. Cadeias alimentares e ciclos ajudam a explicar o efeito de uma mudança ambiental."
  },
  "Biologia-10": {
    level: "Média", basis: "dossie",
    reason: "Biotecnologia aparece com 4,7% no recorte do Dossiê. Priorize interpretar uma aplicação e o que seus resultados permitem concluir."
  },
  "Biologia-11": {
    level: "Muito alta", basis: "sas",
    reason: "O levantamento destaca saúde e doenças infecciosas. Treine leitura de situações de prevenção, imunização e saneamento."
  },
  "Português-1": {
    level: "Muito alta", basis: "sas",
    reason: "A leitura e a construção de sentido concentram a maior parte dos destaques em Português. Identifique a intenção do autor e a evidência no texto."
  },
  "Português-2": {
    level: "Muito alta", basis: "dossie",
    reason: "Os gêneros textuais lideram o levantamento recente de Português. Compare como público, suporte e finalidade mudam a linguagem."
  },
  "Português-3": {
    level: "Baixa", basis: "base",
    reason: "Para a prova objetiva, priorize a compreensão do texto. Use grafia e acentuação para revisar dúvidas pontuais e aprimorar a escrita da redação."
  },
  "Português-4": {
    level: "Média", basis: "base",
    reason: "O emprego da palavra ajuda a interpretar sentidos. Em pouco tempo, identifique o efeito de um pronome ou adjetivo em uma frase."
  },
  "Português-5": {
    level: "Média", basis: "base",
    reason: "Reconhecer quem pratica a ação e quem a recebe pode mudar a interpretação. Faça a classificação completa quando precisar reforçar a base."
  },
  "Português-6": {
    level: "Média", basis: "base",
    reason: "Orações treinam relações de causa, concessão e condição. Priorize o efeito no texto antes da nomenclatura."
  },
  "Português-7": {
    level: "Média", basis: "base",
    reason: "Concordância e regência ajudam na revisão da escrita e na leitura de ambiguidades. Reforce as construções em que costuma errar."
  },
  "Português-8": {
    level: "Alta", basis: "base",
    reason: "Pontuação e retomadas mudam o sentido do texto e dão continuidade aos argumentos da redação. Revise um trecho e compare duas leituras."
  },
  "Português-9": {
    level: "Alta", basis: "sas",
    reason: "Construir sentido é uma das habilidades mais frequentes em Português. Treine o efeito de ironia, metáfora e ambiguidade nos textos."
  },
  "Português-10": {
    level: "Alta", basis: "dossie",
    reason: "O contraste entre registros de linguagem aparece entre os principais assuntos do Dossiê. Identifique a situação social de uso."
  },
  "Português-11": {
    level: "Alta", basis: "sas",
    reason: "Treine a leitura do trecho literário e a relação com o contexto. Esse enfoque também exercita a competência leitora destacada pelo SAS."
  },
  "História-1": {
    level: "Média", basis: "sas",
    reason: "O SAS registrou 13 questões sobre a Antiguidade clássica, frente a 46 sobre o Brasil colonial. Priorize cidadania, escravidão e leitura de fontes."
  },
  "História-2": {
    level: "Alta", basis: "dossie",
    reason: "A Idade Média representou 10,3% das questões de História no Dossiê. Priorize relações de trabalho, poder e Igreja."
  },
  "História-3": {
    level: "Média", basis: "base",
    reason: "Humanismo e reformas ajudam a entender rupturas na Idade Moderna. Concentre a sessão na mudança de ideias e poder antes de decorar nomes."
  },
  "História-4": {
    level: "Alta", basis: "base",
    reason: "Expansão e colonização dão contexto ao Brasil Colônia. Compare uma fonte europeia e uma perspectiva indígena sobre a conquista."
  },
  "História-5": {
    level: "Muito alta", basis: "sas",
    reason: "Brasil Colônia lidera História no SAS, com 46 questões. Comece por economia colonial, escravização e formas de resistência."
  },
  "História-6": {
    level: "Alta", basis: "sas",
    reason: "A Revolução Industrial é um destaque do SAS. Relacione mudanças no trabalho a reivindicações de direitos e revoluções políticas."
  },
  "História-7": {
    level: "Muito alta", basis: "sas",
    reason: "Primeira República, Era Vargas e Segundo Reinado estão entre os principais recortes do SAS. Em pouco tempo, escolha um deles e analise uma fonte."
  },
  "História-8": {
    level: "Média", basis: "dossie",
    reason: "Conflitos do século XX aparecem com 5,1% no Dossiê. Comece pelas relações entre imperialismo, regimes políticos e disputas globais."
  },
  "História-9": {
    level: "Alta", basis: "sas",
    reason: "A ditadura brasileira aparece em 21 questões no SAS. Treine cruzar fontes sobre repressão, resistência e recuperação de direitos."
  },
  "História-10": {
    level: "Alta", basis: "dossie",
    reason: "O tempo presente está entre os grandes recortes do Dossiê. Use um texto para identificar mudanças, permanências e disputas por direitos."
  },
  "Geografia-1": {
    level: "Alta", basis: "sas",
    reason: "A interpretação de mapas aparece em 18 questões no SAS e é usada em outros temas. Priorize escala e legenda antes de memorizar projeções."
  },
  "Geografia-2": {
    level: "Média", basis: "sas",
    reason: "O SAS registra 19 questões sobre formas de relevo e 14 sobre geologia. Priorize agentes e impactos no território e deixe a nomenclatura de camadas para revisão."
  },
  "Geografia-3": {
    level: "Média", basis: "dossie",
    reason: "Clima correspondeu a 4,7% das questões de Geografia no Dossiê. Treine relacionar um climograma à vegetação e ao uso do solo."
  },
  "Geografia-4": {
    level: "Média", basis: "base",
    reason: "Recursos hídricos se conectam a clima, campo e impactos ambientais. Em uma sessão curta, interprete o uso da água em uma bacia."
  },
  "Geografia-5": {
    level: "Muito alta", basis: "sas",
    reason: "Urbanização lidera o levantamento de Geografia do SAS, com 34 questões. Relacione expansão urbana, migrações e desigualdade no espaço."
  },
  "Geografia-6": {
    level: "Muito alta", basis: "dossie",
    reason: "O espaço agrário ocupa o primeiro lugar no Dossiê, com 12,4% das questões de Geografia. Comece por terra, trabalho e produção."
  },
  "Geografia-7": {
    level: "Muito alta", basis: "dossie",
    reason: "Geopolítica representa 11,2% das questões de Geografia no Dossiê. Priorize as relações entre poder, território e recursos."
  },
  "Geografia-8": {
    level: "Alta", basis: "base",
    reason: "As redes ajudam a explicar comércio, cadeias de produção e geopolítica. Siga o trajeto de um produto para identificar dependências entre territórios."
  },
  "Geografia-9": {
    level: "Alta", basis: "dossie",
    reason: "No Dossiê, 4,1% têm o ambiente como assunto principal. A aplicação em clima, uso da água e agropecuária também justifica a prioridade."
  },
  "Geografia-10": {
    level: "Alta", basis: "sas",
    reason: "Desenvolvimento econômico está entre os destaques do SAS. Compare mapas e indicadores regionais, observando onde a desigualdade aparece."
  },
  "Redação-1": {
    level: "Muito alta", basis: "redacao",
    reason: "A prova pede um texto dissertativo-argumentativo. Reconhecer a função de cada parágrafo é a base para começar a escrever."
  },
  "Redação-2": {
    level: "Muito alta", basis: "redacao",
    reason: "Definir o recorte do tema e a tese orienta a argumentação e atende às competências II e III. Esboce uma tese e dois argumentos."
  },
  "Redação-3": {
    level: "Alta", basis: "redacao",
    reason: "Uma introdução curta precisa apresentar o tema e a posição defendida. Confira se o restante do texto cumpre o que ela anuncia."
  },
  "Redação-4": {
    level: "Muito alta", basis: "redacao",
    reason: "A competência III avalia a construção da argumentação. Escreva um parágrafo em que o exemplo apoie uma ideia explícita."
  },
  "Redação-5": {
    level: "Alta", basis: "redacao",
    reason: "Repertório ganha valor quando ajuda a defender a tese. Escolha uma referência e explique a conexão com o problema."
  },
  "Redação-6": {
    level: "Alta", basis: "redacao",
    reason: "A competência IV considera a articulação entre as ideias. Em uma sessão curta, reescreva a transição entre dois parágrafos."
  },
  "Redação-7": {
    level: "Muito alta", basis: "redacao",
    reason: "A proposta de intervenção recebe avaliação específica na competência V. Confira quem fará o quê, como e com qual efeito."
  },
  "Redação-8": {
    level: "Alta", basis: "redacao",
    reason: "Conhecer as cinco competências ajuda a escolher a próxima revisão. Pegue um parágrafo seu e localize uma evidência de cada critério aplicável."
  },
  "Redação-9": {
    level: "Muito alta", basis: "redacao",
    reason: "Escrever e rever o texto integra as cinco competências. Em um dia curto, revise um argumento da última redação e reserve a produção completa para outro bloco."
  },
  "Filosofia-1": {
    level: "Muito alta", basis: "sas",
    reason: "Filosofia política lidera o levantamento da disciplina no SAS, com 24 questões em 188. Priorize democracia, legitimidade e contrato social."
  },
  "Filosofia-2": {
    level: "Muito alta", basis: "sas",
    reason: "Ética e moral aparecem em segundo lugar no SAS, com 15 questões em 188. Compare os critérios usados para justificar a mesma escolha."
  },
  "Filosofia-3": {
    level: "Muito alta", basis: "dossie",
    reason: "A filosofia antiga representa 28,1% das questões de Filosofia no Dossiê. Compare os argumentos de Sócrates, Platão e Aristóteles."
  },
  "Filosofia-4": {
    level: "Alta", basis: "sas",
    reason: "Descartes e epistemologia aparecem nos destaques do SAS. Compare que papel a razão e a experiência têm em cada argumento."
  },
  "Filosofia-5": {
    level: "Média", basis: "dossie",
    reason: "A filosofia medieval representa 4,7% das questões de Filosofia no Dossiê. Foque a relação entre fé e razão em um texto."
  },
  "Filosofia-6": {
    level: "Média", basis: "dossie",
    reason: "Teoria crítica aparece agrupada com psicanálise no Dossiê. Treine a diferença entre autonomia e consumo na crítica à indústria cultural."
  },
  "Filosofia-7": {
    level: "Baixa", basis: "estetica",
    reason: "Um estudo das provas de 1998 a 2018 encontrou pouca presença direta de estética em Ciências Humanas. Reserve uma revisão sobre o juízo de gosto depois de ética e política."
  },
};
