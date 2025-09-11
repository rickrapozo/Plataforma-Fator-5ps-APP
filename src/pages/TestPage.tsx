import React from 'react'

const TestPage: React.FC = () => {
  console.log('TestPage: Renderizando página de teste')
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Página de Teste
        </h1>
        <p className="text-lg text-gray-600">
          Se você está vendo esta página, a aplicação está funcionando!
        </p>
        <div className="mt-8 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800">
            ✅ React está renderizando corretamente<br/>
            ✅ Roteamento está funcionando<br/>
            ✅ CSS está carregando
          </p>
        </div>
      </div>
    </div>
  )
}

export default TestPage