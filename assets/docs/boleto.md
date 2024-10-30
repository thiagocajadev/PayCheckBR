# Anatomia do Boleto Bancário

O boleto bancário é amplamente utilizado no Brasil para pagamentos de diversos tipos, incluindo contas de consumo,
tributos e serviços. A estrutura do boleto segue os padrões estabelecidos pela **Federação Brasileira de Bancos (
Febraban)**, que garante uma padronização das informações e da validação dos dados.

### Referência:

- [Tabela de Códigos de Compensação dos Bancos](https://www.bcb.gov.br/Fis/CODCOMPE/Tabela.pdf)

## Estrutura do Boleto

Existem dois formatos principais de boleto:

- **Linha Digitável**: sequência de 47 dígitos que facilita a leitura e o pagamento.
- **Código de Barras**: sequência de 44 dígitos que representa as mesmas informações da linha digitável.

![bank-slip-details.png](../img/bank-slip-details.png)

### Componentes do Boleto Bancário

Abaixo, os principais componentes do boleto e suas funções:

1. **Código do Banco**:
    - Representa o código de compensação do banco emissor do boleto.
    - Exemplo: `237` para o Banco Bradesco.

2. **Dígito Verificador**:
    - Valida a integridade do boleto, garantindo que os dados foram digitados corretamente.

3. **Valor do Boleto**:
    - Indica o valor total a ser pago, localizado em posições específicas dependendo se é código de barras ou linha
      digitável.

4. **Fator de Vencimento**:
    - Calculado com base em uma data de referência, representa a data de vencimento do boleto.

5. **Linha Digitável e Código de Barras**:
    - A linha digitável é a sequência legível e segmentada para facilitar o pagamento. O código de barras contém o mesmo
      valor, mas sem separação.

### Exemplo de Código de Barras (44 dígitos)
```plaintext
23796988500000200251234010001234200240012430
```

Separado em segmentos conforme o padrão TLV (Type, Length, Value), incluindo os principais campos:

| **ID** | **Tipo**           | **Tamanho**                  | **Valor**                                              |
|--------|--------------------|------------------------------|--------------------------------------------------------|
| 1      | Tipo de Entrada    | 44 dígitos                   | Código de Barras                                       |
| 2      | Banco              | 3 dígitos (posição 1 a 3)    | 237 (Banco Bradesco)                                   |
| 3      | Dígito Verificador | 1 dígito (posição 5)         | 6                                                      |
| 4      | Valor              | 10 dígitos (posição 10 a 19) | R$ 200,25                                              |
| 5      | Data de Vencimento | 4 dígitos (posição 6 a 9)    | 30/10/2024                                             |
| 6      | Linha Digitável    | 47 dígitos                   | 23791.23405 10001.234201 02400.124307 6 98850000020025 |

### Exemplo de Linha Digitável (47 dígitos)
```plaintext
23791.23405 10001.234201 02400.124307 6 98850000020025
```

| **ID** | **Tipo**           | **Tamanho**                     | **Valor**                                    |
|--------|--------------------|---------------------------------|----------------------------------------------|
| 1      | Tipo de Entrada    | 47 dígitos                      | Linha Digitável                              |
| 2      | Banco              | 3 dígitos (posição 1 a 3)       | 237 (Banco Bradesco)                         |
| 3      | Dígito Verificador | 3 dígitos (posições 10, 21, 32) | 5, 1, 7                                      |
| 4      | Valor              | 10 dígitos (posição 38 a 47)    | 0000020025 (R$ 200,25)                       |
| 5      | Data de Vencimento | 4 dígitos (posição 34 a 37)     | 9885 (30/10/2024)                            |
| 6      | Código de Barras   | 44 dígitos                      | 23796988500000200251234010001234200240012430 |

### Validação do Boleto

A validação do boleto utiliza dois principais métodos:
- **Mod10**: para validar segmentos específicos da linha digitável.
- **Mod11**: para o cálculo do dígito verificador do boleto.

Esses métodos de verificação garantem a segurança e a integridade das informações contidas no boleto, permitindo identificar e corrigir possíveis erros de digitação.

## Detalhes Avançados

Nesta seção, abordaremos detalhes específicos sobre a validação e o cálculo de componentes do boleto, incluindo o dígito
verificador, o fator de vencimento e a conversão entre linha digitável e código de barras. Vamos detalhar o processo com
códigos e explicações didáticas para facilitar o entendimento.

### Dígito Verificador

O dígito verificador no boleto é utilizado para garantir a integridade dos dados. Ele é calculado com base no método *
*Mod10** ou **Mod11**, dependendo da posição no boleto.

#### Código para Cálculo do Dígito Verificador usando Mod10

O Mod10 é um dos métodos usados para validar partes do boleto. Este método multiplica cada dígito por uma sequência
alternada de 2 e 1, soma os dígitos dos produtos e calcula o dígito verificador.

```javascript
function calculateMod10(value) {
let sum = 0;

   // Percorre os dígitos de trás para frente
   for (let i = value.length - 1, multiplier = 2; i >= 0; i--) {
     // Multiplica o dígito pelo multiplicador (2 ou 1)
     let currentDigit = parseInt(value.charAt(i)) * multiplier;
     
     // Se o produto for maior que 9, soma os dígitos do produto
     if (currentDigit > 9) {
      currentDigit = Math.floor(currentDigit / 10) + (currentDigit % 10);
     }
     
     sum += currentDigit;
     // Alterna o multiplicador entre 2 e 1
     multiplier = (multiplier === 2) ? 1 : 2;
   }
    
   // Calcula o dígito verificador
   const mod10 = sum % 10;
   return mod10 === 0 ? 0 : 10 - mod10;

}
```

**Explicação do Código:**

- O código começa multiplicando cada dígito do valor alternadamente por 2 e 1.
- Se o resultado de uma multiplicação for maior que 9, ele soma os dígitos do produto.
- O somatório final é dividido por 10. Se o resto for zero, o dígito verificador é 0. Caso contrário, o dígito é o
  complemento de 10 menos o resto.

### Fator de Vencimento

O fator de vencimento é calculado a partir de uma data base estabelecida pelo BACEN (07/10/1997). Ele representa o número de dias
entre essa data base e a data de vencimento do boleto.

Assim, um boleto bancário vencido em 31/12/2007, por exemplo, teria no campo "vencimento" os números: "3737". Os
números "3737" correspondem ao número de dias decorridos entre 07/10/1997 e 31/12/2007 (31/12/2007 - 07/10/1997 = 3737).

- [Data de Vencimento e Valor](https://www.boletobancario-codigodebarras.com/2018/04/data-de-vencimento-e-valor.html)

#### Código para Cálculo da Data de Vencimento

```javascript
function calculateDueDate(factor) {
   const refDate = new Date(Date.UTC(1997, 9, 7)); // Data base: 07/10/1997 em UTC
   const dueDays = parseInt(factor, 10);

   // Se o fator de vencimento for 0000, o boleto não tem data de vencimento
   if (dueDays === 0) {
     return "Sem vencimento";
   }
    
   // Calcula a data de vencimento somando os dias ao refDate
   const dueDate = new Date(refDate.getTime() + (dueDays * 86400000));
   
   // Retorna a data no formato DD/MM/AAAA
   return dueDate.toLocaleDateString('pt-BR', {timeZone: 'UTC'});
}
```

**Explicação do Código:**

- Definimos uma data base (07/10/1997) a partir da qual o fator de vencimento é calculado.
- O fator de vencimento representa a quantidade de dias que deve ser adicionada à data base para obter a data de
  vencimento.
- Se o fator de vencimento for `0000`, o boleto é considerado "Sem vencimento".
- A função retorna a data formatada no padrão brasileiro.

### Linha Digitável e Código de Barras

A linha digitável e o código de barras contêm a mesma informação, mas em formatos diferentes. A linha digitável tem 47
dígitos segmentados para facilitar a leitura, enquanto o código de barras possui 44 dígitos contínuos.

#### Conversão entre Linha Digitável e Código de Barras

##### Código para Converter Linha Digitável em Código de Barras

```javascript
function convertLineToBarCode(bankSlipLine) {
   if (bankSlipLine.length !== 47) {
      return null;
   }

   // Reorganiza os campos da linha digitável para o formato do código de barras
   const barCode = bankSlipLine.replace(
     /^(\d{4})(\d{5})\d{1}(\d{10})\d{1}(\d{10})\d{1}(\d{15})$/,
     '$1$6$2$3$4'
   );

   return barCode;
}
```

**Explicação do Código:**

- A função verifica se a linha digitável possui 47 dígitos.
- Em seguida, reorganiza os campos da linha digitável para o formato correto do código de barras.
- A expressão regular ajuda a capturar os campos e rearranjá-los, gerando o código de barras final.

##### Código para Converter Código de Barras em Linha Digitável

```javascript
function convertBarCodeToReadableLine(barCode) {
   if (barCode.length !== 44) {
      return null;
   }

   // Organiza o código de barras no formato da linha digitável
   const field1 = `${barCode.substring(0, 4)}${barCode.substring(19, 24)}`;
   const field1Dv = calculateMod10(field1);
   
   const field2 = barCode.substring(24, 34);
   const field2Dv = calculateMod10(field2);
   
   const field3 = barCode.substring(34, 44);
   const field3Dv = calculateMod10(field3);
   
   const field4 = barCode.charAt(4); // Dígito verificador geral
   
   const field5 = barCode.substring(5, 19); // Fator de vencimento e valor

   // Formata a linha digitável com os dígitos verificadores
   return `${field1.substring(0, 5)}.${field1.substring(5)}${field1Dv} ` +
      `${field2.substring(0, 5)}.${field2.substring(5)}${field2Dv} ` +
      `${field3.substring(0, 5)}.${field3.substring(5)}${field3Dv} ` +
      `${field4} ${field5}`;
}
```

**Explicação do Código:**

- A função verifica se o código de barras tem 44 dígitos.
- Divide o código de barras em campos e calcula os dígitos verificadores para cada um usando o Mod10.
- Reorganiza os campos no formato da linha digitável e insere os dígitos verificadores nos locais corretos.
- Retorna a linha digitável formatada.

Essas funções e explicações permitem entender melhor como cada componente do boleto é calculado e verificado.