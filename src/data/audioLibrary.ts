export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  description: string;
  duration: string;
  category: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  thumbnail: string;
  tags: string[];
  mood: 'relaxing' | 'energizing' | 'focused' | 'peaceful' | 'inspiring';
}

export const audioLibrary: AudioTrack[] = [
  // Categoria: Todos
  {
    id: 'todos-1',
    title: 'Meditação Matinal Completa',
    artist: 'Mindful Sounds',
    description: 'Uma jornada completa de meditação para começar o dia com clareza mental e energia positiva.',
    duration: '15:30',
    category: 'Todos',
    youtubeUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM',
    spotifyUrl: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    tags: ['meditação', 'manhã', 'energia'],
    mood: 'energizing'
  },
  {
    id: 'todos-2',
    title: 'Sons da Natureza - Floresta Tropical',
    artist: 'Nature Sounds',
    description: 'Imersão completa nos sons relaxantes de uma floresta tropical para reduzir o estresse.',
    duration: '45:00',
    category: 'Todos',
    youtubeUrl: 'https://www.youtube.com/watch?v=eKFTSSKCzWA',
    spotifyUrl: 'https://open.spotify.com/track/1A2tKUQC4uLU6hMCjMI75M',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop',
    tags: ['natureza', 'relaxamento', 'floresta'],
    mood: 'peaceful'
  },
  {
    id: 'todos-3',
    title: 'Respiração Consciente Guiada',
    artist: 'Wellness Guide',
    description: 'Técnicas de respiração consciente para equilibrar corpo e mente em qualquer momento do dia.',
    duration: '12:45',
    category: 'Todos',
    youtubeUrl: 'https://www.youtube.com/watch?v=YRPh_GaiL8s',
    spotifyUrl: 'https://open.spotify.com/track/2tKUQC4uLU6hMCjMI75M1A',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop',
    tags: ['respiração', 'mindfulness', 'equilíbrio'],
    mood: 'peaceful'
  },
  {
    id: 'todos-4',
    title: 'Música Instrumental Motivacional',
    artist: 'Inspire Music',
    description: 'Composições instrumentais inspiradoras para elevar seu estado de espírito e motivação.',
    duration: '25:20',
    category: 'Todos',
    youtubeUrl: 'https://www.youtube.com/watch?v=1ZYbU82GVz4',
    spotifyUrl: 'https://open.spotify.com/track/3KUQCuLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    tags: ['instrumental', 'motivação', 'inspiração'],
    mood: 'inspiring'
  },
  {
    id: 'todos-5',
    title: 'Relaxamento Progressivo Total',
    artist: 'Deep Relax',
    description: 'Técnica completa de relaxamento progressivo para liberar tensões de todo o corpo.',
    duration: '30:15',
    category: 'Todos',
    youtubeUrl: 'https://www.youtube.com/watch?v=86HUcX8ZtAk',
    spotifyUrl: 'https://open.spotify.com/track/4KUQC4uLU6hMCjMI75M1A2',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    tags: ['relaxamento', 'tensão', 'corpo'],
    mood: 'relaxing'
  },

  // Categoria: Prosperidade
  {
    id: 'prosperidade-1',
    title: 'Afirmações de Abundância',
    artist: 'Prosperity Mind',
    description: 'Afirmações poderosas para reprogramar sua mente para a abundância e prosperidade financeira.',
    duration: '20:30',
    category: 'Prosperidade',
    youtubeUrl: 'https://www.youtube.com/watch?v=qmKtyeQ9Ikk',
    spotifyUrl: 'https://open.spotify.com/track/5LUQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&h=300&fit=crop',
    tags: ['afirmações', 'abundância', 'dinheiro'],
    mood: 'inspiring'
  },
  {
    id: 'prosperidade-2',
    title: 'Meditação para Sucesso Financeiro',
    artist: 'Money Mindset',
    description: 'Meditação focada em desenvolver uma mentalidade próspera e atrair oportunidades financeiras.',
    duration: '18:45',
    category: 'Prosperidade',
    youtubeUrl: 'https://www.youtube.com/watch?v=T0VXxTOGoWU',
    spotifyUrl: 'https://open.spotify.com/track/6MUQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300&h=300&fit=crop',
    tags: ['meditação', 'sucesso', 'finanças'],
    mood: 'focused'
  },
  {
    id: 'prosperidade-3',
    title: 'Visualização de Metas Financeiras',
    artist: 'Goal Achiever',
    description: 'Técnica de visualização para manifestar suas metas financeiras e criar um plano de ação.',
    duration: '22:10',
    category: 'Prosperidade',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZXsQAXx_ao0',
    spotifyUrl: 'https://open.spotify.com/track/7NUQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=300&fit=crop',
    tags: ['visualização', 'metas', 'manifestação'],
    mood: 'focused'
  },
  {
    id: 'prosperidade-4',
    title: 'Sons de Frequência da Prosperidade',
    artist: 'Frequency Healing',
    description: 'Frequências sonoras específicas para alinhar sua energia com a vibração da prosperidade.',
    duration: '35:00',
    category: 'Prosperidade',
    youtubeUrl: 'https://www.youtube.com/watch?v=GqSXvMbfCHw',
    spotifyUrl: 'https://open.spotify.com/track/8OUQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop',
    tags: ['frequência', 'energia', 'vibração'],
    mood: 'energizing'
  },
  {
    id: 'prosperidade-5',
    title: 'Hipnose para Mentalidade Rica',
    artist: 'Wealth Hypnosis',
    description: 'Sessão de hipnose para remover bloqueios mentais sobre dinheiro e desenvolver mentalidade rica.',
    duration: '40:20',
    category: 'Prosperidade',
    youtubeUrl: 'https://www.youtube.com/watch?v=Yj6V_a6fkXI',
    spotifyUrl: 'https://open.spotify.com/track/9PUQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    tags: ['hipnose', 'mentalidade', 'bloqueios'],
    mood: 'relaxing'
  },

  // Categoria: Foco
  {
    id: 'foco-1',
    title: 'Música Binaural para Concentração',
    artist: 'Focus Beats',
    description: 'Batidas binaurais cientificamente projetadas para aumentar o foco e a concentração mental.',
    duration: '60:00',
    category: 'Foco',
    youtubeUrl: 'https://www.youtube.com/watch?v=WPni755-Krg',
    spotifyUrl: 'https://open.spotify.com/track/0AQVQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    tags: ['binaural', 'concentração', 'estudo'],
    mood: 'focused'
  },
  {
    id: 'foco-2',
    title: 'Técnica Pomodoro com Sons Ambientes',
    artist: 'Productivity Pro',
    description: 'Sessões de 25 minutos com sons ambientes para maximizar produtividade usando a técnica Pomodoro.',
    duration: '25:00',
    category: 'Foco',
    youtubeUrl: 'https://www.youtube.com/watch?v=mNBmG24djoY',
    spotifyUrl: 'https://open.spotify.com/track/1BRVQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=300&fit=crop',
    tags: ['pomodoro', 'produtividade', 'trabalho'],
    mood: 'focused'
  },
  {
    id: 'foco-3',
    title: 'Meditação para Clareza Mental',
    artist: 'Clear Mind',
    description: 'Meditação específica para limpar a mente de distrações e desenvolver foco laser.',
    duration: '15:30',
    category: 'Foco',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
    spotifyUrl: 'https://open.spotify.com/track/2CSVQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300&h=300&fit=crop',
    tags: ['meditação', 'clareza', 'distrações'],
    mood: 'peaceful'
  },
  {
    id: 'foco-4',
    title: 'Sons de Chuva para Estudo',
    artist: 'Study Sounds',
    description: 'Sons suaves de chuva para criar o ambiente perfeito de concentração para estudos.',
    duration: '90:00',
    category: 'Foco',
    youtubeUrl: 'https://www.youtube.com/watch?v=mPZkdNFkNps',
    spotifyUrl: 'https://open.spotify.com/track/3DTVQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=300&h=300&fit=crop',
    tags: ['chuva', 'estudo', 'ambiente'],
    mood: 'peaceful'
  },
  {
    id: 'foco-5',
    title: 'Respiração 4-7-8 para Foco',
    artist: 'Breath Master',
    description: 'Técnica de respiração 4-7-8 para acalmar a mente e aumentar a capacidade de concentração.',
    duration: '10:15',
    category: 'Foco',
    youtubeUrl: 'https://www.youtube.com/watch?v=YRPh_GaiL8s',
    spotifyUrl: 'https://open.spotify.com/track/4EUVQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    tags: ['respiração', 'técnica', 'calma'],
    mood: 'peaceful'
  },

  // Categoria: Confiança
  {
    id: 'confianca-1',
    title: 'Afirmações de Autoconfiança',
    artist: 'Confidence Builder',
    description: 'Afirmações poderosas para construir uma autoconfiança inabalável e acreditar no seu potencial.',
    duration: '16:45',
    category: 'Confiança',
    youtubeUrl: 'https://www.youtube.com/watch?v=f-wWBGo6a2w',
    spotifyUrl: 'https://open.spotify.com/track/5FWVQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop',
    tags: ['afirmações', 'autoconfiança', 'potencial'],
    mood: 'inspiring'
  },
  {
    id: 'confianca-2',
    title: 'Meditação do Guerreiro Interior',
    artist: 'Inner Warrior',
    description: 'Desperte o guerreiro que existe dentro de você e desenvolva coragem para enfrentar qualquer desafio.',
    duration: '22:30',
    category: 'Confiança',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZXsQAXx_ao0',
    spotifyUrl: 'https://open.spotify.com/track/6GXVQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    tags: ['guerreiro', 'coragem', 'desafios'],
    mood: 'energizing'
  },
  {
    id: 'confianca-3',
    title: 'Visualização de Sucesso Pessoal',
    artist: 'Success Vision',
    description: 'Visualize-se alcançando seus objetivos e construa a confiança necessária para realizá-los.',
    duration: '19:20',
    category: 'Confiança',
    youtubeUrl: 'https://www.youtube.com/watch?v=1ZYbU82GVz4',
    spotifyUrl: 'https://open.spotify.com/track/7HYVQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    tags: ['visualização', 'sucesso', 'objetivos'],
    mood: 'inspiring'
  },
  {
    id: 'confianca-4',
    title: 'Hipnose para Superar Medos',
    artist: 'Fear Release',
    description: 'Sessão de hipnose para liberar medos limitantes e desenvolver uma confiança natural.',
    duration: '35:15',
    category: 'Confiança',
    youtubeUrl: 'https://www.youtube.com/watch?v=86HUcX8ZtAk',
    spotifyUrl: 'https://open.spotify.com/track/8IZVQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop',
    tags: ['hipnose', 'medos', 'liberação'],
    mood: 'relaxing'
  },
  {
    id: 'confianca-5',
    title: 'Música Motivacional Épica',
    artist: 'Epic Motivation',
    description: 'Trilha sonora épica para despertar seu poder interior e enfrentar o mundo com confiança.',
    duration: '28:40',
    category: 'Confiança',
    youtubeUrl: 'https://www.youtube.com/watch?v=qmKtyeQ9Ikk',
    spotifyUrl: 'https://open.spotify.com/track/9JAVQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    tags: ['épica', 'motivação', 'poder'],
    mood: 'energizing'
  },

  // Categoria: Sono
  {
    id: 'sono-1',
    title: 'Sons de Ondas do Mar',
    artist: 'Ocean Dreams',
    description: 'Sons suaves de ondas do mar para induzir um sono profundo e reparador.',
    duration: '120:00',
    category: 'Sono',
    youtubeUrl: 'https://www.youtube.com/watch?v=eKFTSSKCzWA',
    spotifyUrl: 'https://open.spotify.com/track/0KBWQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300&h=300&fit=crop',
    tags: ['ondas', 'mar', 'sono profundo'],
    mood: 'peaceful'
  },
  {
    id: 'sono-2',
    title: 'Meditação para Dormir',
    artist: 'Sleep Guide',
    description: 'Meditação guiada especialmente desenvolvida para relaxar corpo e mente antes de dormir.',
    duration: '25:30',
    category: 'Sono',
    youtubeUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM',
    spotifyUrl: 'https://open.spotify.com/track/1LCXQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=300&h=300&fit=crop',
    tags: ['meditação', 'dormir', 'relaxamento'],
    mood: 'relaxing'
  },
  {
    id: 'sono-3',
    title: 'Frequências Delta para Sono Profundo',
    artist: 'Delta Waves',
    description: 'Frequências delta que sincronizam com as ondas cerebrais do sono profundo.',
    duration: '180:00',
    category: 'Sono',
    youtubeUrl: 'https://www.youtube.com/watch?v=GqSXvMbfCHw',
    spotifyUrl: 'https://open.spotify.com/track/2MDYQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop',
    tags: ['delta', 'frequências', 'ondas cerebrais'],
    mood: 'peaceful'
  },
  {
    id: 'sono-4',
    title: 'História para Adormecer - Floresta Mágica',
    artist: 'Bedtime Stories',
    description: 'História relaxante narrada em uma floresta mágica para embalar seu sono.',
    duration: '32:15',
    category: 'Sono',
    youtubeUrl: 'https://www.youtube.com/watch?v=mPZkdNFkNps',
    spotifyUrl: 'https://open.spotify.com/track/3NEZQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop',
    tags: ['história', 'floresta', 'narrativa'],
    mood: 'peaceful'
  },
  {
    id: 'sono-5',
    title: 'Chuva Suave na Janela',
    artist: 'Rain Sounds',
    description: 'Som reconfortante de chuva suave batendo na janela para uma noite tranquila.',
    duration: '240:00',
    category: 'Sono',
    youtubeUrl: 'https://www.youtube.com/watch?v=mPZkdNFkNps',
    spotifyUrl: 'https://open.spotify.com/track/4OFAQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=300&h=300&fit=crop',
    tags: ['chuva', 'janela', 'tranquilidade'],
    mood: 'peaceful'
  },

  // Categoria: Relacionamentos
  {
    id: 'relacionamentos-1',
    title: 'Meditação do Amor Próprio',
    artist: 'Self Love',
    description: 'Desenvolva uma relação saudável consigo mesmo como base para todos os outros relacionamentos.',
    duration: '18:45',
    category: 'Relacionamentos',
    youtubeUrl: 'https://www.youtube.com/watch?v=YRPh_GaiL8s',
    spotifyUrl: 'https://open.spotify.com/track/5PGBQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop',
    tags: ['amor próprio', 'relacionamento', 'autoestima'],
    mood: 'peaceful'
  },
  {
    id: 'relacionamentos-2',
    title: 'Comunicação Compassiva',
    artist: 'Heart Connection',
    description: 'Aprenda a se comunicar com empatia e compaixão para fortalecer seus relacionamentos.',
    duration: '24:30',
    category: 'Relacionamentos',
    youtubeUrl: 'https://www.youtube.com/watch?v=T0VXxTOGoWU',
    spotifyUrl: 'https://open.spotify.com/track/6QHCQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop',
    tags: ['comunicação', 'empatia', 'compaixão'],
    mood: 'peaceful'
  },
  {
    id: 'relacionamentos-3',
    title: 'Perdão e Libertação',
    artist: 'Forgiveness Path',
    description: 'Processo de perdão para liberar ressentimentos e curar relacionamentos feridos.',
    duration: '27:20',
    category: 'Relacionamentos',
    youtubeUrl: 'https://www.youtube.com/watch?v=Yj6V_a6fkXI',
    spotifyUrl: 'https://open.spotify.com/track/7RIDQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    tags: ['perdão', 'libertação', 'cura'],
    mood: 'peaceful'
  },
  {
    id: 'relacionamentos-4',
    title: 'Atração de Relacionamentos Saudáveis',
    artist: 'Healthy Love',
    description: 'Visualização para atrair e manter relacionamentos saudáveis e equilibrados.',
    duration: '21:15',
    category: 'Relacionamentos',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZXsQAXx_ao0',
    spotifyUrl: 'https://open.spotify.com/track/8SJEQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    tags: ['atração', 'relacionamentos saudáveis', 'equilíbrio'],
    mood: 'inspiring'
  },
  {
    id: 'relacionamentos-5',
    title: 'Meditação da Gratidão pelos Outros',
    artist: 'Gratitude Heart',
    description: 'Cultive gratidão pelas pessoas em sua vida e fortaleça os laços afetivos.',
    duration: '16:40',
    category: 'Relacionamentos',
    youtubeUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM',
    spotifyUrl: 'https://open.spotify.com/track/9TKFQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    tags: ['gratidão', 'laços afetivos', 'reconhecimento'],
    mood: 'peaceful'
  },

  // Categoria: Ansiedade
  {
    id: 'ansiedade-1',
    title: 'Respiração Anti-Ansiedade',
    artist: 'Calm Breath',
    description: 'Técnicas de respiração específicas para reduzir ansiedade e restaurar a calma interior.',
    duration: '12:30',
    category: 'Ansiedade',
    youtubeUrl: 'https://www.youtube.com/watch?v=YRPh_GaiL8s',
    spotifyUrl: 'https://open.spotify.com/track/0ULGQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop',
    tags: ['respiração', 'ansiedade', 'calma'],
    mood: 'peaceful'
  },
  {
    id: 'ansiedade-2',
    title: 'Meditação do Presente',
    artist: 'Present Moment',
    description: 'Ancoragem no momento presente para interromper ciclos de pensamentos ansiosos.',
    duration: '15:45',
    category: 'Ansiedade',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
    spotifyUrl: 'https://open.spotify.com/track/1VMHQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300&h=300&fit=crop',
    tags: ['presente', 'ancoragem', 'pensamentos'],
    mood: 'peaceful'
  },
  {
    id: 'ansiedade-3',
    title: 'Sons da Natureza - Cachoeira',
    artist: 'Nature Calm',
    description: 'Sons relaxantes de cachoeira para acalmar o sistema nervoso e reduzir a ansiedade.',
    duration: '60:00',
    category: 'Ansiedade',
    youtubeUrl: 'https://www.youtube.com/watch?v=eKFTSSKCzWA',
    spotifyUrl: 'https://open.spotify.com/track/2WNIQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300&h=300&fit=crop',
    tags: ['cachoeira', 'natureza', 'sistema nervoso'],
    mood: 'peaceful'
  },
  {
    id: 'ansiedade-4',
    title: 'Relaxamento Muscular Progressivo',
    artist: 'Muscle Release',
    description: 'Técnica para liberar tensões físicas que acompanham a ansiedade.',
    duration: '20:15',
    category: 'Ansiedade',
    youtubeUrl: 'https://www.youtube.com/watch?v=86HUcX8ZtAk',
    spotifyUrl: 'https://open.spotify.com/track/3XOJQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    tags: ['relaxamento', 'tensão', 'músculos'],
    mood: 'relaxing'
  },
  {
    id: 'ansiedade-5',
    title: 'Afirmações de Paz Interior',
    artist: 'Inner Peace',
    description: 'Afirmações calmantes para substituir pensamentos ansiosos por paz e serenidade.',
    duration: '18:20',
    category: 'Ansiedade',
    youtubeUrl: 'https://www.youtube.com/watch?v=f-wWBGo6a2w',
    spotifyUrl: 'https://open.spotify.com/track/4YPKQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    tags: ['afirmações', 'paz', 'serenidade'],
    mood: 'peaceful'
  },

  // Categoria: Autoestima
  {
    id: 'autoestima-1',
    title: 'Eu Sou Suficiente',
    artist: 'Self Worth',
    description: 'Afirmações poderosas para reconhecer seu valor próprio e desenvolver autoestima saudável.',
    duration: '17:30',
    category: 'Autoestima',
    youtubeUrl: 'https://www.youtube.com/watch?v=f-wWBGo6a2w',
    spotifyUrl: 'https://open.spotify.com/track/5ZQLQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop',
    tags: ['valor próprio', 'suficiência', 'reconhecimento'],
    mood: 'inspiring'
  },
  {
    id: 'autoestima-2',
    title: 'Cura da Criança Interior',
    artist: 'Inner Child',
    description: 'Processo de cura para nutrir e valorizar a criança interior ferida.',
    duration: '28:45',
    category: 'Autoestima',
    youtubeUrl: 'https://www.youtube.com/watch?v=Yj6V_a6fkXI',
    spotifyUrl: 'https://open.spotify.com/track/6ARMQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop',
    tags: ['criança interior', 'cura', 'nutrição'],
    mood: 'peaceful'
  },
  {
    id: 'autoestima-3',
    title: 'Celebrando Suas Conquistas',
    artist: 'Achievement Joy',
    description: 'Reconheça e celebre suas conquistas para fortalecer a autoestima e confiança.',
    duration: '14:20',
    category: 'Autoestima',
    youtubeUrl: 'https://www.youtube.com/watch?v=1ZYbU82GVz4',
    spotifyUrl: 'https://open.spotify.com/track/7BSNQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    tags: ['conquistas', 'celebração', 'reconhecimento'],
    mood: 'inspiring'
  },
  {
    id: 'autoestima-4',
    title: 'Libertação de Autocrítica',
    artist: 'Self Compassion',
    description: 'Liberte-se de padrões de autocrítica destrutiva e desenvolva autocompaixão.',
    duration: '22:10',
    category: 'Autoestima',
    youtubeUrl: 'https://www.youtube.com/watch?v=86HUcX8ZtAk',
    spotifyUrl: 'https://open.spotify.com/track/8CTOQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    tags: ['autocrítica', 'libertação', 'autocompaixão'],
    mood: 'peaceful'
  },
  {
    id: 'autoestima-5',
    title: 'Visualização do Eu Ideal',
    artist: 'Ideal Self',
    description: 'Visualize e conecte-se com a melhor versão de si mesmo para inspirar crescimento.',
    duration: '19:35',
    category: 'Autoestima',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZXsQAXx_ao0',
    spotifyUrl: 'https://open.spotify.com/track/9DUPQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    tags: ['visualização', 'eu ideal', 'crescimento'],
    mood: 'inspiring'
  },

  // Categoria: Mindfulness
  {
    id: 'mindfulness-1',
    title: 'Atenção Plena na Respiração',
    artist: 'Mindful Breath',
    description: 'Prática fundamental de mindfulness focada na observação consciente da respiração.',
    duration: '20:00',
    category: 'Mindfulness',
    youtubeUrl: 'https://www.youtube.com/watch?v=YRPh_GaiL8s',
    spotifyUrl: 'https://open.spotify.com/track/0EVQQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop',
    tags: ['atenção plena', 'respiração', 'observação'],
    mood: 'peaceful'
  },
  {
    id: 'mindfulness-2',
    title: 'Escaneamento Corporal',
    artist: 'Body Awareness',
    description: 'Técnica de varredura corporal para desenvolver consciência e presença no corpo.',
    duration: '25:30',
    category: 'Mindfulness',
    youtubeUrl: 'https://www.youtube.com/watch?v=86HUcX8ZtAk',
    spotifyUrl: 'https://open.spotify.com/track/1FWRQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    tags: ['escaneamento', 'corpo', 'consciência'],
    mood: 'peaceful'
  },
  {
    id: 'mindfulness-3',
    title: 'Meditação Caminhando',
    artist: 'Walking Meditation',
    description: 'Prática de mindfulness em movimento, cultivando presença durante a caminhada.',
    duration: '15:45',
    category: 'Mindfulness',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
    spotifyUrl: 'https://open.spotify.com/track/2GXSQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop',
    tags: ['caminhada', 'movimento', 'presença'],
    mood: 'peaceful'
  },
  {
    id: 'mindfulness-4',
    title: 'Observação dos Pensamentos',
    artist: 'Thought Observer',
    description: 'Aprenda a observar pensamentos sem julgamento, desenvolvendo equanimidade mental.',
    duration: '18:20',
    category: 'Mindfulness',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
    spotifyUrl: 'https://open.spotify.com/track/3HYTQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300&h=300&fit=crop',
    tags: ['pensamentos', 'observação', 'equanimidade'],
    mood: 'peaceful'
  },
  {
    id: 'mindfulness-5',
    title: 'Mindfulness dos Cinco Sentidos',
    artist: 'Sensory Awareness',
    description: 'Exercício de consciência sensorial para ancorar-se completamente no momento presente.',
    duration: '12:15',
    category: 'Mindfulness',
    youtubeUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM',
    spotifyUrl: 'https://open.spotify.com/track/4IZUQC4uLU6hMCjMI75M1A2t',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    tags: ['cinco sentidos', 'sensorial', 'ancoragem'],
    mood: 'peaceful'
  }
];

export const categories = [
  'Todos',
  'Prosperidade', 
  'Foco',
  'Confiança',
  'Sono',
  'Relacionamentos',
  'Ansiedade',
  'Autoestima',
  'Mindfulness'
];

export const getAudiosByCategory = (category: string): AudioTrack[] => {
  if (category === 'Todos') {
    return audioLibrary;
  }
  return audioLibrary.filter(audio => audio.category === category);
};

export const searchAudios = (query: string): AudioTrack[] => {
  const searchTerm = query.toLowerCase();
  return audioLibrary.filter(audio => 
    audio.title.toLowerCase().includes(searchTerm) ||
    audio.artist.toLowerCase().includes(searchTerm) ||
    audio.description.toLowerCase().includes(searchTerm) ||
    audio.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};