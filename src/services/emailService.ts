export interface EmailNotification {
  to: string
  subject: string
  html: string
  text?: string
  template?: 'welcome' | 'protocol_reminder' | 'streak_milestone' | 'level_up'
  data?: Record<string, any>
}

export class EmailService {
  // Templates de email internos
  private static templates = {
    welcome: {
      subject: 'Bem-vindo à Essential Factor 5P! 🌟',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f2027 0%, #1a3d3a 100%); color: #fefefe; border-radius: 12px; padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #d4af37; font-size: 28px; margin: 0;">Essential Factor 5P</h1>
            <p style="color: #fefefe80; margin: 0;">Transformação Pessoal</p>
          </div>
          
          <div style="text-align: center;">
            <h2 style="color: #d4af37;">Bem-vindo, {{name}}!</h2>
            <p>Sua jornada de transformação pessoal começa agora. Estamos animados para te acompanhar nesta jornada incrível!</p>
            
            <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid #d4af37; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #d4af37; margin-top: 0;">Próximos passos:</h3>
              <ul style="text-align: left; color: #fefefe;">
                <li>Complete seu diagnóstico mental</li>
                <li>Configure seu protocolo diário 5P</li>
                <li>Explore nossas jornadas guiadas</li>
                <li>Conheça seu Terapeuta AI</li>
              </ul>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #fefefe80;">
              Lembre-se: a transformação acontece um dia de cada vez. Seja consistente e os resultados virão!
            </p>
          </div>
          
          <div style="margin-top: 30px; font-size: 12px; color: #fefefe80; text-align: center;">
            <p>Essential Factor 5P Platform - Transformando vidas através da tecnologia</p>
          </div>
        </div>
      `,
      text: 'Bem-vindo à Essential Factor 5P, {{name}}! Sua jornada de transformação pessoal começa agora.'
    },
    
    protocol_reminder: {
      subject: 'Hora do seu protocolo diário! ⏰',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f2027 0%, #1a3d3a 100%); color: #fefefe; border-radius: 12px; padding: 40px;">
          <div style="text-align: center;">
            <h2 style="color: #d4af37;">Lembrete do Protocolo 5P</h2>
            <p>Olá {{name}}, não se esqueça de completar seu protocolo diário hoje!</p>
            
            <div style="background: rgba(212, 175, 55, 0.1); border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0;">Sua sequência atual: <strong style="color: #d4af37;">{{streak}} dias</strong></p>
            </div>
            
            <p>Cada dia conta na sua jornada de transformação. Vamos manter o momentum!</p>
          </div>
        </div>
      `,
      text: 'Lembrete: Complete seu protocolo diário 5P hoje! Sequência atual: {{streak}} dias.'
    },
    
    streak_milestone: {
      subject: 'Parabéns! Você alcançou {{streak}} dias consecutivos! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f2027 0%, #1a3d3a 100%); color: #fefefe; border-radius: 12px; padding: 40px;">
          <div style="text-align: center;">
            <h2 style="color: #d4af37;">🎉 Marco Alcançado! 🎉</h2>
            <p>Parabéns {{name}}! Você completou <strong style="color: #d4af37;">{{streak}} dias consecutivos</strong> do protocolo 5P!</p>
            
            <div style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); border-radius: 8px; padding: 20px; margin: 20px 0; color: #0f2027;">
              <h3 style="margin: 0;">Conquista Desbloqueada!</h3>
              <p style="margin: 5px 0 0 0;">Badge: Sequência de {{streak}} dias</p>
            </div>
            
            <p>Sua dedicação está transformando sua vida. Continue assim!</p>
          </div>
        </div>
      `,
      text: 'Parabéns {{name}}! Você alcançou {{streak}} dias consecutivos no protocolo 5P!'
    },
    
    level_up: {
      subject: 'Level Up! Você subiu para o nível {{level}}! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f2027 0%, #1a3d3a 100%); color: #fefefe; border-radius: 12px; padding: 40px;">
          <div style="text-align: center;">
            <h2 style="color: #d4af37;">🚀 Level Up! 🚀</h2>
            <p>Incrível {{name}}! Você subiu para o <strong style="color: #d4af37;">Nível {{level}}</strong>!</p>
            
            <div style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); border-radius: 8px; padding: 20px; margin: 20px 0; color: #0f2027;">
              <h3 style="margin: 0;">Nível {{level}} Desbloqueado!</h3>
              <p style="margin: 5px 0 0 0;">XP Total: {{xp}} pontos</p>
            </div>
            
            <p>Cada nível representa seu crescimento e evolução. Continue sua jornada!</p>
          </div>
        </div>
      `,
      text: 'Level Up! {{name}}, você subiu para o nível {{level}} com {{xp}} XP!'
    }
  }

  // Enviar email usando template
  static async sendTemplateEmail(notification: EmailNotification): Promise<boolean> {
    try {
      if (!notification.template) {
        throw new Error('Template é obrigatório')
      }

      const template = this.templates[notification.template]
      if (!template) {
        throw new Error(`Template '${notification.template}' não encontrado`)
      }

      // Substituir variáveis no template
      let html = template.html
      let text = template.text
      let subject = template.subject

      if (notification.data) {
        Object.entries(notification.data).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`
          html = html.replace(new RegExp(placeholder, 'g'), String(value))
          text = text.replace(new RegExp(placeholder, 'g'), String(value))
          subject = subject.replace(new RegExp(placeholder, 'g'), String(value))
        })
      }

      // Aqui você integraria com um serviço de email real como:
      // - SendGrid
      // - Mailgun  
      // - Amazon SES
      // - Resend
      
      console.log('📧 Email enviado:', {
        to: notification.to,
        subject,
        template: notification.template,
        data: notification.data
      })

      // Por enquanto, apenas simular o envio
      return true

    } catch (error) {
      console.error('Erro ao enviar email:', error)
      return false
    }
  }

  // Enviar email customizado
  static async sendCustomEmail(notification: EmailNotification): Promise<boolean> {
    try {
      console.log('📧 Email customizado enviado:', {
        to: notification.to,
        subject: notification.subject
      })

      // Integração com serviço de email real aqui
      return true

    } catch (error) {
      console.error('Erro ao enviar email customizado:', error)
      return false
    }
  }

  // Notificações automáticas baseadas em eventos
  static async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    return this.sendTemplateEmail({
      to: userEmail,
      subject: '',
      html: '',
      template: 'welcome',
      data: { name: userName }
    })
  }

  static async sendProtocolReminder(userEmail: string, userName: string, streak: number): Promise<boolean> {
    return this.sendTemplateEmail({
      to: userEmail,
      subject: '',
      html: '',
      template: 'protocol_reminder',
      data: { name: userName, streak }
    })
  }

  static async sendStreakMilestone(userEmail: string, userName: string, streak: number): Promise<boolean> {
    return this.sendTemplateEmail({
      to: userEmail,
      subject: '',
      html: '',
      template: 'streak_milestone',
      data: { name: userName, streak }
    })
  }

  static async sendLevelUp(userEmail: string, userName: string, level: number, xp: number): Promise<boolean> {
    return this.sendTemplateEmail({
      to: userEmail,
      subject: '',
      html: '',
      template: 'level_up',
      data: { name: userName, level, xp }
    })
  }
}