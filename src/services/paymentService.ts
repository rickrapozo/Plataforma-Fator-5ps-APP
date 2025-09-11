import { loadStripe, Stripe } from '@stripe/stripe-js'
import { supabase } from '../lib/supabase'

export interface PaymentPlan {
  id: string
  name: string
  priceId: string
  price: {
    monthly: number
    yearly: number
  }
  features: string[]
  popular?: boolean
}

export interface PaymentSession {
  sessionId: string
  url: string
  status: 'pending' | 'complete' | 'expired'
}

export interface SubscriptionStatus {
  status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  plan: string
}

class PaymentService {
  private stripe: Stripe | null = null
  private stripePromise: Promise<Stripe | null>

  constructor() {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      console.warn('⚠️ Chave pública do Stripe não configurada')
    }
    this.stripePromise = loadStripe(publishableKey)
  }

  private async getStripe(): Promise<Stripe | null> {
    if (!this.stripe) {
      this.stripe = await this.stripePromise
    }
    return this.stripe
  }

  // Planos disponíveis
  getAvailablePlans(): PaymentPlan[] {
    return [
      {
        id: 'basic',
        name: 'Plano Básico',
        priceId: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID || 'price_basic',
        price: { monthly: 9.99, yearly: 99.90 },
        features: [
          'Protocolo Diário 5P completo',
          'Uma Jornada Guiada',
          'Biblioteca básica de áudios',
          'Progresso e estatísticas',
          'Suporte por email'
        ],
        popular: false
      },
      {
        id: 'complete',
        name: 'Plano Completo',
        priceId: import.meta.env.VITE_STRIPE_COMPLETE_PRICE_ID || 'price_complete',
        price: { monthly: 19.97, yearly: 199.70 },
        features: [
          'Tudo do Plano Básico',
          '🌟 Terapeuta Essencial AI ilimitado',
          'Todas as Jornadas Guiadas',
          'Biblioteca completa de áudios',
          'Análises avançadas de progresso',
          'Relatórios personalizados',
          'Suporte prioritário'
        ],
        popular: true
      }
    ]
  }

  // Cria sessão de checkout
  async createCheckoutSession(
    planId: string,
    billing: 'monthly' | 'yearly',
    userId: string
  ): Promise<PaymentSession> {
    try {
      const plan = this.getAvailablePlans().find(p => p.id === planId)
      if (!plan) {
        throw new Error('Plano não encontrado')
      }

      // Chama função do Supabase Edge Function para criar sessão
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          planId,
          priceId: plan.priceId,
          billing,
          userId,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription`
        }
      })

      if (error) {
        console.error('❌ Erro ao criar sessão de checkout:', error)
        throw new Error('Erro ao criar sessão de pagamento')
      }

      return {
        sessionId: data.sessionId,
        url: data.url,
        status: 'pending'
      }
    } catch (error) {
      console.error('❌ Erro no PaymentService.createCheckoutSession:', error)
      throw error
    }
  }

  // Redireciona para checkout
  async redirectToCheckout(sessionId: string): Promise<void> {
    try {
      const stripe = await this.getStripe()
      if (!stripe) {
        throw new Error('Stripe não inicializado')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })
      if (error) {
        console.error('❌ Erro ao redirecionar para checkout:', error)
        throw error
      }
    } catch (error) {
      console.error('❌ Erro no PaymentService.redirectToCheckout:', error)
      throw error
    }
  }

  // Inicia processo de checkout completo
  async startCheckout(
    planId: string,
    billing: 'monthly' | 'yearly',
    userId: string
  ): Promise<void> {
    try {
      console.log('🛒 Iniciando checkout:', { planId, billing, userId })
      
      const session = await this.createCheckoutSession(planId, billing, userId)
      console.log('✅ Sessão criada:', session.sessionId)
      
      await this.redirectToCheckout(session.sessionId)
    } catch (error) {
      console.error('❌ Erro no checkout:', error)
      throw error
    }
  }

  // Obtém status da assinatura
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
    try {
      const { data, error } = await supabase.functions.invoke('get-subscription-status', {
        body: { userId }
      })

      if (error) {
        console.error('❌ Erro ao obter status da assinatura:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Erro no PaymentService.getSubscriptionStatus:', error)
      return null
    }
  }

  // Cancela assinatura
  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { userId }
      })

      if (error) {
        console.error('❌ Erro ao cancelar assinatura:', error)
        return false
      }

      return data.success
    } catch (error) {
      console.error('❌ Erro no PaymentService.cancelSubscription:', error)
      return false
    }
  }

  // Atualiza método de pagamento
  async updatePaymentMethod(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          userId,
          returnUrl: `${window.location.origin}/profile`
        }
      })

      if (error) {
        console.error('❌ Erro ao criar sessão do portal:', error)
        return null
      }

      return data.url
    } catch (error) {
      console.error('❌ Erro no PaymentService.updatePaymentMethod:', error)
      return null
    }
  }

  // Processa webhook do Stripe (para uso em Edge Functions)
  static async processWebhook(event: any): Promise<boolean> {
    try {
      console.log('🔔 Processando webhook do Stripe:', event.type)

      switch (event.type) {
        case 'checkout.session.completed':
          await PaymentService.handleCheckoutCompleted(event.data.object)
          break
        case 'customer.subscription.updated':
          await PaymentService.handleSubscriptionUpdated(event.data.object)
          break
        case 'customer.subscription.deleted':
          await PaymentService.handleSubscriptionDeleted(event.data.object)
          break
        case 'invoice.payment_succeeded':
          await PaymentService.handlePaymentSucceeded(event.data.object)
          break
        case 'invoice.payment_failed':
          await PaymentService.handlePaymentFailed(event.data.object)
          break
        default:
          console.log('ℹ️ Evento não tratado:', event.type)
      }

      return true
    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error)
      return false
    }
  }

  // Handlers para eventos do webhook
  private static async handleCheckoutCompleted(session: any): Promise<void> {
    const { customer, subscription, metadata } = session
    const userId = metadata?.userId

    if (!userId) {
      console.error('❌ UserId não encontrado no metadata da sessão')
      return
    }

    // Atualiza perfil do usuário
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription: 'prosperous',
        subscription_status: 'active',
        stripe_customer_id: customer,
        stripe_subscription_id: subscription,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('❌ Erro ao atualizar perfil após checkout:', error)
    } else {
      console.log('✅ Perfil atualizado após checkout bem-sucedido')
    }
  }

  private static async handleSubscriptionUpdated(subscription: any): Promise<void> {
    const { customer, status, current_period_end } = subscription

    // Busca usuário pelo customer ID
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customer)
      .single()

    if (findError || !profile) {
      console.error('❌ Usuário não encontrado para customer:', customer)
      return
    }

    // Mapeia status do Stripe para nosso sistema
    const subscriptionStatus = status === 'active' ? 'active' : 
                              status === 'past_due' ? 'expired' : 
                              status === 'canceled' ? 'cancelled' : 'trial'

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: subscriptionStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (error) {
      console.error('❌ Erro ao atualizar status da assinatura:', error)
    } else {
      console.log('✅ Status da assinatura atualizado')
    }
  }

  private static async handleSubscriptionDeleted(subscription: any): Promise<void> {
    const { customer } = subscription

    // Busca usuário pelo customer ID
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customer)
      .single()

    if (findError || !profile) {
      console.error('❌ Usuário não encontrado para customer:', customer)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription: 'essential',
        subscription_status: 'cancelled',
        stripe_subscription_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (error) {
      console.error('❌ Erro ao cancelar assinatura:', error)
    } else {
      console.log('✅ Assinatura cancelada')
    }
  }

  private static async handlePaymentSucceeded(invoice: any): Promise<void> {
    console.log('✅ Pagamento bem-sucedido:', invoice.id)
    // Aqui você pode implementar lógica adicional como envio de email de confirmação
  }

  private static async handlePaymentFailed(invoice: any): Promise<void> {
    console.log('❌ Falha no pagamento:', invoice.id)
    // Aqui você pode implementar lógica para notificar o usuário sobre falha no pagamento
  }
}

export const paymentService = new PaymentService()
export default paymentService