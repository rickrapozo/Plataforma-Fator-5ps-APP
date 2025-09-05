import React from 'react'
import { ArrowLeft, Shield, Eye, Database, Mail, Cookie, UserCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest to-forest-green">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white/80 hover:text-white transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Shield className="w-8 h-8 mr-3 text-sage-green" />
            Política de Privacidade
          </h1>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-4xl mx-auto">
          <div className="prose prose-invert max-w-none">
            
            {/* Introdução */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <UserCheck className="w-6 h-6 mr-2 text-sage-green" />
                1. Introdução
              </h2>
              <p className="text-white/90 leading-relaxed">
                Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais 
                em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) e outras regulamentações aplicáveis.
              </p>
              <p className="text-white/90 leading-relaxed mt-4">
                Ao utilizar nossa plataforma, você concorda com as práticas descritas nesta política.
              </p>
            </section>

            {/* Dados Coletados */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <Database className="w-6 h-6 mr-2 text-sage-green" />
                2. Dados Coletados
              </h2>
              
              <h3 className="text-xl font-medium text-white mb-3">2.1 Dados Fornecidos por Você</h3>
              <ul className="text-white/90 space-y-2 mb-4">
                <li>• Nome completo e informações de contato</li>
                <li>• Endereço de e-mail</li>
                <li>• Informações de perfil e preferências</li>
                <li>• Respostas a questionários e avaliações</li>
                <li>• Conteúdo de conversas com nossa IA</li>
              </ul>

              <h3 className="text-xl font-medium text-white mb-3">2.2 Dados Coletados Automaticamente</h3>
              <ul className="text-white/90 space-y-2">
                <li>• Informações de uso da plataforma</li>
                <li>• Dados de navegação e interação</li>
                <li>• Endereço IP e informações do dispositivo</li>
                <li>• Cookies e tecnologias similares</li>
              </ul>
            </section>

            {/* Finalidades */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-sage-green" />
                3. Finalidades do Tratamento
              </h2>
              <p className="text-white/90 leading-relaxed mb-4">
                Utilizamos seus dados pessoais para as seguintes finalidades:
              </p>
              <ul className="text-white/90 space-y-2">
                <li>• Fornecer e personalizar nossos serviços</li>
                <li>• Processar e responder às suas solicitações</li>
                <li>• Melhorar a experiência do usuário</li>
                <li>• Enviar comunicações relevantes (com seu consentimento)</li>
                <li>• Cumprir obrigações legais e regulamentares</li>
                <li>• Prevenir fraudes e garantir a segurança</li>
              </ul>
            </section>

            {/* Base Legal */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Base Legal</h2>
              <p className="text-white/90 leading-relaxed mb-4">
                O tratamento de seus dados pessoais é baseado nas seguintes hipóteses legais:
              </p>
              <ul className="text-white/90 space-y-2">
                <li>• <strong>Consentimento:</strong> Para comunicações de marketing e cookies não essenciais</li>
                <li>• <strong>Execução de contrato:</strong> Para fornecer os serviços contratados</li>
                <li>• <strong>Legítimo interesse:</strong> Para melhorias do serviço e segurança</li>
                <li>• <strong>Cumprimento de obrigação legal:</strong> Quando exigido por lei</li>
              </ul>
            </section>

            {/* Compartilhamento */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Compartilhamento de Dados</h2>
              <p className="text-white/90 leading-relaxed mb-4">
                Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto:
              </p>
              <ul className="text-white/90 space-y-2">
                <li>• Com seu consentimento explícito</li>
                <li>• Para cumprir obrigações legais</li>
                <li>• Com prestadores de serviços essenciais (sob contrato de confidencialidade)</li>
                <li>• Em caso de fusão, aquisição ou venda de ativos</li>
              </ul>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <Cookie className="w-6 h-6 mr-2 text-sage-green" />
                6. Cookies e Tecnologias Similares
              </h2>
              <p className="text-white/90 leading-relaxed mb-4">
                Utilizamos cookies para melhorar sua experiência. Você pode gerenciar suas preferências de cookies 
                através das configurações de privacidade.
              </p>
              <ul className="text-white/90 space-y-2">
                <li>• <strong>Cookies essenciais:</strong> Necessários para o funcionamento básico</li>
                <li>• <strong>Cookies de analytics:</strong> Para entender como você usa nossa plataforma</li>
                <li>• <strong>Cookies de marketing:</strong> Para personalizar comunicações (com consentimento)</li>
              </ul>
            </section>

            {/* Direitos do Titular */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Seus Direitos</h2>
              <p className="text-white/90 leading-relaxed mb-4">
                Conforme a LGPD, você tem os seguintes direitos:
              </p>
              <ul className="text-white/90 space-y-2">
                <li>• <strong>Acesso:</strong> Saber quais dados temos sobre você</li>
                <li>• <strong>Correção:</strong> Corrigir dados incompletos ou incorretos</li>
                <li>• <strong>Exclusão:</strong> Solicitar a remoção de seus dados</li>
                <li>• <strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li>• <strong>Revogação:</strong> Retirar seu consentimento a qualquer momento</li>
                <li>• <strong>Oposição:</strong> Se opor ao tratamento em certas situações</li>
              </ul>
            </section>

            {/* Segurança */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Segurança dos Dados</h2>
              <p className="text-white/90 leading-relaxed">
                Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais contra 
                acesso não autorizado, alteração, divulgação ou destruição, incluindo criptografia, controles de acesso 
                e monitoramento contínuo.
              </p>
            </section>

            {/* Retenção */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Retenção de Dados</h2>
              <p className="text-white/90 leading-relaxed">
                Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta política, 
                respeitando os prazos legais de retenção e seus direitos como titular dos dados.
              </p>
            </section>

            {/* Contato */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <Mail className="w-6 h-6 mr-2 text-sage-green" />
                10. Contato
              </h2>
              <p className="text-white/90 leading-relaxed mb-4">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:
              </p>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/90"><strong>E-mail:</strong> privacidade@essentialfactor.com</p>
                <p className="text-white/90"><strong>Encarregado de Dados (DPO):</strong> dpo@essentialfactor.com</p>
              </div>
            </section>

            {/* Alterações */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Alterações na Política</h2>
              <p className="text-white/90 leading-relaxed">
                Esta política pode ser atualizada periodicamente. Notificaremos sobre mudanças significativas 
                através de nossa plataforma ou por e-mail.
              </p>
              <p className="text-white/90 leading-relaxed mt-4">
                <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage