import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Brain, Heart, Zap, Target, Trophy, Download, Share2, ArrowRight, CheckCircle, AlertTriangle, Mail } from 'lucide-react'
import Logo from '../../components/shared/Logo'
import { getCapitalizedFirstName, getCapitalizedFullName } from '../../utils/nameUtils'

interface DiagnosisResult {
  pillar: string
  icon: any
  status: 'forte' | 'moderado' | 'critico'
  score: number
  title: string
  description: string
  impact: string
  solution: string
}

interface PersonalizedDiagnosis {
  profile: string
  mainBlockage: string
  description: string
  keyInsight: string
  actionPlan: string[]
  nextStep: string
}

function QuizResultsPage() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<number[]>([])
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult[]>([])
  const [personalizedResult, setPersonalizedResult] = useState<PersonalizedDiagnosis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  useEffect(() => {
    // Recupera o nome do usuário do localStorage
    const storedName = localStorage.getItem('userName')
    if (storedName) {
      setUserName(storedName)
    }
  }, [])

  const firstName = getCapitalizedFirstName(userName)
  const fullName = getCapitalizedFullName(userName)

  const sendPDFByEmail = async () => {
    if (!email.trim()) {
      alert('Por favor, insira seu email para receber o relatório.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Por favor, insira um email válido.')
      return
    }

    setIsSendingEmail(true)

    try {
      // Salvar email no localStorage para futuras comunicações
      localStorage.setItem('userEmail', email)
      
      // Simular envio de email (aqui você integraria com seu serviço de email)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsEmailSent(true)
      setIsSendingEmail(false)
      
      // Opcional: também gerar o PDF localmente
      generatePDF()
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      alert('Erro ao enviar email. Tente novamente.')
      setIsSendingEmail(false)
    }
  }

  const generatePDF = () => {
    // Importação dinâmica do jsPDF
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      
      // Configurações do documento
      doc.setProperties({
        title: 'Relatório de Diagnóstico Pessoal - Fator Essencial',
        subject: 'Diagnóstico Pessoal',
        author: 'Fator Essencial',
        creator: 'Fator Essencial Platform'
      });

      // Cores do design system (RGB)
      const colors = {
        deepForest: [15, 32, 39],
        forestGreen: [26, 61, 58],
        sageGreen: [45, 90, 84],
        royalGold: [212, 175, 55],
        brightGold: [255, 215, 0],
        pearlWhite: [254, 254, 254],
        lightGray: [248, 249, 250]
      };

      let yPosition = 30;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 25;
      const maxWidth = pageWidth - (margin * 2);

      // Função para verificar nova página
      const checkNewPage = (requiredSpace: number = 20) => {
        if (yPosition + requiredSpace > pageHeight - 40) {
          doc.addPage();
          yPosition = 30;
          return true;
        }
        return false;
      };

      // Função para adicionar cabeçalho da página
      const addPageHeader = () => {
        // Fundo do cabeçalho com gradiente simulado
        doc.setFillColor(...colors.deepForest);
        doc.rect(0, 0, pageWidth, 25, 'F');
        
        // Logo/Título no cabeçalho
        doc.setTextColor(...colors.royalGold);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('FATOR ESSENCIAL', margin, 15);
        
        // Data no canto direito
        doc.setTextColor(...colors.pearlWhite);
        doc.setFontSize(8);
        doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth - margin, 15, { align: 'right' });
      };

      // Função para adicionar seção com estilo
      const addSection = (title: string, content: string, isMainTitle: boolean = false) => {
        checkNewPage(isMainTitle ? 40 : 25);
        
        if (isMainTitle) {
          // Título principal com fundo colorido
          doc.setFillColor(...colors.royalGold);
          doc.rect(margin - 5, yPosition - 5, maxWidth + 10, 20, 'F');
          
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text(title, margin, yPosition + 8);
          yPosition += 25;
        } else {
          // Títulos de seção com linha decorativa
          doc.setDrawColor(...colors.royalGold);
          doc.setLineWidth(2);
          doc.line(margin, yPosition, margin + 30, yPosition);
          
          doc.setTextColor(...colors.deepForest);
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(title, margin, yPosition + 12);
          yPosition += 20;
        }
        
        // Conteúdo da seção
        if (content) {
          doc.setTextColor(...colors.forestGreen);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          
          const lines = doc.splitTextToSize(content, maxWidth - 10);
          
          lines.forEach((line: string) => {
            checkNewPage();
            doc.text(line, margin + 5, yPosition);
            yPosition += 6;
          });
          
          yPosition += 8;
        }
      };

      // Função para adicionar card de pilar
      const addPillarCard = (pillar: any, index: number) => {
        checkNewPage(50);
        
        // Fundo do card
        doc.setFillColor(...colors.lightGray);
        doc.rect(margin, yPosition - 5, maxWidth, 45, 'F');
        
        // Borda lateral colorida baseada na pontuação
        const scoreColor = pillar.score >= 8 ? colors.sageGreen : 
                          pillar.score >= 6 ? colors.royalGold : 
                          colors.forestGreen;
        doc.setFillColor(...scoreColor);
        doc.rect(margin, yPosition - 5, 4, 45, 'F');
        
        // Número do pilar
        doc.setFillColor(...colors.royalGold);
        doc.circle(margin + 15, yPosition + 8, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text((index + 1).toString(), margin + 15, yPosition + 12, { align: 'center' });
        
        // Nome do pilar
        doc.setTextColor(...colors.deepForest);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(pillar.pillar.toUpperCase(), margin + 30, yPosition + 5);
        
        // Pontuação e status
        doc.setTextColor(...scoreColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${pillar.score}/10 - ${pillar.status.toUpperCase()}`, margin + 30, yPosition + 15);
        
        // Descrição
        doc.setTextColor(...colors.forestGreen);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(pillar.description, maxWidth - 40);
        let descY = yPosition + 25;
        descLines.slice(0, 2).forEach((line: string) => {
          doc.text(line, margin + 30, descY);
          descY += 5;
        });
        
        yPosition += 55;
      };

      // Adicionar cabeçalho na primeira página
      addPageHeader();
      yPosition = 40;

      // Título principal do relatório
      doc.setFillColor(...colors.deepForest);
      doc.rect(0, yPosition - 10, pageWidth, 35, 'F');
      
      doc.setTextColor(...colors.royalGold);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('RELATÓRIO DE DIAGNÓSTICO PESSOAL', pageWidth / 2, yPosition + 5, { align: 'center' });
      
      doc.setTextColor(...colors.pearlWhite);
      doc.setFontSize(14);
      doc.text('Plataforma Fator Essencial', pageWidth / 2, yPosition + 18, { align: 'center' });
      
      yPosition += 45;

      // Informações do usuário em destaque
      doc.setFillColor(...colors.royalGold);
      doc.rect(margin, yPosition, maxWidth, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${fullName}`, margin + 10, yPosition + 10);
      
      doc.setFontSize(10);
      doc.text(`Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`, margin + 10, yPosition + 20);
      
      yPosition += 35;

      // Seções do relatório
      addSection('PERFIL IDENTIFICADO', personalizedResult?.profile || 'Não identificado', true);
      addSection('BLOQUEIO PRINCIPAL', personalizedResult?.mainBlockage || 'Não identificado');
      addSection('DESCRIÇÃO DETALHADA', personalizedResult?.description || 'Não disponível');
      addSection('INSIGHT CHAVE', personalizedResult?.keyInsight || 'Não disponível');
      
      // Plano de ação com lista
      if (personalizedResult?.actionPlan?.length) {
        addSection('PLANO DE AÇÃO', '');
        personalizedResult.actionPlan.forEach((action: string, index: number) => {
          checkNewPage();
          doc.setTextColor(...colors.forestGreen);
          doc.setFontSize(11);
          doc.text(`${index + 1}. ${action}`, margin + 5, yPosition);
          yPosition += 8;
        });
        yPosition += 5;
      }
      
      addSection('PRÓXIMO PASSO', personalizedResult?.nextStep || 'Não disponível');

      // Análise dos 5 pilares
      checkNewPage(30);
      doc.setFillColor(...colors.sageGreen);
      doc.rect(margin - 5, yPosition - 5, maxWidth + 10, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('ANÁLISE DETALHADA DOS 5 PILARES', margin, yPosition + 8);
      yPosition += 25;

      // Cards dos pilares
      diagnosis.forEach((result, index) => {
        addPillarCard(result, index);
      });

      // Rodapé em todas as páginas
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        if (i > 1) {
          addPageHeader();
        }
        
        // Linha decorativa no rodapé
        doc.setDrawColor(...colors.royalGold);
        doc.setLineWidth(1);
        doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
        
        // Informações do rodapé
        doc.setTextColor(...colors.forestGreen);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Página ${i} de ${pageCount}`,
          margin,
          pageHeight - 15
        );
        doc.text(
          'Fator Essencial - Sua Jornada de Transformação Pessoal',
          pageWidth - margin,
          pageHeight - 15,
          { align: 'right' }
        );
      }

      // Salvar o PDF
      doc.save(`diagnostico-${firstName}-${new Date().toISOString().split('T')[0]}.pdf`);
    }).catch(error => {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    });
  }

  // Diagnósticos personalizados baseados nos padrões de resposta
  const personalizedDiagnoses: PersonalizedDiagnosis[] = [
    {
      profile: "O Perfeccionista Paralisado",
      mainBlockage: "Medo do Fracasso + Procrastinação",
      description: "Você tem uma mente brilhante e grandes ambições, mas está preso em um ciclo de planejamento infinito. Seu medo de não fazer 'perfeito' te impede de começar, e quando começa, a menor dificuldade te faz questionar se vale a pena continuar.",
      keyInsight: "Seu maior inimigo não é a incompetência, é a paralisia por análise. Você sabe o que fazer, mas não consegue se permitir fazer 'mal feito' primeiro para depois melhorar.",
      actionPlan: [
        "Implemente a regra dos 2 minutos: qualquer tarefa que leve menos de 2 minutos, faça imediatamente",
        "Defina 'bom o suficiente' antes de começar qualquer projeto",
        "Pratique o 'lançamento imperfeito': termine e publique algo 80% pronto",
        "Crie deadlines artificiais e compartilhe com alguém para criar accountability"
      ],
      nextStep: "Escolha UMA coisa que você tem adiado há semanas e faça uma versão 'feia' dela hoje mesmo. Não precisa ser perfeita, precisa existir."
    },
    {
      profile: "O Sabotador Inconsciente",
      mainBlockage: "Autoimagem Limitada + Medo do Sucesso",
      description: "Você tem um padrão claro: sempre que está prestes a 'vencer', algo acontece. Você esquece, adoece, arranja uma briga, ou simplesmente 'perde o interesse'. Seu inconsciente está programado para te manter 'seguro' na zona de conforto.",
      keyInsight: "Seu maior medo não é falhar, é ter sucesso e descobrir que não consegue lidar com ele. Você se sabota porque, no fundo, não acredita que merece ou que é capaz de sustentar o sucesso.",
      actionPlan: [
        "Identifique seus padrões de sabotagem: quando e como você se sabota?",
        "Reescreva sua identidade: 'Eu sou o tipo de pessoa que...' (complete com características de sucesso)",
        "Pratique receber elogios sem minimizar ou desviar",
        "Crie rituais de celebração para pequenas vitórias",
        "Trabalhe com afirmações diárias sobre merecimento"
      ],
      nextStep: "Identifique uma área onde você sempre se sabota e crie um 'plano anti-sabotagem': o que você fará quando sentir vontade de desistir?"
    },
    {
      profile: "O Guerreiro Cansado",
      mainBlockage: "Frustração Acumulada + Descrença no Sistema",
      description: "Você já tentou de tudo. Já leu os livros, fez os cursos, seguiu os gurus. Algumas coisas funcionaram por um tempo, mas você sempre volta ao mesmo lugar. Está cansado de tentar e começando a acreditar que 'não é para você'.",
      keyInsight: "Você não falhou porque não é capaz. Você falhou porque estava usando estratégias genéricas para problemas específicos. Cada fracasso foi uma lição disfarçada, não uma confirmação de incapacidade.",
      actionPlan: [
        "Faça um 'inventário de aprendizados': o que cada tentativa te ensinou?",
        "Identifique o padrão: onde exatamente você sempre trava?",
        "Mude a estratégia, não o objetivo: se algo não funciona há 3 tentativas, mude a abordagem",
        "Foque em sistemas, não em motivação: crie estruturas que funcionem mesmo quando você não está inspirado",
        "Encontre um mentor ou coach que já passou pelo que você está passando"
      ],
      nextStep: "Escolha UMA coisa que você quer alcançar e pesquise 3 abordagens completamente diferentes das que você já tentou. Teste a mais simples por 30 dias."
    },
    {
      profile: "O Visionário Disperso",
      mainBlockage: "Falta de Foco + Inconsistência",
      description: "Você tem mil ideias brilhantes e começa várias coisas ao mesmo tempo. Sua mente é um vulcão de criatividade, mas você raramente termina o que começa. Vive pulando de projeto em projeto, sempre achando que a próxima ideia é 'a definitiva'.",
      keyInsight: "Sua criatividade é seu superpoder e sua kriptonita. Você precisa aprender a canalizar sua genialidade em uma direção por tempo suficiente para ver resultados reais.",
      actionPlan: [
        "Regra do 'Um Só': escolha UM projeto principal e pause todos os outros",
        "Crie um 'cemitério de ideias': anote todas as ideias novas em um caderno para revisar depois",
        "Implemente blocos de tempo: 90 minutos focado em uma coisa só, sem exceções",
        "Defina marcos de 30 dias: pequenas metas que te mantêm motivado",
        "Encontre um parceiro de accountability que te cobre consistência"
      ],
      nextStep: "Escolha o projeto com maior potencial de impacto na sua vida e comprometa-se a trabalhar APENAS nele pelos próximos 90 dias. Anote todas as outras ideias para depois."
    }
  ]

  useEffect(() => {
    // Recuperar respostas do localStorage
    const storedAnswers = localStorage.getItem('quizAnswers')
    if (storedAnswers) {
      const parsedAnswers = JSON.parse(storedAnswers)
      setAnswers(parsedAnswers)
      
      // Calcular diagnóstico
      const calculatedDiagnosis = calculateDiagnosis(parsedAnswers)
      setDiagnosis(calculatedDiagnosis)
      
      // Determinar diagnóstico personalizado
      const personalizedDiag = determinePersonalizedDiagnosis(parsedAnswers)
      setPersonalizedResult(personalizedDiag)
      
      setTimeout(() => setIsLoading(false), 1500)
    } else {
      navigate('/quiz/welcome')
    }
  }, [navigate])

  const calculateDiagnosis = (answers: number[]): DiagnosisResult[] => {
    // Mapear respostas para os 5 pilares
    const pillars = [
      {
        pillar: 'Pensamento',
        icon: Brain,
        questions: [0, 1], // Perguntas 1 e 2
        answers: answers.slice(0, 2)
      },
      {
        pillar: 'Sentimento',
        icon: Heart,
        questions: [2, 3], // Perguntas 3 e 4
        answers: answers.slice(2, 4)
      },
      {
        pillar: 'Emoção',
        icon: Zap,
        questions: [4, 5], // Perguntas 5 e 6
        answers: answers.slice(4, 6)
      },
      {
        pillar: 'Ação',
        icon: Target,
        questions: [6, 7], // Perguntas 7 e 8
        answers: answers.slice(6, 8)
      },
      {
        pillar: 'Resultado',
        icon: Trophy,
        questions: [8, 9], // Perguntas 9 e 10
        answers: answers.slice(8, 10)
      }
    ]

    return pillars.map(pillar => {
      // Calcular score (0 = melhor, 3 = pior)
      const avgScore = pillar.answers.reduce((sum, answer) => sum + answer, 0) / pillar.answers.length
      const score = Math.round((3 - avgScore) * 33.33) // Converter para 0-100
      
      let status: 'forte' | 'moderado' | 'critico'
      let title: string
      let description: string
      let impact: string
      let solution: string

      if (score >= 70) {
        status = 'forte'
        title = `${pillar.pillar}: Pilar Forte`
        description = `Seu ${pillar.pillar.toLowerCase()} está bem alinhado e funcionando a seu favor.`
        impact = 'Este pilar está impulsionando seu crescimento e sucesso.'
        solution = 'Continue fortalecendo este pilar e use-o como base para melhorar os outros.'
      } else if (score >= 40) {
        status = 'moderado'
        title = `${pillar.pillar}: Atenção Necessária`
        description = `Seu ${pillar.pillar.toLowerCase()} tem potencial, mas precisa de ajustes.`
        impact = 'Este pilar pode estar limitando seu progresso em algumas áreas.'
        solution = 'Foque em identificar e corrigir os padrões limitantes neste pilar.'
      } else {
        status = 'critico'
        title = `${pillar.pillar}: Bloqueio Crítico`
        description = `Seu ${pillar.pillar.toLowerCase()} está criando barreiras significativas.`
        impact = 'Este é provavelmente seu maior obstáculo para o sucesso.'
        solution = 'Priorize a reprogramação deste pilar - ele está sabotando seus outros esforços.'
      }

      return {
        pillar: pillar.pillar,
        icon: pillar.icon,
        status,
        score,
        title,
        description,
        impact,
        solution
      }
    })
  }

  const determinePersonalizedDiagnosis = (answers: number[]): PersonalizedDiagnosis => {
    // Lógica simplificada para determinar o perfil baseado nos padrões de resposta
    const pensamentoScore = (answers[0] + answers[1]) / 2
    const sentimentoScore = (answers[2] + answers[3]) / 2
    const emocaoScore = (answers[4] + answers[5]) / 2
    const acaoScore = (answers[6] + answers[7]) / 2
    const resultadoScore = (answers[8] + answers[9]) / 2

    // Perfeccionista Paralisado: alto pensamento + alta ação (procrastinação)
    if (pensamentoScore <= 1 && acaoScore >= 2) {
      return personalizedDiagnoses[0]
    }
    // Sabotador Inconsciente: baixo sentimento (merecimento) + alta emoção (medo sucesso)
    else if (sentimentoScore >= 2 && emocaoScore >= 2) {
      return personalizedDiagnoses[1]
    }
    // Guerreiro Cansado: alto resultado (frustração) + baixa emoção (gestão frustração)
    else if (resultadoScore >= 2 && emocaoScore >= 1.5) {
      return personalizedDiagnoses[2]
    }
    // Visionário Disperso: padrão de inconsistência na ação
    else {
      return personalizedDiagnoses[3]
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'forte': return 'text-green-400 border-green-400/50 bg-green-400/10'
      case 'moderado': return 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10'
      case 'critico': return 'text-red-400 border-red-400/50 bg-red-400/10'
      default: return 'text-royal-gold border-royal-gold/50 bg-royal-gold/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'forte': return CheckCircle
      case 'moderado': return AlertTriangle
      case 'critico': return AlertTriangle
      default: return CheckCircle
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-forest via-forest-green to-deep-forest flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <Logo />
          <p className="text-pearl-white/80 text-lg">Preparando seus resultados...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest via-forest-green to-deep-forest relative overflow-hidden">
      {/* Matrix Background Effect */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-royal-gold font-mono text-xs"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <Logo />
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-pearl-white leading-tight">
                {firstName}, Seu Diagnóstico
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-royal-gold via-bright-gold to-royal-gold">
                  Está Pronto
                </span>
              </h1>
              <p className="text-xl text-pearl-white/80 max-w-3xl mx-auto leading-relaxed">
                {firstName}, baseado nas suas respostas, identificamos exatamente onde estão seus bloqueios e como superá-los.
              </p>
            </div>
          </motion.div>



          {/* Diagnóstico Personalizado */}
          {personalizedResult && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="bg-gradient-to-r from-royal-gold/10 to-bright-gold/10 backdrop-blur-sm rounded-3xl p-8 border border-royal-gold/40"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-heading font-bold text-royal-gold mb-4">
                  Seu Perfil: {personalizedResult.profile}
                </h2>
                <div className="inline-flex items-center space-x-2 bg-red-400/20 text-red-400 px-4 py-2 rounded-xl border border-red-400/30">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Bloqueio Principal: {personalizedResult.mainBlockage}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-pearl-white mb-3">O Que Está Acontecendo</h3>
                    <p className="text-pearl-white/80 leading-relaxed">{personalizedResult.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-pearl-white mb-3">Insight Chave</h3>
                    <p className="text-bright-gold leading-relaxed font-medium">{personalizedResult.keyInsight}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-pearl-white mb-3">Plano de Ação</h3>
                    <ul className="space-y-2">
                      {personalizedResult.actionPlan.map((action, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-pearl-white/80 text-sm leading-relaxed">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-bright-gold/10 rounded-xl p-4 border border-bright-gold/30">
                    <h4 className="text-lg font-semibold text-bright-gold mb-2">Próximo Passo Imediato</h4>
                    <p className="text-pearl-white/90 text-sm leading-relaxed">{personalizedResult.nextStep}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Análise dos 5 Pilares */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-heading font-bold text-pearl-white text-center">
              Análise Detalhada dos 5Ps
            </h2>
            
            <div className="grid gap-6">
              {diagnosis.map((result, index) => {
                const Icon = result.icon
                const StatusIcon = getStatusIcon(result.status)
                
                return (
                  <motion.div
                    key={result.pillar}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                    className={`bg-forest-green/20 backdrop-blur-sm rounded-2xl p-6 border-2 ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getStatusColor(result.status)}`}>
                          <Icon className="w-8 h-8" />
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-pearl-white">{result.title}</h3>
                          <div className="flex items-center space-x-2">
                            <StatusIcon className={`w-5 h-5 ${result.status === 'forte' ? 'text-green-400' : result.status === 'moderado' ? 'text-yellow-400' : 'text-red-400'}`} />
                            <span className="text-2xl font-bold text-pearl-white">{result.score}%</span>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <h4 className="font-semibold text-pearl-white mb-1">Situação Atual</h4>
                            <p className="text-pearl-white/70 leading-relaxed">{result.description}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-pearl-white mb-1">Impacto</h4>
                            <p className="text-pearl-white/70 leading-relaxed">{result.impact}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-pearl-white mb-1">Solução</h4>
                            <p className="text-pearl-white/70 leading-relaxed">{result.solution}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Apresentação da Plataforma Fator Essencial */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="bg-gradient-to-r from-deep-navy/80 to-royal-blue/80 backdrop-blur-sm rounded-3xl p-8 border border-royal-gold/30 max-w-5xl mx-auto"
          >
            <div className="text-center space-y-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-14 h-14 bg-gradient-to-r from-royal-gold to-bright-gold rounded-full flex items-center justify-center">
                  <Brain className="w-7 h-7 text-deep-navy" />
                </div>
                <h2 className="text-3xl font-heading font-bold text-royal-gold">
                  Transforme Seus Resultados em Realidade
                </h2>
              </div>
              
              <p className="text-xl text-pearl-white/90 leading-relaxed max-w-4xl mx-auto">
                {firstName}, você acabou de descobrir exatamente onde estão seus bloqueios. Agora chegou o momento mais importante: <span className="text-royal-gold font-bold">transformar esse conhecimento em ação concreta</span>.
              </p>
              
              <div className="bg-gradient-to-r from-royal-gold/10 to-bright-gold/10 rounded-2xl p-6 border border-royal-gold/30">
                <p className="text-lg text-pearl-white/90 leading-relaxed">
                  A <span className="text-royal-gold font-bold">Plataforma Fator Essencial</span> foi criada especificamente para pessoas como você, que querem sair do diagnóstico e partir para a <span className="text-bright-gold font-semibold">transformação real</span>.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mt-10">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-royal-gold/20 rounded-full flex items-center justify-center mx-auto">
                    <Target className="w-10 h-10 text-royal-gold" />
                  </div>
                  <h3 className="text-xl font-semibold text-pearl-white">Planos Personalizados</h3>
                  <p className="text-pearl-white/80 leading-relaxed">
                    Baseado no seu diagnóstico, você recebe um <strong>plano de ação específico</strong> para superar cada bloqueio identificado.
                  </p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-royal-gold/20 rounded-full flex items-center justify-center mx-auto">
                    <Zap className="w-10 h-10 text-royal-gold" />
                  </div>
                  <h3 className="text-xl font-semibold text-pearl-white">Ferramentas Práticas</h3>
                  <p className="text-pearl-white/80 leading-relaxed">
                    Acesso a <strong>exercícios, técnicas e estratégias</strong> que você pode aplicar imediatamente na sua vida.
                  </p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-royal-gold/20 rounded-full flex items-center justify-center mx-auto">
                    <Trophy className="w-10 h-10 text-royal-gold" />
                  </div>
                  <h3 className="text-xl font-semibold text-pearl-white">Resultados Garantidos</h3>
                  <p className="text-pearl-white/80 leading-relaxed">
                    Acompanhamento do seu progresso com <strong>métricas claras</strong> para você ver sua evolução acontecendo.
                  </p>
                </div>
              </div>
              
              {/* Urgency and Scarcity */}
              <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl p-6 mt-8 border border-orange-500/50">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-bold text-orange-300">⚡ OFERTA ESPECIAL - APENAS HOJE</h3>
                  <p className="text-pearl-white/90 text-lg">
                    Quem completa o diagnóstico hoje ganha <span className="text-bright-gold font-bold">50% de desconto</span> no primeiro mês!
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-orange-200">
                    <span>✓ Plano Básico: De R$ 19,98 por R$ 9,99</span>
                    <span>✓ Plano Completo: De R$ 39,94 por R$ 19,97</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-bright-gold/20 to-royal-gold/20 rounded-2xl p-8 mt-8 border border-bright-gold/30">
                <h3 className="text-2xl font-bold text-bright-gold mb-4">Não Deixe Seus Insights Virarem Apenas Conhecimento</h3>
                <p className="text-lg text-pearl-white/90 leading-relaxed mb-6">
                  Milhares de pessoas fazem diagnósticos, mas apenas algumas transformam os resultados em mudanças reais. A diferença está em ter o <span className="text-royal-gold font-bold">sistema certo</span> para colocar tudo em prática.
                </p>
                <div className="flex items-center justify-center">
                  <motion.button
                  onClick={() => navigate('/subscription')}
                  className="group relative overflow-hidden bg-gradient-to-r from-royal-gold to-bright-gold text-deep-navy py-4 px-10 rounded-xl font-bold text-xl flex items-center space-x-3 hover:shadow-lg hover:shadow-royal-gold/40 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>CRIAR CONTA COM 50% DESCONTO</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Call to Action Secundário */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="text-center space-y-6"
          >
            <div className="bg-gradient-to-r from-forest-green/20 to-deep-navy/20 backdrop-blur-sm rounded-2xl p-6 border border-royal-gold/20">
              <h3 className="text-xl font-heading font-semibold text-pearl-white mb-4">
                Já Tem Uma Conta?
              </h3>
              <p className="text-pearl-white/70 mb-6 max-w-2xl mx-auto">
                Faça login para acessar sua plataforma personalizada ou baixe este relatório para revisar com calma.
              </p>
              
              <div className="flex flex-col gap-4 justify-center items-center">
                {/* Login Button - Top */}
                <motion.button
                  onClick={() => navigate('/login')}
                  className="flex items-center space-x-2 text-pearl-white hover:text-royal-gold transition-colors duration-300 px-4 py-2 border border-royal-gold/30 rounded-lg hover:border-royal-gold/60 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Fazer Login</span>
                </motion.button>
                
                {/* Email Form for PDF - Bottom */}
                {!isEmailSent ? (
                  <div className="flex flex-col gap-3 items-center w-full max-w-md">
                    <div className="relative w-full">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Seu melhor email"
                        className="bg-deep-forest/50 border border-royal-gold/30 rounded-xl px-4 py-3 text-pearl-white placeholder-pearl-white/50 focus:outline-none focus:border-royal-gold/60 focus:ring-2 focus:ring-royal-gold/20 transition-all duration-300 w-full"
                        disabled={isSendingEmail}
                      />
                    </div>
                    <motion.button
                      onClick={sendPDFByEmail}
                      disabled={isSendingEmail}
                      className="flex items-center space-x-2 bg-gradient-to-r from-royal-gold to-bright-gold text-deep-navy hover:from-bright-gold hover:to-royal-gold transition-all duration-300 px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
                      whileHover={!isSendingEmail ? { scale: 1.02 } : {}}
                      whileTap={!isSendingEmail ? { scale: 0.98 } : {}}
                    >
                      {isSendingEmail ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-deep-navy border-t-transparent rounded-full"
                          />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          <span>Receber por Email</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 bg-green-600/20 border border-green-400/30 rounded-xl px-6 py-3 text-green-400"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Relatório enviado para {email}!</span>
                  </motion.div>
                )}
              </div>
              
              {!isEmailSent && (
                <p className="text-pearl-white/60 text-sm mt-3 max-w-md mx-auto">
                  💌 Receba seu relatório completo por email e fique por dentro de conteúdos exclusivos sobre desenvolvimento pessoal
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default QuizResultsPage