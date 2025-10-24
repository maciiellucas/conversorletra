// Inicialização do tema
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    setupThemeListeners();
    setupInputAnimations();
    addTooltips(); 
    convertText(); 
    calculateMarkup();
    calculateServices();
});

// -------------------------------
// GERENCIAMENTO DE TEMA
// -------------------------------
function initializeTheme() {
    const savedTheme = localStorage.getItem('conversor-theme') || 'dark'; 
    setTheme(savedTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('conversor-theme', theme);

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
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        });
    });
}

// -------------------------------
// INPUT ANIMAÇÕES
// -------------------------------
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

// -------------------------------
// CONVERSÃO TEXTO → NÚMERO
// -------------------------------
function convertText() {
    const textInput = document.getElementById('inputText').value.toUpperCase();
    const numberOutput = document.getElementById('outputNumber');

    const letterToNumber = {
        'P': 1, 'E': 2, 'R': 3, 'N': 4, 'A': 5, 
        'M': 6, 'B': 7, 'U': 8, 'C': 9, 'O': 0
    };

    let integerPart = "";
    let decimalPart = "";
    let isDecimal = false;

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

    if (!integerPart && !decimalPart) {
        numberOutput.value = 'R$ 0,00';
        calculateMarkup();
        return;
    }

    if (!integerPart) integerPart = '0';

    const total = integerPart + (decimalPart ? ',' + decimalPart : '');
    numberOutput.value = formatCurrency(total);

    animateSuccess(numberOutput);
    calculateMarkup();
}

// -------------------------------
// FORMATAR MOEDA
// -------------------------------
function formatCurrency(value) {
    if (typeof value !== 'string') {
        value = value.toString();
    }
    if (!value || value === ',') return 'R$ 0,00';

    const [integerPart, decimalPart] = value.split(',');
    let formattedValue = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    if (decimalPart) {
        const limitedDecimal = decimalPart.substring(0, 2).padEnd(2, '0');
        formattedValue += ',' + limitedDecimal;
    } else {
        formattedValue += ',00';
    }
    return 'R$ ' + formattedValue;
}

// -------------------------------
// CALCULAR MARKUP → FINAL PRICE
// -------------------------------
function calculateMarkup() {
    const outputNumber = document.getElementById('outputNumber').value;
    const markupInput = document.getElementById('markup').value;
    const finalPriceField = document.getElementById('finalPrice');

    const cleanNumber = outputNumber.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    const numberInput = parseFloat(cleanNumber);

    const markup = parseFloat(markupInput.replace(',', '.'));

    if (isNaN(numberInput) || numberInput <= 0) {
        finalPriceField.value = 'R$ 0,00';
        calculateServices(); 
        return;
    }

    if (isNaN(markup) || markup < 0) {
        finalPriceField.value = formatCurrency(numberInput.toFixed(2).replace('.', ','));
        calculateServices();
        return;
    }

    const finalPrice = numberInput * (1 + markup / 100);
    const formattedFinalPrice = formatCurrency(finalPrice.toFixed(2).replace('.', ','));
    finalPriceField.value = formattedFinalPrice;

    animateSuccess(finalPriceField);
    calculateServices();
}

// -------------------------------
// CALCULAR MARKUP INVERSO
// -------------------------------
function calculateMarkupReverse() {
    const outputNumber = document.getElementById('outputNumber').value;
    const finalPriceField = document.getElementById('finalPrice');
    const markupField = document.getElementById('markup');

    let cleanBase = outputNumber.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    let cleanFinal = finalPriceField.value.replace('R$ ', '').replace(/\./g, '').replace(',', '.');

    const baseValue = parseFloat(cleanBase);
    let finalValue = parseFloat(cleanFinal);

    if (isNaN(baseValue) || baseValue <= 0 || isNaN(finalValue) || finalValue <= 0) {
        markupField.value = '';
        finalPriceField.value = formatCurrency('0,00');
        calculateServices();
        return;
    }

    // Calcula o markup
    const markupPercent = ((finalValue / baseValue - 1) * 100).toFixed(2);
    markupField.value = markupPercent.replace('.', ',');

    // Formata o campo finalPrice em moeda
    finalPriceField.value = formatCurrency(finalValue.toFixed(2).replace('.', ','));

    animateSuccess(markupField);
    calculateServices();
}


// -------------------------------
// CALCULAR SERVIÇOS
// -------------------------------
function calculateServices() {
    const finalPriceField = document.getElementById('finalPrice');
    const serviceValueInput = document.getElementById('serviceValue');
    const serviceDiscountInput = document.getElementById('serviceDiscount');
    const discountedServiceValueField = document.getElementById('discountedServiceValue');
    const finalPriceWithServiceNoDiscountField = document.getElementById('finalPriceWithServiceNoDiscount');
    const finalPriceWithServiceDiscountField = document.getElementById('finalPriceWithServiceDiscount');

    const cleanFinalPrice = finalPriceField.value.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    const mainFinalPrice = parseFloat(cleanFinalPrice) || 0;

    let serviceValue = parseFloat(serviceValueInput.value.replace(',', '.')) || 0;
    let serviceDiscount = parseFloat(serviceDiscountInput.value.replace(',', '.')) || 0;

    if (serviceDiscount < 0) {
        serviceDiscount = 0;
        serviceDiscountInput.value = '';
    }

    const discountedServiceValue = serviceValue * (1 - serviceDiscount / 100);
    discountedServiceValueField.value = formatCurrency(discountedServiceValue.toFixed(2).replace('.', ','));

    const finalPriceNoDiscount = mainFinalPrice + serviceValue;
    finalPriceWithServiceNoDiscountField.value = formatCurrency(finalPriceNoDiscount.toFixed(2).replace('.', ','));

    const finalPriceWithDiscount = mainFinalPrice + discountedServiceValue;
    finalPriceWithServiceDiscountField.value = formatCurrency(finalPriceWithDiscount.toFixed(2).replace('.', ','));

    animateSuccess(discountedServiceValueField);
    animateSuccess(finalPriceWithServiceNoDiscountField);
    animateSuccess(finalPriceWithServiceDiscountField);
}

// -------------------------------
// ANIMAÇÃO SUCESSO
// -------------------------------
function animateSuccess(element) {
    element.style.transform = 'scale(1.02)';
    element.style.transition = 'transform 0.2s ease';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 200);
}

// -------------------------------
// COPY TO CLIPBOARD
// -------------------------------
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Valor copiado!');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Valor copiado!');
    });
}

function showNotification(message) {
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

// -------------------------------
// EVENTOS DE DUPLO CLIQUE
// -------------------------------
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
document.getElementById('discountedServiceValue').addEventListener('dblclick', function() {
    if (this.value && this.value !== 'R$ 0,00') {
        copyToClipboard(this.value);
    }
});
document.getElementById('finalPriceWithServiceNoDiscount').addEventListener('dblclick', function() {
    if (this.value && this.value !== 'R$ 0,00') {
        copyToClipboard(this.value);
    }
});
document.getElementById('finalPriceWithServiceDiscount').addEventListener('dblclick', function() {
    if (this.value && this.value !== 'R$ 0,00') {
        copyToClipboard(this.value);
    }
});

// -------------------------------
// OUTROS EVENTOS
// -------------------------------
document.getElementById('inputText').addEventListener('input', convertText);
document.getElementById('markup').addEventListener('input', calculateMarkup);
document.getElementById('finalPrice').addEventListener('blur', calculateMarkupReverse);
document.getElementById('serviceValue').addEventListener('input', calculateServices);
document.getElementById('serviceDiscount').addEventListener('input', calculateServices);

// -------------------------------
// CALCULAR MARKUP INVERSO AUTOMATICAMENTE (SEM ZERAR AO DIGITAR DEVAGAR)
// -------------------------------
let markupReverseTimeout;
const finalPriceInput = document.getElementById('finalPrice');

finalPriceInput.addEventListener('input', function () {
    clearTimeout(markupReverseTimeout);

    const rawValue = finalPriceInput.value
        .replace(/[^\d,]/g, '') // remove tudo que não é número ou vírgula
        .trim();

    // se o campo estiver vazio, não faz nada
    if (!rawValue) return;

    // se o valor termina com vírgula (ex: "10,") ou está incompleto, aguarda mais digitação
    if (rawValue.endsWith(',')) return;

    // só calcula se houver pelo menos um número antes e, opcionalmente, dois após a vírgula
    const validPattern = /^\d+(,\d{1,2})?$/;
    if (!validPattern.test(rawValue)) return;

    // espera o usuário parar de digitar por 10000 ms antes de calcular
    markupReverseTimeout = setTimeout(() => {
        calculateMarkupReverse();
    }, 10000);
});

// ainda calcula ao sair do campo (garantia extra)
finalPriceInput.addEventListener('blur', calculateMarkupReverse);


const servicesCard = document.querySelector('.services-card');
const closeServicesCardBtn = document.getElementById('closeServicesCard');

document.addEventListener('keydown', (e) => {
    if ((e.altKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        if (servicesCard.classList.contains('hidden')) {
            servicesCard.classList.remove('hidden');
            servicesCard.classList.add('visible');
            calculateServices();
        }
    }

    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '3') {
        e.preventDefault();
        const themes = ['light', 'dark', 'slate'];
        const themeIndex = parseInt(e.key) - 1;
        if (themes[themeIndex]) {
            setTheme(themes[themeIndex]);
        }
    }

    if (e.key === 'Escape') {
        const inputText = document.getElementById('inputText');
        const markup = document.getElementById('markup');
        const serviceValue = document.getElementById('serviceValue');
        const serviceDiscount = document.getElementById('serviceDiscount');

        if (document.activeElement === inputText) {
            inputText.value = '';
            convertText();
        } else if (document.activeElement === markup) {
            markup.value = '';
            calculateMarkup();
        } else if (document.activeElement === serviceValue) {
            serviceValue.value = '';
            calculateServices();
        } else if (document.activeElement === serviceDiscount) {
            serviceDiscount.value = '';
            calculateServices();
        } else if (servicesCard.classList.contains('visible')) {
            closeServicesCardBtn.click();
        }
    }
});

closeServicesCardBtn.addEventListener('click', () => {
    servicesCard.classList.remove('visible');
    servicesCard.addEventListener('animationend', function handler() {
        servicesCard.classList.add('hidden');
        servicesCard.removeEventListener('animationend', handler);
    });
    document.getElementById('serviceValue').value = '';
    document.getElementById('serviceDiscount').value = '';
    calculateServices();
});

// -------------------------------
// FORMATAR INPUTS NUMÉRICOS
// -------------------------------
document.getElementById('markup').addEventListener('input', function(e) {
    let value = e.target.value;
    value = value.replace(/[^0-9.,]/g, '');
    if (value.includes(',')) {
        const parts = value.split(',');
        if (parts[1] && parts[1].length > 2) {
            value = parts[0] + ',' + parts[1].substring(0, 2);
        }
    }
    e.target.value = value;
});

document.getElementById('serviceDiscount').addEventListener('input', function(e) {
    let value = e.target.value;
    value = value.replace(/[^0-9.,]/g, '');
    if (value.includes(',')) {
        const parts = value.split(',');
        if (parts[1] && parts[1].length > 2) {
            value = parts[0] + ',' + parts[1].substring(0, 2);
        }
    }
    e.target.value = value;
});

document.getElementById('serviceValue').addEventListener('input', function(e) {
    let value = e.target.value;
    value = value.replace(/[^0-9.,]/g, '');
    if (value.includes(',')) {
        const parts = value.split(',');
        if (parts[1] && parts[1].length > 2) {
            value = parts[0] + ',' + parts[1].substring(0, 2);
        }
    }
    e.target.value = value;
});

// -------------------------------
// TOOLTIPS
// -------------------------------
function addTooltips() {
    const tooltips = {
        'inputText': 'Use as letras: P=1, E=2, R=3, N=4, A=5, M=6, B=7, U=8, C=9, O=0',
        'markup': 'Digite o percentual de markup (ex: 20 para 20%)',
        'outputNumber': 'Duplo clique para copiar',
        'finalPrice': 'Duplo clique para copiar ou digite o valor final para calcular o markup inverso',
        'serviceValue': 'Digite o valor dos serviços em Reais',
        'serviceDiscount': 'Digite o percentual de desconto nos serviços (ex: 10 para 10%)',
        'discountedServiceValue': 'Duplo clique para copiar',
        'finalPriceWithServiceNoDiscount': 'Duplo clique para copiar',
        'finalPriceWithServiceDiscount': 'Duplo clique para copiar'
    };

    Object.entries(tooltips).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) {
            element.title = text;
        }
    });

/// -------------------------------
// ENTER PARA PULAR ENTRE CAMPOS (TAB SIMULADO) — IGNORA READONLY + SELECIONA CONTEÚDO
// -------------------------------
document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;

    e.preventDefault(); // impede o comportamento padrão (ex: envio de formulário)

    // Pega apenas inputs visíveis e editáveis (ignora readonly e disabled)
    const allInputs = Array.from(document.querySelectorAll('input'))
        .filter(inp => {
            const style = window.getComputedStyle(inp);
            const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && inp.type !== 'hidden';
            return isVisible && !inp.disabled && !inp.readOnly;
        });

    if (allInputs.length === 0) return;

    const active = document.activeElement;
    let idx = allInputs.indexOf(active);

    // Se o campo atual não estiver na lista, foca o primeiro
    if (idx === -1) {
        allInputs[0].focus();
        allInputs[0].select();
        return;
    }

    // Move para o próximo campo (volta ao primeiro se for o último)
    const nextIndex = (idx + 1) % allInputs.length;
    const next = allInputs[nextIndex];

    // Foca e seleciona o texto do próximo campo
    next.focus();
    setTimeout(() => next.select(), 50); // pequeno atraso pra garantir que o foco esteja ativo
});


    
}

