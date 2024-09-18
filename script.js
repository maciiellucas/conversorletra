function convertText() {
    const textInput = document.getElementById('inputText').value.toUpperCase();
    const numberOutput = document.getElementById('outputNumber');

    // Mapeamento de letras para números
    const letterToNumber = {
        'P': 1, 'E': 2, 'R': 3, 'N': 4, 'A': 5, 
        'M': 6, 'B': 7, 'U': 8, 'C': 9, 'O': 0
    };
    
    let integerPart = "";
    let decimalPart = "";
    let isDecimal = false; // Flag para indicar se estamos na parte decimal

    for (const char of textInput) {
        if (char === ',') {
            isDecimal = true; // Ativa a parte decimal
        } else if (letterToNumber[char] !== undefined) {
            if (isDecimal) {
                decimalPart += letterToNumber[char]; // Adiciona à parte decimal
            } else {
                integerPart += letterToNumber[char]; // Adiciona à parte inteira
            }
        }
    }

    // Concatena a parte inteira e decimal
    const total = integerPart + (decimalPart ? ',' + decimalPart : '');
    numberOutput.value = formatCurrency(total);
    
    // Atualiza o preço final quando o texto é alterado
    calculateMarkup();
}

function formatCurrency(value) {
    // Garante que o valor seja uma string
    if (typeof value !== 'string') {
        value = value.toString();
    }
    
    if (!value || value === ',') return 'R$ 0,00'; // Garante que um valor vazio retorne 0

    const [integerPart, decimalPart] = value.split(',');
    
    // Formata a parte inteira com pontos
    let formattedValue = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Adiciona a parte decimal com vírgula
    if (decimalPart) {
        formattedValue += ',' + decimalPart; // Adiciona a parte decimal
    } else {
        formattedValue += ',00'; // Garante que sempre tenha duas casas decimais
    }
    
    return 'R$ ' + formattedValue;
}

function calculateMarkup() {
    const outputNumber = document.getElementById('outputNumber').value;
    const markupInput = document.getElementById('markup').value;

    // Remove "R$ " e formata o número
    const numberInput = parseFloat(outputNumber.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));

    // Verifica se o input do markup é válido
    const markup = parseFloat(markupInput); // Não divida aqui, pois o markup já deve estar na forma correta (ex.: 20 para 20%)

    // Verifica se numberInput e markup são válidos
    if (!isNaN(numberInput) && !isNaN(markup)) {
        const finalPrice = numberInput * (1 + markup / 100); // Calcula o preço final corretamente
        
        // Formatação correta do preço final
        const formattedFinalPrice = formatCurrency(finalPrice.toFixed(2).replace('.', ','));

        document.getElementById('finalPrice').value = formattedFinalPrice; // Formata o resultado
    } else {
        document.getElementById('finalPrice').value = 'R$ 0,00'; // Se inválido, retorna 0
    }
}

// Adiciona eventos para atualizar o preço final automaticamente
document.getElementById('inputText').addEventListener('input', convertText);
document.getElementById('markup').addEventListener('input', calculateMarkup);
