import React, { useState, useEffect } from 'react';
import { RefreshCw, Quote, Globe, Calendar, Sparkles, Heart, Brain, Target, Lightbulb, TrendingUp } from 'lucide-react';
import { motivationalService, MotivationalMessage, MotivationalRequest } from '../../services/motivationalService';

interface MotivationalMessagesProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // em minutos
  showControls?: boolean;
  maxMessages?: number;
}

const MotivationalMessages: React.FC<MotivationalMessagesProps> = ({
  className = '',
  autoRefresh = false,
  refreshInterval = 30,
  showControls = true,
  maxMessages = 1
}) => {
  const [messages, setMessages] = useState<MotivationalMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('inspiracao');
  const [selectedMood, setSelectedMood] = useState<string>('motivado');
  const [selectedLength, setSelectedLength] = useState<string>('media');

  const categories = [
    { key: 'filosofia', label: 'Filosofia', icon: '🤔' },
    { key: 'lideranca', label: 'Liderança', icon: '👑' },
    { key: 'superacao', label: 'Superação', icon: '💪' },
    { key: 'sabedoria', label: 'Sabedoria', icon: '🧠' },
    { key: 'inspiracao', label: 'Inspiração', icon: '✨' },
    { key: 'crescimento', label: 'Crescimento', icon: '🌱' }
  ];

  const moods = [
    { value: 'motivado', label: 'Motivado' },
    { value: 'desanimado', label: 'Desanimado' },
    { value: 'ansioso', label: 'Ansioso' },
    { value: 'reflexivo', label: 'Reflexivo' },
    { value: 'determinado', label: 'Determinado' },
    { value: 'esperancoso', label: 'Esperançoso' },
    { value: 'confiante', label: 'Confiante' },
    { value: 'grato', label: 'Grato' }
  ];

  // Detecta o período do dia automaticamente
  const getTimeOfDay = (): 'manha' | 'tarde' | 'noite' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'manha';
    if (hour >= 12 && hour < 18) return 'tarde';
    return 'noite';
  };

  const lengths = [
    { value: 'curta', label: 'Curta' },
    { value: 'media', label: 'Média' },
    { value: 'longa', label: 'Longa' }
  ];

  // Carrega mensagens iniciais
  useEffect(() => {
    loadMessages();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        loadMessages();
      }, refreshInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadMessages = async (customRequest?: MotivationalRequest) => {
    setLoading(true);
    setError(null);

    try {
      const request: MotivationalRequest = customRequest || {
        category: selectedCategory,
        mood: selectedMood as any,
        length: selectedLength as any,
        timeOfDay: getTimeOfDay(),
        personalContext: `Usuário está buscando inspiração para ${selectedCategory} em um momento de ${selectedMood}`
      };

      let newMessages: MotivationalMessage[];
      
      if (maxMessages === 1) {
        const message = await motivationalService.generateMotivationalMessage(request);
        newMessages = [message];
      } else {
        newMessages = await motivationalService.generateMultipleMessages(maxMessages, request);
      }

      setMessages(newMessages);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
      setError('Não foi possível carregar as mensagens motivacionais. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadMessages();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    loadMessages({ 
      category, 
      mood: selectedMood as any, 
      length: selectedLength as any,
      timeOfDay: getTimeOfDay(),
      personalContext: `Usuário está explorando ${category} em um estado de ${selectedMood}`
    });
  };

  const nextMessage = () => {
    if (messages.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }
  };

  const prevMessage = () => {
    if (messages.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length);
    }
  };

  const getCurrentCategoryIcon = () => {
    const category = categories.find(cat => cat.key === selectedCategory);
    return category ? category.icon : '✨';
  };

  const getCurrentCategoryColor = () => {
    const colorMap: Record<string, string> = {
      'filosofia': 'text-purple-500',
      'lideranca': 'text-yellow-500',
      'superacao': 'text-red-500',
      'sabedoria': 'text-blue-500',
      'inspiracao': 'text-yellow-500',
      'crescimento': 'text-green-500'
    };
    return colorMap[selectedCategory] || 'text-yellow-500';
  };

  const currentMessage = messages[currentIndex];
  const CategoryIcon = getCurrentCategoryIcon();

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 text-red-600 mb-2">
          <Quote className="w-5 h-5" />
          <span className="font-medium">Erro ao carregar mensagens</span>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-lg border border-slate-200 ${className}`}>
      {/* Header com controles */}
      {showControls && (
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className={`text-2xl ${getCurrentCategoryColor()}`}>{getCurrentCategoryIcon()}</span>
              <h3 className="text-lg font-semibold text-slate-800">Mensagens Motivacionais</h3>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Renovar</span>
            </button>
          </div>

          {/* Seletores de categoria */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map((category) => {
              return (
                <button
                  key={category.key}
                  onClick={() => handleCategoryChange(category.key)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Área da mensagem */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-slate-600">Gerando mensagem inspiradora...</span>
            </div>
          </div>
        ) : currentMessage ? (
          <div className="space-y-4">
            {/* Mensagem principal */}
            <div className="relative">
              <Quote className="absolute -top-2 -left-2 w-8 h-8 text-slate-300" />
              <blockquote className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed pl-6 italic">
                "{currentMessage.message}"
              </blockquote>
            </div>

            {/* Informações do autor */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-semibold text-slate-700">— {currentMessage.author}</p>
                  <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                    {currentMessage.country && (
                      <div className="flex items-center space-x-1">
                        <Globe className="w-4 h-4" />
                        <span>{currentMessage.country}</span>
                      </div>
                    )}
                    {currentMessage.era && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{currentMessage.era}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navegação entre mensagens */}
              {messages.length > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevMessage}
                    className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm text-slate-500">
                    {currentIndex + 1} de {messages.length}
                  </span>
                  <button
                    onClick={nextMessage}
                    className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Categoria e timestamp */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span className="capitalize font-medium">{currentMessage.category}</span>
              <span>{currentMessage.timestamp.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Quote className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nenhuma mensagem disponível</p>
            <button
              onClick={handleRefresh}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Carregar Mensagem
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MotivationalMessages;