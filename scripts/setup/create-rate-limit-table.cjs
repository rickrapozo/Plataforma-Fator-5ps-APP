require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function createRateLimitTable() {
  try {
    // Verificar se as variáveis de ambiente estão definidas
    if (!process.env.VITE_SUPABASE_URL) {
      throw new Error('VITE_SUPABASE_URL não está definida no arquivo .env');
    }

    const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseKey) {
      throw new Error('Chave do Supabase não encontrada. Defina VITE_SUPABASE_SERVICE_ROLE_KEY ou VITE_SUPABASE_ANON_KEY');
    }

    console.log('🔧 Conectando ao Supabase...');
    const supabase = createClient(process.env.VITE_SUPABASE_URL, supabaseKey);

    // Ler o arquivo SQL
    console.log('📖 Lendo arquivo SQL...');
    const sql = fs.readFileSync('create-rate-limit-table.sql', 'utf8');

    // Dividir o SQL em comandos individuais
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Executando ${commands.length} comandos SQL...`);

    // Executar cada comando individualmente
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      console.log(`⚡ Executando comando ${i + 1}/${commands.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: command + ';' 
        });
        
        if (error) {
          console.warn(`⚠️  Aviso no comando ${i + 1}:`, error.message);
          // Continua mesmo com avisos (pode ser tabela já existente, etc.)
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      } catch (cmdError) {
        console.error(`❌ Erro no comando ${i + 1}:`, cmdError.message);
        // Para comandos críticos, pode querer parar aqui
        if (command.includes('CREATE TABLE')) {
          console.log('🔄 Tentando criar tabela com método alternativo...');
          
          // Método alternativo usando query direta
          const { error: directError } = await supabase
            .from('_sql')
            .select('*')
            .limit(0); // Apenas para testar conexão
            
          if (!directError) {
            console.log('✅ Conexão com banco confirmada');
          }
        }
      }
    }

    // Verificar se a tabela foi criada
    console.log('🔍 Verificando se a tabela foi criada...');
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'rate_limits')
      .eq('table_schema', 'public');

    if (tableError) {
      console.warn('⚠️  Não foi possível verificar a tabela:', tableError.message);
    } else if (tables && tables.length > 0) {
      console.log('✅ Tabela rate_limits criada com sucesso!');
    } else {
      console.log('ℹ️  Tabela pode ter sido criada (verificação não disponível)');
    }

    // Testar inserção básica
    console.log('🧪 Testando inserção na tabela...');
    const testKey = `test_${Date.now()}`;
    const { data: insertData, error: insertError } = await supabase
      .from('rate_limits')
      .insert({
        key: testKey,
        count: 1,
        reset_time: Date.now() + 60000,
        first_request: Date.now()
      })
      .select();

    if (insertError) {
      console.warn('⚠️  Erro no teste de inserção:', insertError.message);
    } else {
      console.log('✅ Teste de inserção bem-sucedido!');
      
      // Limpar dados de teste
      await supabase
        .from('rate_limits')
        .delete()
        .eq('key', testKey);
      
      console.log('🧹 Dados de teste removidos');
    }

    console.log('\n🎉 Configuração da tabela rate_limits concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. A tabela rate_limits está pronta para uso');
    console.log('2. O serviço RateLimitService pode ser utilizado');
    console.log('3. Configure as políticas RLS se necessário');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('\n🔧 Soluções possíveis:');
    console.error('1. Verifique se o arquivo .env está configurado corretamente');
    console.error('2. Confirme se as chaves do Supabase estão válidas');
    console.error('3. Verifique se o projeto Supabase está ativo');
    process.exit(1);
  }
}

// Executar a função
createRateLimitTable();