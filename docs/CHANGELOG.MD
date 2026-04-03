# Changelog - PayCheckBR

Todas as mudanças notáveis para este projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
