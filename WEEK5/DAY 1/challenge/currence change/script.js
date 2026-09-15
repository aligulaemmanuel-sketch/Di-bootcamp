const apiKey = 'a16d5a9765757af44534a2cd'; // Exchange Rate API key
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const amountInput = document.getElementById('amount');
const resultText = document.getElementById('result-text');
const errorMessage = document.getElementById('error-message');
const loadingSpinner = document.getElementById('loading-spinner');
const fromFlag = document.getElementById('from-flag');
const toFlag = document.getElementById('to-flag');
const convertBtn = document.getElementById('convert-btn');
const switchBtn = document.getElementById('switch-btn');

let isConverting = false;

function updateFlag(element, currencyCode) {
    // Mapping for common currencies that don't match the 2-letter country code rule
    const customMappings = {
        'EUR': 'EU',
        'BTC': 'US', // Placeholder or generic
        'ANG': 'NL',
        'XAU': 'US', // Gold
        'XAG': 'US'  // Silver
    };

    const countryCode = customMappings[currencyCode] || currencyCode.substring(0, 2);
    element.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
    element.onerror = () => element.src = 'https://flagsapi.com/UN/flat/64.png'; // Fallback flag
}

function clearMessages() {
    resultText.textContent = '';
    resultText.classList.remove('success', 'error');
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
    loadingSpinner.style.display = 'none';
}

function showLoading() {
    clearMessages();
    loadingSpinner.style.display = 'block';
    convertBtn.disabled = true;
}

function showError(message) {
    clearMessages();
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    resultText.classList.add('error');
    convertBtn.disabled = false;
}

function showResult(result) {
    clearMessages();
    resultText.textContent = result;
    resultText.classList.add('success');
    convertBtn.disabled = false;
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
    convertBtn.disabled = false;
}

function validateAmount(amount) {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
        return false;
    }
    return true;
}

// Core Logic
async function loadCurrencies() {
    try {
        showLoading();
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/codes`);
        if (!response.ok) throw new Error('Failed to fetch currency codes');
        
        const data = await response.json();
        const codes = data.supported_codes;

        codes.forEach(([code, name]) => {
            // Format: "Country Name (CURRENCY_CODE)"
            const displayText = `${name} (${code})`;
            const option1 = new Option(displayText, code);
            const option2 = new Option(displayText, code);
            fromCurrency.add(option1);
            toCurrency.add(option2);
        });

        // Default values
        fromCurrency.value = 'USD';
        toCurrency.value = 'ILS';
        updateFlag(fromFlag, 'USD');
        updateFlag(toFlag, 'ILS');
        
        // Perform initial conversion once currencies are loaded
        hideLoading();
        handleConvert();
    } catch (error) {
        showError("Error loading currencies. Please check your internet connection.");
        console.error('Error loading currencies:', error);
    }
}

async function handleConvert() {
    const from = fromCurrency.value;
    const to = toCurrency.value;
    const amount = amountInput.value || 1;

    if (!from || !to) return;

    // Validate amount
    if (!validateAmount(amount)) {
        showError("Please enter a valid amount greater than 0");
        return;
    }

    if (isConverting) return;
    isConverting = true;

    showLoading();
    
    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}/${amount}`);
        
        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Too many requests. Please wait a moment and try again.');
            }
            throw new Error('Conversion failed');
        }
        
        const data = await response.json();
        
        if (data.result === 'error') {
            throw new Error(data['error-type'] || 'Unknown error occurred');
        }
        
        const result = `${parseFloat(amount)} ${from} = ${data.conversion_result.toFixed(2)} ${to}`;
        showResult(result);
    } catch (error) {
        console.error('Conversion error:', error);
        showError(`Error: ${error.message || 'Unable to fetch conversion rates'}`);
    } finally {
        isConverting = false;
    }
}

function handleSwitch() {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    
    updateFlag(fromFlag, fromCurrency.value);
    updateFlag(toFlag, toCurrency.value);
    
    // Perform conversion with new currencies
    if (resultText.textContent) {
        handleConvert();
    }
}

// Event Listeners
convertBtn.addEventListener('click', handleConvert);
switchBtn.addEventListener('click', handleSwitch);
fromCurrency.addEventListener('change', () => {
    updateFlag(fromFlag, fromCurrency.value);
    if (resultText.textContent) {
        handleConvert();
    }
});
toCurrency.addEventListener('change', () => {
    updateFlag(toFlag, toCurrency.value);
    if (resultText.textContent) {
        handleConvert();
    }
});
amountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleConvert();
    }
});

amountInput.addEventListener('input', () => {
    // Real-time conversion as user types (optional - only if a result is already shown)
    if (resultText.textContent && !isConverting) {
        // Debounce the conversion
        clearTimeout(amountInput.conversionTimeout);
        amountInput.conversionTimeout = setTimeout(() => {
            handleConvert();
        }, 500);
    }
});

// Initialize
loadCurrencies();