# Anatomia do Cartão de Crédito

<!-- Introdução ao cartão de crédito e sua importância -->
O cartão de crédito é um dos métodos mais comuns para pagamentos digitais e físicos, possuindo uma estrutura padronizada
e estabelecida por entidades internacionais. Essa padronização garante a integridade das informações e a segurança nas
transações.

## Estrutura do Cartão de Crédito

Os números dos cartões de crédito seguem um padrão estabelecido pela ISO/IEC 7812. Esse padrão define a composição do
número do cartão, incluindo as informações sobre o tipo de cartão e o emissor.

![card-details.png](../img/card-details.png)

Obs: número gerado via [4devs](https://www.4devs.com.br/gerador_de_numero_cartao_credito), apenas para estudo.

### Componentes do Cartão de Crédito

Principais componentes do cartão e suas funções:

| **ID** | **Componente**                           | **Descrição**                           | **Exemplo** |
|--------|------------------------------------------|-----------------------------------------|-------------|
| 1      | Número de Identificação do Emissor (IIN) | Indica a bandeira e o emissor do cartão | 546498      |
| 2      | Número do Titular                        | Identificação única para o titular      | 476220481   |
| 3      | Dígito Verificador                       | Verifica a integridade do cartão        | 9           |

1. **Número do Cartão (PAN - Primary Account Number)**:
    - Sequência de 16 dígitos, onde os primeiros identificam o emissor e os últimos correspondem à conta do titular.
    - Exemplo de número de cartão: `5464 9847 6220 4819`.

2. **Bandeira do Cartão**:
    - Determinada pelos primeiros dígitos, chamada de **BIN** (Bank Identification Number), que identifica a instituição
      emissora e a bandeira (ex: Visa, Mastercard).

3. **Dígito Verificador**:
    - Utiliza o algoritmo de Luhn (ou Mod10) para verificar a integridade do número do cartão, detectando possíveis
      erros de digitação.

4. **Data de Validade**:
    - Representa a data até a qual o cartão é válido, geralmente no formato MM/AA.

5. **Código de Segurança (CVV)**:
    - Número de 3 a 4 dígitos, utilizado como medida adicional de segurança.

### Algoritmo de Validação (Luhn)

O algoritmo de Luhn é usado para validar o número do cartão, identificando erros comuns de digitação. Ele soma os
dígitos do número após aplicá-los a uma sequência específica de multiplicações.

```javascript
// O algoritmo de Luhn verifica se a soma ajustada dos dígitos é divisível por 10
function calculateLuhn(cardValue) {
   let sum = 0;
   let shouldDouble = false;

   // Percorre os dígitos de trás para frente
   for (let i = cardValue.length - 1; i >= 0; i--) {
      let digit = parseInt(cardValue.charAt(i));

      // Se shouldDouble for verdadeiro, multiplica o dígito por 2
      if (shouldDouble) {
         digit = digit * 2;

         // Se o produto for maior que 9, subtrai 9 para ajustar o valor
         // Exemplo: 14 vira 1 + 4 = 5
         if (digit > 9) {
            digit = digit - 9;
         }
      }

      // Adiciona o valor ajustado à soma total
      sum += digit;

      // Alterna o multiplicador para o próximo dígito
      shouldDouble = !shouldDouble;
   }

   // Retorna verdadeiro se a soma for divisível por 10, indicando um número válido
   return sum % 10 === 0;
}

/* Exemplo de uso com o número do cartão "5464 9847 6220 4819":

1. Multiplicação alternada (da direita para a esquerda):
   - 9 * 2 = 18 -> 1 + 8 = 9
   - 1 * 1 = 1
   - 8 * 2 = 16 -> 1 + 6 = 7
   - 4 * 1 = 4
   - 2 * 2 = 4
   - 2 * 1 = 2
   - 6 * 2 = 12 -> 1 + 2 = 3
   - 2 * 1 = 2
   - 7 * 2 = 14 -> 1 + 4 = 5
   - 4 * 1 = 4
   - 8 * 2 = 16 -> 1 + 6 = 7
   - 9 * 1 = 9
   - 4 * 2 = 8
   - 6 * 1 = 6
   - 5 * 2 = 10 -> 1 + 0 = 1

2. Resultados após o ajuste dos produtos maiores que 9:
   1, 6, 8, 4, 7, 9, 7, 4, 5, 2, 3, 2, 4, 7, 1, 9

3. Soma total dos valores ajustados:
   1 + 6 + 8 + 4 + 7 + 9 + 7 + 4 + 5 + 2 + 3 + 2 + 4 + 7 + 1 + 9 = 80

4. Cálculo da verificação:
   80 % 10 = 0

Resultado: O número "5464 9847 6220 4819" é válido.
*/
```

Explicação do Código:

Cada dígito é multiplicado alternadamente por 2 e 1, e valores maiores que 9 têm seus dígitos somados.
A soma final é verificada; se o resultado for múltiplo de 10, o número é válido.

### Identificação da Bandeira

A bandeira do cartão pode ser determinada com base nos primeiros dígitos do número do cartão:

| **Bandeira**     | **Prefixo (IIN)**                | **Comprimento** |
|------------------|----------------------------------|-----------------|
| Visa             | 4                                | 13, 16          |
| MasterCard       | 51–55, 2221–2720                 | 16              |
| American Express | 34, 37                           | 15              |
| Discover         | 6011, 622126–622925, 644–649, 65 | 16              |
| JCB              | 3528–3589                        | 16              |
