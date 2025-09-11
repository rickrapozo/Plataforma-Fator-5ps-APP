import { toast } from 'react-toastify'
import { dataService } from './dataService'
import { analyticsService } from './analyticsService'
import { EmailService } from './emailService'
import { UserService } from './userService'

export interface StripeWebhookEvent {
  id: string
  object: 'event'
  type: string
  data: {
    object: any
  }
  created: number
  livemode: boolean
  pending_webhooks: number
  request: {
    id: string | null
    idempotency_key: string | null
  }
}

export interface SubscriptionData {
  id: string
  customer: string
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
  current_period_start: number
  current_period_end: number
  plan: {
    id: string
    nickname: string
    amount: number
    currency: string
    interval: string
  }
  metadata: Record<string, string>
}

class StripeWebhookService {
  private webhookSecret: string
  private isInitialized = false

  constructor() {
    this.webhookSecret = process.env.VITE_STRIPE_WEBHOOK_SECRET || ''
  }

  /**
   * Inicializa o serviço de webhook
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      if (!this.webhookSecret) {
        console.warn('⚠️ Stripe webhook secret não configurado')
        return
      }

      this.isInitialized = true
      console.log('✅ Stripe Webhook Service inicializado')
    } catch (error) {
      console.error('❌ Erro ao inicializar Stripe Webhook Service:', error)
      throw error
    }
  }

  /**
   * Processa eventos do webhook do Stripe
   */
  async processWebhookEvent(event: StripeWebhookEvent): Promise<void> {
    try {
      console.log(`🔔 Processando evento Stripe: ${event.type}`, event.id)

      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as SubscriptionData)
          break

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as SubscriptionData)
          break

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as SubscriptionData)
          break

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object)
          break

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object)
          break

        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object)
          break

        case 'customer.created':
          await this.handleCustomerCreated(event.data.object)
          break

        default:
          console.log(`ℹ️ Evento não tratado: ${event.type}`)
      }

      // Log do evento para analytics
      await analyticsService.trackButtonClick('stripe_webhook_processed', undefined, undefined, {
        eventType: event.type,
        eventId: event.id,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error(`❌ Erro ao processar webhook ${event.type}:`, error)
      throw error
    }
  }

  /**
   * Manipula criação de assinatura
   */
  private async handleSubscriptionCreated(subscription: SubscriptionData): Promise<void> {
    try {
      const userId = subscription.metadata.userId
      if (!userId) {
        console.warn('⚠️ UserId não encontrado nos metadados da assinatura')
        return
      }

      // Atualiza status do usuário no banco
      await UserService.updateUserProfile(userId, {
        subscription_status: 'active'
      })

      // Envia email de boas-vindas
      await EmailService.sendWelcomeEmail(userId, 'Usuário')

      // Track analytics
      await analyticsService.trackButtonClick('subscription_created', undefined, undefined, {
        userId,
        planId: subscription.plan.id,
        amount: subscription.plan.amount,
        currency: subscription.plan.currency
      })

      console.log(`✅ Assinatura criada para usuário ${userId}`)
    } catch (error) {
      console.error('❌ Erro ao processar criação de assinatura:', error)
      throw error
    }
  }

  /**
   * Manipula atualização de assinatura
   */
  private async handleSubscriptionUpdated(subscription: SubscriptionData): Promise<void> {
    try {
      const userId = subscription.metadata.userId
      if (!userId) return

      await UserService.updateUserProfile(userId, {
        subscription_status: subscription.status === 'active' ? 'active' : 'cancelled'
      })

      // Track analytics
      await analyticsService.trackButtonClick('subscription_updated', undefined, undefined, {
        userId,
        newStatus: subscription.status,
        planId: subscription.plan.id
      })

      console.log(`✅ Assinatura atualizada para usuário ${userId}: ${subscription.status}`)
    } catch (error) {
      console.error('❌ Erro ao processar atualização de assinatura:', error)
      throw error
    }
  }

  /**
   * Manipula cancelamento de assinatura
   */
  private async handleSubscriptionDeleted(subscription: SubscriptionData): Promise<void> {
    try {
      const userId = subscription.metadata.userId
      if (!userId) return

      await UserService.updateUserProfile(userId, {
        subscription_status: 'cancelled'
      })

      // Envia email de cancelamento
      await EmailService.sendCustomEmail({
        to: userId,
        subject: 'Assinatura cancelada',
        html: 'Sua assinatura foi cancelada com sucesso.',
        text: 'Sua assinatura foi cancelada com sucesso.'
      })

      // Track analytics
      await analyticsService.trackButtonClick('subscription_canceled', undefined, undefined, {
        userId,
        planId: subscription.plan.id,
        canceledAt: new Date().toISOString()
      })

      console.log(`✅ Assinatura cancelada para usuário ${userId}`)
    } catch (error) {
      console.error('❌ Erro ao processar cancelamento de assinatura:', error)
      throw error
    }
  }

  /**
   * Manipula pagamento bem-sucedido
   */
  private async handlePaymentSucceeded(invoice: any): Promise<void> {
    try {
      const subscriptionId = invoice.subscription
      const customerId = invoice.customer
      const amount = invoice.amount_paid
      const currency = invoice.currency

      // Busca dados da assinatura
      const subscription = await this.getSubscriptionData(subscriptionId)
      if (!subscription) return

      const userId = subscription.metadata.userId
      if (!userId) return

      // Registra pagamento no banco (usando updateUserProfile)
      await UserService.updateUserProfile(userId, {
        subscription_status: 'active'
      })

      // Enviar recibo por email
      await EmailService.sendCustomEmail({
        to: userId,
        subject: 'Recibo de pagamento',
        html: `Pagamento de ${currency.toUpperCase()} ${(amount / 100).toFixed(2)} processado com sucesso.`,
        text: `Pagamento de ${currency.toUpperCase()} ${(amount / 100).toFixed(2)} processado com sucesso.`
      })

      // Track analytics
      await analyticsService.trackButtonClick('payment_succeeded', undefined, undefined, {
        userId,
        amount: amount / 100,
        currency,
        invoiceId: invoice.id
      })

      console.log(`✅ Pagamento processado para usuário ${userId}: ${currency} ${amount / 100}`)
    } catch (error) {
      console.error('❌ Erro ao processar pagamento bem-sucedido:', error)
      throw error
    }
  }

  /**
   * Manipula falha no pagamento
   */
  private async handlePaymentFailed(invoice: any): Promise<void> {
    try {
      const subscriptionId = invoice.subscription
      const subscription = await this.getSubscriptionData(subscriptionId)
      if (!subscription) return

      const userId = subscription.metadata.userId
      if (!userId) return

      // Registra falha no pagamento (usando updateUserProfile)
      await UserService.updateUserProfile(userId, {
        subscription_status: 'expired'
      })

      // Envia email de falha no pagamento
      await EmailService.sendCustomEmail({
        to: userId,
        subject: 'Falha no pagamento',
        html: `Falha no processamento do pagamento de ${invoice.currency.toUpperCase()} ${(invoice.amount_due / 100).toFixed(2)}.`,
        text: `Falha no processamento do pagamento de ${invoice.currency.toUpperCase()} ${(invoice.amount_due / 100).toFixed(2)}.`
      })

      // Track analytics
      await analyticsService.trackButtonClick('payment_failed', undefined, undefined, {
        userId,
        amount: invoice.amount_due / 100,
        currency: invoice.currency,
        invoiceId: invoice.id
      })

      console.log(`⚠️ Falha no pagamento para usuário ${userId}`)
    } catch (error) {
      console.error('❌ Erro ao processar falha no pagamento:', error)
      throw error
    }
  }

  /**
   * Manipula checkout completado
   */
  private async handleCheckoutCompleted(session: any): Promise<void> {
    try {
      const userId = session.metadata?.userId
      if (!userId) return

      // Atualiza status temporário do usuário
      await UserService.updateUserProfile(userId, {
        subscription_status: 'active'
      })

      // Track analytics
      await analyticsService.trackButtonClick('checkout_completed', undefined, undefined, {
        userId,
        sessionId: session.id,
        amount: session.amount_total / 100,
        currency: session.currency
      })

      console.log(`✅ Checkout completado para usuário ${userId}`)
    } catch (error) {
      console.error('❌ Erro ao processar checkout completado:', error)
      throw error
    }
  }

  /**
   * Manipula criação de cliente
   */
  private async handleCustomerCreated(customer: any): Promise<void> {
    try {
      const userId = customer.metadata?.userId
      if (!userId) return

      // Atualiza dados do cliente no usuário
      await UserService.updateUserProfile(userId, {
        subscription_status: 'active'
      })

      console.log(`✅ Cliente Stripe criado para usuário ${userId}`)
    } catch (error) {
      console.error('❌ Erro ao processar criação de cliente:', error)
      throw error
    }
  }

  /**
   * Busca dados da assinatura (mock - implementar com API real)
   */
  private async getSubscriptionData(subscriptionId: string): Promise<SubscriptionData | null> {
    try {
      // Em produção, fazer chamada para API do Stripe
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
      // return await stripe.subscriptions.retrieve(subscriptionId)
      
      // Mock para desenvolvimento
      return {
        id: subscriptionId,
        customer: 'cus_mock',
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        plan: {
          id: 'premium_monthly',
          nickname: 'Premium Mensal',
          amount: 2997,
          currency: 'brl',
          interval: 'month'
        },
        metadata: {
          userId: 'user_mock'
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados da assinatura:', error)
      return null
    }
  }

  /**
   * Valida assinatura do webhook
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      if (!this.webhookSecret) {
        console.warn('⚠️ Webhook secret não configurado - pulando validação')
        return true // Em desenvolvimento, aceitar sem validação
      }

      // Em produção, implementar validação real do Stripe
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
      // stripe.webhooks.constructEvent(payload, signature, this.webhookSecret)
      
      return true
    } catch (error) {
      console.error('❌ Falha na validação da assinatura do webhook:', error)
      return false
    }
  }

  /**
   * Obtém estatísticas dos webhooks
   */
  async getWebhookStats(): Promise<{
    totalProcessed: number
    successRate: number
    lastProcessed: Date | null
    errorCount: number
  }> {
    try {
      // Em produção, buscar do banco de dados
      return {
        totalProcessed: 0,
        successRate: 100,
        lastProcessed: null,
        errorCount: 0
      }
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas dos webhooks:', error)
      throw error
    }
  }
}

export const stripeWebhookService = new StripeWebhookService()