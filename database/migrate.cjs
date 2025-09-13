/**
 * Script de migração automatizada
 * Executa todas as migrações de banco de dados em ordem sequencial
 */

const fs = require('fs');
const path = require('path');
const { supabaseAdmin, migrationConfig } = require('./config.cjs');

class DatabaseMigrator {
  constructor() {
    this.migrationsPath = path.join(__dirname, 'migrations');
    this.executedMigrations = new Set();
  }

  async loadExecutedMigrations() {
    try {
      const { data, error } = await supabaseAdmin
        .from('schema_migrations')
        .select('version');
      
      if (error && !error.message.includes('relation "schema_migrations" does not exist')) {
        throw error;
      }
      
      if (data) {
        data.forEach(row => this.executedMigrations.add(row.version));
      }
    } catch (error) {
      console.log('Tabela de migrações não existe ainda, será criada.');
    }
  }

  async createMigrationsTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `;

    const { error } = await supabaseAdmin.rpc('exec_sql', { sql: createTableSQL });
    if (error) {
      console.error('Erro ao criar tabela de migrações:', error);
      throw error;
    }
  }

  async getMigrationFiles() {
    const files = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    return files;
  }

  async executeMigration(filename) {
    const filePath = path.join(this.migrationsPath, filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Executando migração: ${filename}`);
    
    try {
      // Dividir o SQL em comandos individuais
      const commands = sql.split(';').filter(cmd => cmd.trim());
      
      for (const command of commands) {
        if (command.trim()) {
          const { error } = await supabaseAdmin.rpc('exec_sql', { sql: command.trim() });
          if (error) {
            throw error;
          }
        }
      }
      
      // Registrar migração como executada
      const version = filename.replace('.sql', '');
      await supabaseAdmin
        .from('schema_migrations')
        .insert({ version });
      
      console.log(`✅ Migração ${filename} executada com sucesso`);
      
    } catch (error) {
      console.error(`❌ Erro na migração ${filename}:`, error);
      throw error;
    }
  }

  async runMigrations() {
    try {
      console.log('🚀 Iniciando migrações do banco de dados...');
      
      await this.createMigrationsTable();
      await this.loadExecutedMigrations();
      
      const migrationFiles = await this.getMigrationFiles();
      
      for (const file of migrationFiles) {
        const version = file.replace('.sql', '');
        
        if (!this.executedMigrations.has(version)) {
          await this.executeMigration(file);
        } else {
          console.log(`⏭️  Migração ${file} já foi executada`);
        }
      }
      
      console.log('✅ Todas as migrações foram executadas com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro durante as migrações:', error);
      process.exit(1);
    }
  }

  async runSeeds() {
    try {
      console.log('🌱 Executando seeds...');
      
      const seedsPath = path.join(__dirname, 'seeds');
      const seedFiles = fs.readdirSync(seedsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      for (const file of seedFiles) {
        const filePath = path.join(seedsPath, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        console.log(`Executando seed: ${file}`);
        
        const commands = sql.split(';').filter(cmd => cmd.trim());
        
        for (const command of commands) {
          if (command.trim()) {
            const { error } = await supabaseAdmin.rpc('exec_sql', { sql: command.trim() });
            if (error && !error.message.includes('duplicate key')) {
              console.warn(`Aviso no seed ${file}:`, error.message);
            }
          }
        }
        
        console.log(`✅ Seed ${file} executado`);
      }
      
      console.log('✅ Todos os seeds foram executados!');
      
    } catch (error) {
      console.error('❌ Erro durante os seeds:', error);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const migrator = new DatabaseMigrator();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'migrate':
      migrator.runMigrations();
      break;
    case 'seed':
      migrator.runSeeds();
      break;
    case 'reset':
      migrator.runMigrations().then(() => migrator.runSeeds());
      break;
    default:
      console.log('Uso: node migrate.js [migrate|seed|reset]');
      break;
  }
}

module.exports = DatabaseMigrator;