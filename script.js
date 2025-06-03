// Inicialização do tema
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    setupThemeListeners();
    setupInputAnimations();
});

// Gerenciamento de temas
function initializeTheme() {
    const savedTheme = localStorage.getItem('conversor-theme') || 'dark';
    setTheme(savedTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('conversor-theme', theme);
    
    // Atualiza botões ativos
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === theme) {
            btn.classList.add('active');
        }
    });
}

function setupThemeListeners() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            setTheme(theme);
            
            // Feedback visual
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        });
    });
}

// Animações para inputs
function setupInputAnimations() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement?.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            input.parentElement?.classList.remove('focused');
        });
        
        input.addEventListener('input', () => {
            if (input.value && !input.readOnly) {
                input.classList.add('loading');
                setTimeout(() => {
                    input.classList.remove('loading');
                }, 300);
            }
        });
    });
}

// Função principal de conversão
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
    let isDecimal = false;
    
    // Validação de entrada vazia
    if (!textInput.trim()) {
        numberOutput.value = 'R$ 0,00';
        calculateMarkup();
        return;
    }
    
    for (const char of textInput) {
        if (char === ',') {
            isDecimal = true;
        } else if (letterToNumber[char] !== undefined) {
            if (isDecimal) {
                decimalPart += letterToNumber[char];
            } else {
                integerPart += letterToNumber[char];
            }
        }
    }
    
    // Validação se não há números válidos
    if (!integerPart && !decimalPart) {
        numberOutput.value = 'R$ 0,00';
        calculateMarkup();
        return;
    }
    
    // Garante que sempre temos uma parte inteira
    if (!integerPart) integerPart = '0';
    
    // Concatena a parte inteira e decimal
    const total = integerPart + (decimalPart ? ',' + decimalPart : '');
    numberOutput.value = formatCurrency(total);
    
    // Efeito visual de sucesso
    animateSuccess(numberOutput);
    
    // Atualiza o preço final quando o texto é alterado
    calculateMarkup();
}

function formatCurrency(value) {
    if (typeof value !== 'string') {
        value = value.toString();
    }
    
    if (!value || value === ',') return 'R$ 0,00';
    
    const [integerPart, decimalPart] = value.split(',');
    
    // Formata a parte inteira com pontos
    let formattedValue = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Adiciona a parte decimal com vírgula
    if (decimalPart) {
        // Limita a duas casas decimais
        const limitedDecimal = decimalPart.substring(0, 2).padEnd(2, '0');
        formattedValue += ',' + limitedDecimal;
    } else {
        formattedValue += ',00';
    }
    
    return 'R$ ' + formattedValue;
}

function calculateMarkup() {
    const outputNumber = document.getElementById('outputNumber').value;
    const markupInput = document.getElementById('markup').value;
    const finalPriceField = document.getElementById('finalPrice');
    
    // Remove "R$ " e formata o número
    const cleanNumber = outputNumber.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    const numberInput = parseFloat(cleanNumber);
    
    // Verifica se o input do markup é válido
    const markup = parseFloat(markupInput);
    
    // Validação aprimorada
    if (isNaN(numberInput) || numberInput <= 0) {
        finalPriceField.value = 'R$ 0,00';
        return;
    }
    
    if (isNaN(markup) || markup < 0) {
        finalPriceField.value = formatCurrency(numberInput.toFixed(2).replace('.', ','));
        return;
    }
    
    // Calcula o preço final
    const finalPrice = numberInput * (1 + markup / 100);
    
    // Formatação do preço final
    const formattedFinalPrice = formatCurrency(finalPrice.toFixed(2).replace('.', ','));
    finalPriceField.value = formattedFinalPrice;
    
    // Efeito visual de sucesso
    animateSuccess(finalPriceField);
}

// Função para animação de sucesso
function animateSuccess(element) {
    element.style.transform = 'scale(1.02)';
    element.style.transition = 'transform 0.2s ease';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 200);
}

// Função para copiar valor para área de transferência
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Valor copiado!');
    }).catch(() => {
        // Fallback para browsers mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Valor copiado!');
    });
}

// Sistema de notificações
function showNotification(message) {
    // Remove notificações existentes
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Adiciona CSS para animações de notificação
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

// Adiciona eventos de duplo clique para copiar valores
document.getElementById('outputNumber').addEventListener('dblclick', function() {
    if (this.value && this.value !== 'R$ 0,00') {
        copyToClipboard(this.value);
    }
});

document.getElementById('finalPrice').addEventListener('dblclick', function() {
    if (this.value && this.value !== 'R$ 0,00') {
        copyToClipboard(this.value);
    }
});

// Adiciona eventos para atualizar automaticamente
document.getElementById('inputText').addEventListener('input', convertText);
document.getElementById('markup').addEventListener('input', calculateMarkup);

// Atalhos de teclado
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + 1, 2, 3 para alternar temas
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '3') {
        e.preventDefault();
        const themes = ['light', 'dark', 'slate'];
        const themeIndex = parseInt(e.key) - 1;
        if (themes[themeIndex]) {
            setTheme(themes[themeIndex]);
        }
    }
    
    // Escape para limpar campos
    if (e.key === 'Escape') {
        const inputText = document.getElementById('inputText');
        const markup = document.getElementById('markup');
        
        if (document.activeElement === inputText) {
            inputText.value = '';
            convertText();
        } else if (document.activeElement === markup) {
            markup.value = '';
            calculateMarkup();
        }
    }
});

// Validação em tempo real para o campo de markup
document.getElementById('markup').addEventListener('input', function(e) {
    let value = e.target.value;
    
    // Remove caracteres não numéricos (exceto ponto e vírgula)
    value = value.replace(/[^0-9.,]/g, '');
    
    // Limita a 2 casas decimais
    if (value.includes(',')) {
        const parts = value.split(',');
        if (parts[1] && parts[1].length > 2) {
            value = parts[0] + ',' + parts[1].substring(0, 2);
        }
    }
    
    e.target.value = value;
});

// Adiciona tooltips informativos
function addTooltips() {
    const tooltips = {
        'inputText': 'Use as letras: P=1, E=2, R=3, N=4, A=5, M=6, B=7, U=8, C=9, O=0',
        'markup': 'Digite o percentual de markup (ex: 20 para 20%)',
        'outputNumber': 'Duplo clique para copiar',
        'finalPrice': 'Duplo clique para copiar'
    };
    
    Object.entries(tooltips).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) {
            element.title = text;
        }
    });
}

// Inicializa tooltips
addTooltips();