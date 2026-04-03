# Changelog - PayCheckBR

Todas as mudanças notáveis para este projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.3] - 2026-04-03

### 🔧 Corrigido
- **Deployment Strategy**: Mudança do `base` path de relativo (`./`) para absoluto (`/PayCheckBR/`) para garantir o carregamento correto dos assets no GitHub Pages.

## [1.2.2] - 2026-04-03


### 🔧 Corrigido
- **Deployment Fix**: Configuração de `base: './'` no Vite para corrigir erros 404 de assets no GitHub Pages.
- **Portabilidade**: Ajuste de caminhos no `index.html` para suporte a subdiretórios.

## [1.2.1] - 2026-04-03


### 🚀 Adicionado
- **Logo Oficial SVG**: Implementação do novo logo vetorial `src/assets/img/logo.svg` com design Neobrutalista.

### 🎨 Alterado
- **README & Assets**: Atualização de referências visuais e favicon para a nova identidade visual.

### 🧹 Removido
- **Legacy Cleanup**: Exclusão de arquivos obsoletos (`src/index.html` legado), pastas de assets antigos (`assets/js`, `assets/css`) e imagens PNG substituídas.

## [1.2.0] - 2026-04-03


### 🚀 Adicionado
- **Anatomia do Pix**: Nova visualização de dissecação linear (Anatomy Dissection) com cálculo de posições absolutas (byte-a-byte) conforme o padrão EMV® QRCPS.
- **Raio-X de Boletos**: Detalhamento sequencial de 12 segmentos (Barra e Digitável) com exemplos institucionais embutidos (ex: Fator de Vencimento, Código de Moeda).
- **Auditoria de Cartões**: Tabela técnica de 8 campos estruturados para validação de IIN/BIN e integridade de dígitos verificadores.
- **Destaques de Segurança**: Implementação de high-contrast highlights (Neobrutalism Red) para todos os Dígitos Verificadores (DVs).
- **Governança de Repositório**: Atualização profunda do `.gitignore` para padrões profissionais de mercado.

### 🎨 Alterado
- **Design System**: Migração completa para a estética **Neobrutalista** (bordas grossas, sombras rígidas e alto contraste).
- **UX Layout**: Expansão do container principal (`max-w-5xl`) para visualização "one-line" de protocolos longos.
- **Transparência Técnica**: Inclusão de referências diretas a normas reguladoras (FEBRABAN, ISO/IEC 7812, EMV).

### 🤝 Créditos
- Design System e Skills de UX alimentados pela tecnologia **typeui.sh**.

## [1.1.0] - 2026-04-03

### Adicionado
- **Infraestrutura de Testes**: Implementação de 22 testes unitários automatizados utilizando o framework **Vitest**.
- **CI/CD Pipeline**: Configuração do GitHub Actions (`.github/workflows/ci.yml`) para validação automática em cada push/PR.
- **Node.js Gateway**: Adição de `package.json` para gestão de dependências e scripts de desenvolvimento.
- **Módulo de Utilitários**: Centralização de algoritmos de checksum (**Luhn**, **Mod10**, **Mod11**) e formatadores em `src/assets/js/core/utils.js`.

### Alterado
- **Modernização de Arquitetura**: Migração de scripts legados para **ES Modules (ESM)**, permitindo imports/exports nativos.
- **Estrutura de Pastas**: Reorganização profissional do projeto, movendo todo o código-fonte para o diretório `/src`.
- **Código Narrativo**: Refatoração completa de nomes de funções e variáveis para serem expressivos e autodocumentados (ex: `analyzePixQrCode`, `computeMod10CheckDigit`).
- **Orquestração**: O `app.js` agora atua como um coordenador puramente reativo, sem lógica de negócio hardcoded.

### Removido
- Scripts monolíticos antigos (`pay-check-br-util.js`, `pix-check.js`, `credit-card-check.js`, `boleto-check.js`).
- Redundâncias de lógica de cálculo de dígito verificador nos validadores individuais.

---

## [1.0.0] - 2026-04-02
### Lançamento Inicial
- Versão base com suporte a validação de Pix, Cartão de Crédito e Boleto Bancário em um arquivo HTML único e scripts imperativos.
