import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, Heart, Brain } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { motion, AnimatePresence } from 'framer-motion';

export interface BreathingTechnique {
  id: string;
  name: string;
  description: string;
  category: 'relaxation' | 'anxiety' | 'focus' | 'sleep' | 'crisis';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // em segundos
  phases: {
    name: string;
    duration: number;
    instruction: string;
    color: string;
  }[];
  benefits: string[];
  audioInstructions?: string;
}

interface AdvancedBreathingTechniquesProps {
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  onTechniqueComplete?: (technique: BreathingTechnique, duration: number) => void;
  showAudioControls?: boolean;
  compact?: boolean;
}

const BREATHING_TECHNIQUES: BreathingTechnique[] = [
  {
    id: 'box-breathing',
    name: 'Respiração Quadrada',
    description: 'Técnica equilibrante para reduzir ansiedade e melhorar foco',
    category: 'anxiety',
    difficulty: 'beginner',
    duration: 240,
    phases: [
      { name: 'Inspire', duration: 4, instruction: 'Inspire pelo nariz', color: 'bg-blue-400' },
      { name: 'Segure', duration: 4, instruction: 'Segure a respiração', color: 'bg-purple-400' },
      { name: 'Expire', duration: 4, instruction: 'Expire pela boca', color: 'bg-green-400' },
      { name: 'Pause', duration: 4, instruction: 'Pause naturalmente', color: 'bg-gray-400' }
    ],
    benefits: ['Reduz ansiedade', 'Melhora foco', 'Equilibra sistema nervoso']
  },
  {
    id: '478-breathing',
    name: 'Respiração 4-7-8',
    description: 'Técnica relaxante para induzir calma e facilitar o sono',
    category: 'sleep',
    difficulty: 'intermediate',
    duration: 180,
    phases: [
      { name: 'Inspire', duration: 4, instruction: 'Inspire pelo nariz', color: 'bg-blue-400' },
      { name: 'Segure', duration: 7, instruction: 'Segure a respiração', color: 'bg-purple-400' },
      { name: 'Expire', duration: 8, instruction: 'Expire completamente', color: 'bg-green-400' }
    ],
    benefits: ['Induz relaxamento', 'Facilita o sono', 'Reduz estresse']
  },
  {
    id: 'coherent-breathing',
    name: 'Respiração Coerente',
    description: 'Respiração ritmada para otimizar variabilidade cardíaca',
    category: 'focus',
    difficulty: 'intermediate',
    duration: 300,
    phases: [
      { name: 'Inspire', duration: 5, instruction: 'Inspire suavemente', color: 'bg-blue-400' },
      { name: 'Expire', duration: 5, instruction: 'Expire suavemente', color: 'bg-green-400' }
    ],
    benefits: ['Melhora variabilidade cardíaca', 'Aumenta foco', 'Reduz pressão arterial']
  },
  {
    id: 'emergency-breathing',
    name: 'Respiração de Emergência',
    description: 'Técnica rápida para crises de pânico e ansiedade severa',
    category: 'crisis',
    difficulty: 'beginner',
    duration: 120,
    phases: [
      { name: 'Inspire', duration: 3, instruction: 'Inspire profundamente', color: 'bg-red-400' },
      { name: 'Expire', duration: 6, instruction: 'Expire lentamente', color: 'bg-orange-400' }
    ],
    benefits: ['Controla pânico', 'Reduz ansiedade aguda', 'Estabiliza rapidamente']
  },
  {
    id: 'wim-hof',
    name: 'Método Wim Hof',
    description: 'Respiração energizante para aumentar energia e resistência',
    category: 'focus',
    difficulty: 'advanced',
    duration: 600,
    phases: [
      { name: 'Inspire', duration: 2, instruction: 'Inspire profundamente', color: 'bg-yellow-400' },
      { name: 'Expire', duration: 1, instruction: 'Expire passivamente', color: 'bg-orange-400' },
      { name: 'Retenção', duration: 60, instruction: 'Segure sem ar', color: 'bg-red-400' }
    ],
    benefits: ['Aumenta energia', 'Melhora resistência', 'Fortalece sistema imune']
  },
  {
    id: 'alternate-nostril',
    name: 'Respiração Alternada',
    description: 'Técnica de equilíbrio dos hemisférios cerebrais',
    category: 'relaxation',
    difficulty: 'intermediate',
    duration: 360,
    phases: [
      { name: 'Narina Direita', duration: 4, instruction: 'Inspire pela narina direita', color: 'bg-indigo-400' },
      { name: 'Segure', duration: 2, instruction: 'Segure brevemente', color: 'bg-purple-400' },
      { name: 'Narina Esquerda', duration: 4, instruction: 'Expire pela narina esquerda', color: 'bg-pink-400' }
    ],
    benefits: ['Equilibra hemisférios cerebrais', 'Melhora concentração', 'Reduz estresse']
  }
];

const AdvancedBreathingTechniques: React.FC<AdvancedBreathingTechniquesProps> = ({
  urgencyLevel = 'medium',
  onTechniqueComplete,
  showAudioControls = true,
  compact = false
}) => {
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [totalTimer, setTotalTimer] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [customDuration, setCustomDuration] = useState([300]); // 5 minutos padrão
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Selecionar técnica baseada no nível de urgência
    const recommendedTechnique = getRecommendedTechnique(urgencyLevel);
    setSelectedTechnique(recommendedTechnique);
  }, [urgencyLevel]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getRecommendedTechnique = (level: string): BreathingTechnique => {
    switch (level) {
      case 'critical':
      case 'high':
        return BREATHING_TECHNIQUES.find(t => t.id === 'emergency-breathing') || BREATHING_TECHNIQUES[0];
      case 'medium':
        return BREATHING_TECHNIQUES.find(t => t.id === 'box-breathing') || BREATHING_TECHNIQUES[0];
      case 'low':
        return BREATHING_TECHNIQUES.find(t => t.id === '478-breathing') || BREATHING_TECHNIQUES[0];
      default:
        return BREATHING_TECHNIQUES[0];
    }
  };

  const startBreathing = () => {
    if (!selectedTechnique) return;
    
    setIsActive(true);
    setCurrentPhaseIndex(0);
    setPhaseTimer(selectedTechnique.phases[0].duration);
    setTotalTimer(0);
    setCycles(0);

    intervalRef.current = setInterval(() => {
      setPhaseTimer(prev => {
        if (prev <= 1) {
          // Próxima fase
          setCurrentPhaseIndex(prevIndex => {
            const nextIndex = (prevIndex + 1) % selectedTechnique.phases.length;
            if (nextIndex === 0) {
              setCycles(prevCycles => prevCycles + 1);
            }
            return nextIndex;
          });
          return selectedTechnique.phases[(currentPhaseIndex + 1) % selectedTechnique.phases.length].duration;
        }
        return prev - 1;
      });

      setTotalTimer(prev => {
        const newTotal = prev + 1;
        if (newTotal >= customDuration[0]) {
          stopBreathing();
          if (onTechniqueComplete) {
            onTechniqueComplete(selectedTechnique, newTotal);
          }
        }
        return newTotal;
      });
    }, 1000);

    if (audioEnabled) {
      playBreathingSound();
    }
  };

  const stopBreathing = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetBreathing = () => {
    stopBreathing();
    setCurrentPhaseIndex(0);
    setPhaseTimer(selectedTechnique?.phases[0]?.duration || 0);
    setTotalTimer(0);
    setCycles(0);
  };

  const playBreathingSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(220, ctx.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crisis': return 'bg-red-100 text-red-800';
      case 'anxiety': return 'bg-orange-100 text-orange-800';
      case 'focus': return 'bg-blue-100 text-blue-800';
      case 'sleep': return 'bg-purple-100 text-purple-800';
      case 'relaxation': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (compact && selectedTechnique) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{selectedTechnique.name}</h3>
            <div className="flex items-center gap-2">
              {showAudioControls && (
                <Button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  variant="ghost"
                  size="sm"
                >
                  {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              )}
              <Button
                onClick={isActive ? stopBreathing : startBreathing}
                className={isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
                size="sm"
              >
                {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {isActive && (
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{formatTime(totalTimer)}</div>
              <div className="text-lg mb-2">
                {selectedTechnique.phases[currentPhaseIndex].name}: {phaseTimer}s
              </div>
              <div className="text-sm text-gray-600">Ciclos: {cycles}</div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Seleção de Técnica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5" />
            Técnicas Avançadas de Respiração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BREATHING_TECHNIQUES.map((technique) => (
              <motion.div
                key={technique.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedTechnique?.id === technique.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTechnique(technique)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{technique.name}</h3>
                  <div className="flex gap-1">
                    <Badge className={getCategoryColor(technique.category)} size="sm">
                      {technique.category}
                    </Badge>
                    <div className={`w-2 h-2 rounded-full ${getDifficultyColor(technique.difficulty)}`} />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-2">{technique.description}</p>
                <div className="text-xs text-gray-500">
                  {formatTime(technique.duration)} • {technique.phases.length} fases
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controles e Visualização */}
      {selectedTechnique && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Painel de Controle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{selectedTechnique.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{selectedTechnique.description}</p>
              
              {/* Benefícios */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Benefícios
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedTechnique.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Duração Personalizada */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Duração: {formatTime(customDuration[0])}
                </label>
                <Slider
                  value={customDuration}
                  onValueChange={setCustomDuration}
                  max={1800} // 30 minutos
                  min={60}   // 1 minuto
                  step={30}
                  className="w-full"
                />
              </div>

              {/* Controles */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={isActive ? stopBreathing : startBreathing}
                  className={`flex-1 ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  {isActive ? (
                    <><Pause className="h-4 w-4 mr-2" /> Parar</>
                  ) : (
                    <><Play className="h-4 w-4 mr-2" /> Iniciar</>
                  )}
                </Button>
                
                <Button onClick={resetBreathing} variant="outline">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                
                {showAudioControls && (
                  <Button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    variant="outline"
                    className={audioEnabled ? 'bg-green-50' : ''}
                  >
                    {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                )}
              </div>

              {/* Status */}
              {isActive && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {formatTime(totalTimer)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Ciclos completados: {cycles}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visualização da Respiração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Guia Visual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                {/* Círculo de Respiração */}
                <div className="relative w-48 h-48 mx-auto">
                  <motion.div
                    className={`w-full h-full rounded-full border-4 ${selectedTechnique.phases[currentPhaseIndex]?.color || 'bg-blue-400'} opacity-20`}
                    animate={{
                      scale: isActive ? [1, 1.2, 1] : 1,
                    }}
                    transition={{
                      duration: selectedTechnique.phases[currentPhaseIndex]?.duration || 4,
                      repeat: isActive ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      {isActive ? (
                        <>
                          <div className="text-3xl font-bold">{phaseTimer}</div>
                          <div className="text-lg">
                            {selectedTechnique.phases[currentPhaseIndex]?.name}
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-400">
                          <Wind className="h-12 w-12 mx-auto mb-2" />
                          <div>Pronto para começar</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Instruções da Fase Atual */}
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.div
                      key={currentPhaseIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="text-lg font-medium mb-2">
                        {selectedTechnique.phases[currentPhaseIndex]?.instruction}
                      </div>
                      <div className="text-sm text-gray-600">
                        Fase {currentPhaseIndex + 1} de {selectedTechnique.phases.length}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Fases da Técnica */}
                <div className="grid grid-cols-2 gap-2">
                  {selectedTechnique.phases.map((phase, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm ${
                        isActive && index === currentPhaseIndex
                          ? phase.color + ' text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <div className="font-medium">{phase.name}</div>
                      <div className="text-xs">{phase.duration}s</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdvancedBreathingTechniques;