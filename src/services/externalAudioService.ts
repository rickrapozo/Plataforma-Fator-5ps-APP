import { AudioTrack } from './audioIntegrationService';

// Interface para controle de reprodução externa
interface ExternalAudioPlayer {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (time: number) => void;
}

// Classe para gerenciar reprodução de áudios externos
class ExternalAudioService {
  private currentPlayer: ExternalAudioPlayer | null = null;
  private currentTrack: AudioTrack | null = null;
  private isPlaying: boolean = false;
  private volume: number = 70;
  private onTimeUpdate?: (currentTime: number, duration: number) => void;
  private onPlayStateChange?: (isPlaying: boolean) => void;

  // Configurar callbacks
  setCallbacks(
    onTimeUpdate: (currentTime: number, duration: number) => void,
    onPlayStateChange: (isPlaying: boolean) => void
  ) {
    this.onTimeUpdate = onTimeUpdate;
    this.onPlayStateChange = onPlayStateChange;
  }

  // Reproduzir áudio de fonte externa
  async playExternalAudio(track: AudioTrack): Promise<boolean> {
    try {
      // Parar reprodução atual se houver
      if (this.currentPlayer) {
        this.currentPlayer.stop();
      }

      this.currentTrack = track;

      // Tentar reproduzir do YouTube primeiro, depois Spotify
      if (track.source === 'youtube') {
      return await this.playYouTubeAudio(track.url);
    } else if (track.source === 'spotify') {
      return await this.playSpotifyAudio(track.url);
      } else {
        // Fallback para reprodução simulada
        return this.playSimulatedAudio(track);
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio externo:', error);
      return this.playSimulatedAudio(track);
    }
  }

  // Reproduzir áudio do YouTube (usando iframe API)
  private async playYouTubeAudio(youtubeUrl: string): Promise<boolean> {
    try {
      // Extrair ID do vídeo do YouTube
      const videoId = this.extractYouTubeVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('ID do vídeo do YouTube não encontrado');
      }

      // Criar player simulado para YouTube
      const youtubePlayer: ExternalAudioPlayer = {
        play: () => {
          this.isPlaying = true;
          this.onPlayStateChange?.(true);
          this.startTimeTracking();
        },
        pause: () => {
          this.isPlaying = false;
          this.onPlayStateChange?.(false);
        },
        stop: () => {
          this.isPlaying = false;
          this.onPlayStateChange?.(false);
        },
        setVolume: (volume: number) => {
          this.volume = volume;
        },
        getCurrentTime: () => 0,
        getDuration: () => this.parseDuration(this.currentTrack?.duration || '0:00'),
        seekTo: (time: number) => {
          // Implementar busca no tempo
        }
      };

      this.currentPlayer = youtubePlayer;
      
      // Abrir YouTube em nova aba para reprodução real
      window.open(youtubeUrl, '_blank');
      
      // Iniciar reprodução simulada
      youtubePlayer.play();
      
      return true;
    } catch (error) {
      console.error('Erro ao reproduzir do YouTube:', error);
      return false;
    }
  }

  // Reproduzir áudio do Spotify
  private async playSpotifyAudio(spotifyUrl: string): Promise<boolean> {
    try {
      // Criar player simulado para Spotify
      const spotifyPlayer: ExternalAudioPlayer = {
        play: () => {
          this.isPlaying = true;
          this.onPlayStateChange?.(true);
          this.startTimeTracking();
        },
        pause: () => {
          this.isPlaying = false;
          this.onPlayStateChange?.(false);
        },
        stop: () => {
          this.isPlaying = false;
          this.onPlayStateChange?.(false);
        },
        setVolume: (volume: number) => {
          this.volume = volume;
        },
        getCurrentTime: () => 0,
        getDuration: () => this.parseDuration(this.currentTrack?.duration || '0:00'),
        seekTo: (time: number) => {
          // Implementar busca no tempo
        }
      };

      this.currentPlayer = spotifyPlayer;
      
      // Abrir Spotify em nova aba para reprodução real
      window.open(spotifyUrl, '_blank');
      
      // Iniciar reprodução simulada
      spotifyPlayer.play();
      
      return true;
    } catch (error) {
      console.error('Erro ao reproduzir do Spotify:', error);
      return false;
    }
  }

  // Reprodução simulada como fallback
  private playSimulatedAudio(track: AudioTrack): boolean {
    const simulatedPlayer: ExternalAudioPlayer = {
      play: () => {
        this.isPlaying = true;
        this.onPlayStateChange?.(true);
        this.startTimeTracking();
      },
      pause: () => {
        this.isPlaying = false;
        this.onPlayStateChange?.(false);
      },
      stop: () => {
        this.isPlaying = false;
        this.onPlayStateChange?.(false);
      },
      setVolume: (volume: number) => {
        this.volume = volume;
      },
      getCurrentTime: () => 0,
      getDuration: () => this.parseDuration(track.duration),
      seekTo: (time: number) => {
        // Implementar busca no tempo
      }
    };

    this.currentPlayer = simulatedPlayer;
    simulatedPlayer.play();
    
    return true;
  }

  // Controles de reprodução
  play() {
    if (this.currentPlayer) {
      this.currentPlayer.play();
    }
  }

  pause() {
    if (this.currentPlayer) {
      this.currentPlayer.pause();
    }
  }

  stop() {
    if (this.currentPlayer) {
      this.currentPlayer.stop();
      this.currentPlayer = null;
      this.currentTrack = null;
    }
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.currentPlayer) {
      this.currentPlayer.setVolume(volume);
    }
  }

  // Getters
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentTrack(): AudioTrack | null {
    return this.currentTrack;
  }

  getVolume(): number {
    return this.volume;
  }

  // Utilitários
  private extractYouTubeVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  private parseDuration(duration: string): number {
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  }

  private currentTime = 0;
  private timeInterval: NodeJS.Timeout | null = null;

  private startTimeTracking() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    this.currentTime = 0;
    this.timeInterval = setInterval(() => {
      if (this.isPlaying && this.currentPlayer) {
        this.currentTime += 1;
        const duration = this.currentPlayer.getDuration();
        this.onTimeUpdate?.(this.currentTime, duration);
        
        // Parar quando chegar ao fim
        if (this.currentTime >= duration) {
          this.pause();
          this.currentTime = 0;
        }
      }
    }, 1000);
  }
}

// Instância singleton
export const externalAudioService = new ExternalAudioService();
export default externalAudioService;