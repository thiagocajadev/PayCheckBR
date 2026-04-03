<div align="center">

<img src="src/assets/img/logo.svg" width="480" alt="PayCheckBR Logo">

### Validador Inteligente de Meios de Pagamento — Pix, Cartões e Boletos.

**[Confira a versão online aqui](https://thiagocajadev.github.io/PayCheckBR/)**

[![PayCheckBR CI](https://github.com/thiagocajadev/PayCheckBR/actions/workflows/ci.yml/badge.svg)](https://github.com/thiagocajadev/PayCheckBR/actions/workflows/ci.yml)
[![Node version](https://img.shields.io/badge/node-20.x%20%7C%2022.x-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

</div>

**Olá, dev!**

> [!IMPORTANT]
> **Este é um projeto para fins de estudo** sobre algoritmos de validação de pagamentos comuns no Brasil. O foco é a implementação e demonstração didática de checksums e protocolos de mercado (EMV, Febraban, Luhn).

O **PayCheckBR** é uma aplicação focada na transparência e validação técnica. O projeto segue princípios de **Staff-level Engineering**, priorizando a simplicidade, resiliência e a prática de **Narrative Coding**.

---

## Estrutura do Projeto

O projeto foi organizado para manter a raiz limpa e as preocupações separadas:

- [`/src`](src/): Código-fonte da aplicação (HTML, JS, CSS).
- [`/tests`](tests/): Suítes de testes unitários automatizados (22 testes).
- [`/docs`](docs/): Documentação técnica, especificações e histórico de mudanças.

---

## Tecnologias

- **ES Modules (ESM)**: Modularização nativa.
- **Vitest**: Garantia de precisão dos algoritmos (Luhn, Mod10, Mod11, CRC16).
- **GitHub Actions**: Automação total de testes em cada push/PR.
- **ESLint**: Padronização e qualidade de código.

---

## Documentação Técnica

Explore a anatomia de cada meio de pagamento:

- [Validação de Pix (EMV QRCPS)](docs/pix.md)
- [Validação de Cartão (ISO/IEC 7812)](docs/cartao.md)
- [Validação de Boleto (FEBRABAN)](docs/boleto.md)

<details>
<summary><b>🛠️ Informações de Apoio & Ferramentas Externas</b></summary>

### PIX - Pagamento Instantâneo Brasileiro

- [Manual de Padrões para Iniciação do Pix (BACEN)](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf)
- [Validador de Testes (QR Decoder)](https://pix.nascent.com.br/tools/pix-qr-decoder/)
- [Gerador de Pix para Testes](https://www.gerarpix.com.br/)

### Cartão de Crédito

- [Guia Detalhado: Validação de Cartões](https://cleilsontechinfo.netlify.app/jekyll/update/2019/12/08/um-guia-completo-para-validar-e-formatar-cartoes-de-credito.html)
- [Gerador de Dados de Cartão (4Devs)](https://www.4devs.com.br/gerador_de_numero_cartao_credito)
- [Validador de Número de Cartão (4Devs)](https://www.4devs.com.br/validador_numero_cartao_credito)
- [Gerador de Imagem de Cartão Fictício](https://dnowdd.github.io/CreditCard-Image-Generator/)

### Boleto Bancário

- [Significado dos Números do Código de Barras (Tecmundo)](https://www.tecmundo.com.br/banco/38818-o-que-significa-cada-numero-do-codigo-de-barras-de-um-boleto-ilustracao-.htm)
- [Anatomia de um Boleto (Ttrix)](https://www.ttrix.com/apple/iphone/boletoscan/boletoanatomia.html)
- [Cálculo de Data de Vencimento e Fator](https://www.boletobancario-codigodebarras.com/2018/04/data-de-vencimento-e-valor.html)
- [Teste de Boleto Bancário (Netdinâmica)](https://www.netdinamica.com.br/boleto/teste-boleto.php)
- [Estrutura SISPAG CNAB (Itaú)](https://download.itau.com.br/bankline/sispag_cnab.pdf)

</details>

---

## Histórico de Mudanças

Acompanhe a evolução do projeto no [CHANGELOG.MD](docs/CHANGELOG.MD).

---

## Novidades (v1.2.1)

- **Design Neobrutalista**: Interface moderna de alto contraste com sombras rígidas e estética "Staff Engineer".
- **Anatomia do Pix**: Dissecação linear byte-a-byte do protocolo EMV QRCPS.
- **Raio-X de Boletos**: Análise profunda de posições FEBRABAN com exemplos didáticos.

## Créditos e Agradecimentos

- Todo o sistema de design e skills de UX foram acelerados pela tecnologia **[typeui.sh](https://typeui.sh)**.

---

<p align="left">
Fique à vontade para explorar e contribuir! 🚀 Caso encontre algum erro ou tenha sugestões, abra uma Issue ou envie um Pull Request.
</p>
