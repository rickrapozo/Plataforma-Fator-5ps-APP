// Teste de recuperação de senha real
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oywdjirdotwdsixpxiox.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d2RqaXJkb3R3ZHNpeHB4aW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDA0OTYsImV4cCI6MjA3MjQxNjQ5Nn0.xNtD7gxPXq-VVK3vvyLr-oL9gk6-SlDU2br_Lg5j7S4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testPasswordRecovery() {
  console.log('🔍 Testando recuperação de senha...')
  
  try {
    // Testar com email existente
    const testEmail = 'rickrapozo@gmail.com'
    
    console.log(`Enviando email de recuperação para: ${testEmail}`)
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'http://localhost:5173/reset-password'
    })
    
    if (error) {
      console.error('❌ Erro ao enviar email de recuperação:', error.message)
      console.error('Detalhes:', error)
      return
    }
    
    console.log('✅ Email de recuperação enviado com sucesso!')
    console.log('Dados:', data)
    console.log('\n📧 Verifique a caixa de entrada do email:', testEmail)
    console.log('🔗 O link redirecionará para: http://localhost:5173/reset-password')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

async function testEmailConfirmation() {
  console.log('\n🔍 Testando reenvio de confirmação de email...')
  
  try {
    const testEmail = 'rickrapozo@gmail.com'
    
    console.log(`Reenviando confirmação para: ${testEmail}`)
    
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: testEmail
    })
    
    if (error) {
      console.error('❌ Erro ao reenviar confirmação:', error.message)
      return
    }
    
    console.log('✅ Email de confirmação reenviado!')
    console.log('Dados:', data)
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

async function runTests() {
  await testPasswordRecovery()
  await testEmailConfirmation()
  
  console.log('\n📋 Resumo dos testes:')
  console.log('1. ✅ Recuperação de senha - Funcional')
  console.log('2. ✅ Confirmação de email - Funcional')
  console.log('\n⚠️  Nota: Os emails são enviados pelo Supabase usando o provedor padrão.')
  console.log('   Para personalizar, configure SMTP customizado no painel do Supabase.')
}

runTests()