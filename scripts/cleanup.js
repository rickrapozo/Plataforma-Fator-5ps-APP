/**
 * Script de limpeza do projeto
 * Remove arquivos temporários, cache e otimiza a estrutura
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProjectCleaner {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.tempPatterns = [
      '**/*.tmp',
      '**/*.temp',
      '**/*.log',
      '**/node_modules/.cache',
      '**/.next/cache',
      '**/dist/cache',
      '**/*.backup',
      '**/*~',
      '**/.DS_Store',
      '**/Thumbs.db'
    ];
    
    this.obsoleteFiles = [
      'webpack.config.old.js',
      'package-lock.json.backup',
      'yarn.lock.backup',
      '.env.backup',
      '.env.old'
    ];
  }

  async cleanTempFiles() {
    console.log('🧹 Limpando arquivos temporários...');
    
    try {
      // Limpar cache do npm
      console.log('Limpando cache do npm...');
      execSync('npm cache clean --force', { stdio: 'inherit' });
      
      // Limpar node_modules/.cache se existir
      const cacheDir = path.join(this.projectRoot, 'node_modules', '.cache');
      if (fs.existsSync(cacheDir)) {
        console.log('Removendo cache do node_modules...');
        fs.rmSync(cacheDir, { recursive: true, force: true });
      }
      
      // Limpar .next/cache se existir
      const nextCacheDir = path.join(this.projectRoot, '.next', 'cache');
      if (fs.existsSync(nextCacheDir)) {
        console.log('Removendo cache do Next.js...');
        fs.rmSync(nextCacheDir, { recursive: true, force: true });
      }
      
      console.log('✅ Arquivos temporários removidos');
      
    } catch (error) {
      console.error('❌ Erro ao limpar arquivos temporários:', error.message);
    }
  }

  async removeObsoleteFiles() {
    console.log('🗑️  Removendo arquivos obsoletos...');
    
    for (const file of this.obsoleteFiles) {
      const filePath = path.join(this.projectRoot, file);
      
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Removido: ${file}`);
        } catch (error) {
          console.warn(`Aviso: Não foi possível remover ${file}:`, error.message);
        }
      }
    }
    
    console.log('✅ Arquivos obsoletos removidos');
  }

  async optimizePackageJson() {
    console.log('📦 Otimizando package.json...');
    
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Adicionar scripts úteis se não existirem
        if (!packageJson.scripts) {
          packageJson.scripts = {};
        }
        
        const newScripts = {
          'db:migrate': 'node database/migrate.js migrate',
          'db:seed': 'node database/migrate.js seed',
          'db:reset': 'node database/migrate.js reset',
          'cleanup': 'node scripts/cleanup.js',
          'lint:fix': 'eslint . --fix',
          'format': 'prettier --write .'
        };
        
        let updated = false;
        for (const [script, command] of Object.entries(newScripts)) {
          if (!packageJson.scripts[script]) {
            packageJson.scripts[script] = command;
            updated = true;
          }
        }
        
        if (updated) {
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          console.log('✅ Scripts adicionados ao package.json');
        } else {
          console.log('✅ Package.json já está otimizado');
        }
        
      } catch (error) {
        console.error('❌ Erro ao otimizar package.json:', error.message);
      }
    }
  }

  async analyzeProjectSize() {
    console.log('📊 Analisando tamanho do projeto...');
    
    try {
      const stats = this.getDirectoryStats(this.projectRoot);
      
      console.log('\n📈 Estatísticas do projeto:');
      console.log(`Total de arquivos: ${stats.files}`);
      console.log(`Total de diretórios: ${stats.directories}`);
      console.log(`Tamanho total: ${this.formatBytes(stats.size)}`);
      
      // Analisar node_modules se existir
      const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
      if (fs.existsSync(nodeModulesPath)) {
        const nodeModulesStats = this.getDirectoryStats(nodeModulesPath);
        console.log(`Tamanho do node_modules: ${this.formatBytes(nodeModulesStats.size)}`);
        console.log(`Porcentagem do node_modules: ${((nodeModulesStats.size / stats.size) * 100).toFixed(1)}%`);
      }
      
    } catch (error) {
      console.error('❌ Erro ao analisar projeto:', error.message);
    }
  }

  getDirectoryStats(dirPath) {
    let stats = { files: 0, directories: 0, size: 0 };
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const itemStats = fs.statSync(itemPath);
        
        if (itemStats.isDirectory()) {
          stats.directories++;
          const subStats = this.getDirectoryStats(itemPath);
          stats.files += subStats.files;
          stats.directories += subStats.directories;
          stats.size += subStats.size;
        } else {
          stats.files++;
          stats.size += itemStats.size;
        }
      }
    } catch (error) {
      // Ignorar erros de permissão
    }
    
    return stats;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async runFullCleanup() {
    console.log('🚀 Iniciando limpeza completa do projeto...');
    console.log('=' .repeat(50));
    
    await this.cleanTempFiles();
    await this.removeObsoleteFiles();
    await this.optimizePackageJson();
    await this.analyzeProjectSize();
    
    console.log('\n✅ Limpeza completa finalizada!');
    console.log('💡 Dica: Execute este script regularmente para manter o projeto otimizado.');
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleaner = new ProjectCleaner();
  cleaner.runFullCleanup().catch(console.error);
}

export default ProjectCleaner;