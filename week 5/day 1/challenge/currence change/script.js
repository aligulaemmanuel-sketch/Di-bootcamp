const apiKey = 'YOUR_API_KEY'; // Ensure this is a valid key from exchangerate-api.com
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const amountInput = document.getElementById('amount');
const resultText = document.getElementById('result-text');
const fromFlag = document.getElementById('from-flag');
const toFlag = document.getElementById('to-flag');
const convertBtn = document.getElementById('convert-btn');
const switchBtn = document.getElementById('switch-btn');

function updateFlag(element, currencyCode) {
    // Mapping for common currencies that don't match the 2-letter country code rule
    const customMappings = {
        'EUR': 'EU',
        'BTC': 'US', // Placeholder or generic
        'ANG': 'NL'
    };

    const countryCode = customMappings[currencyCode] || currencyCode.substring(0, 2);
    element.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
    element.onerror = () => element.src = 'https://flagsapi.com/US/flat/64.png'; // Fallback flag
}

// 3. Core Logic
async function loadCurrencies() {
    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/codes`);
        if (!response.ok) throw new Error('Failed to fetch currency codes');
        
        const data = await response.json();
        const codes = data.supported_codes;

        codes.forEach(([code, name]) => {
            const option1 = new Option(`${code} - ${name}`, code);
            const option2 = new Option(`${code} - ${name}`, code);
            fromCurrency.add(option1);
            toCurrency.add(option2);
        });

        // Default values
        fromCurrency.value = 'USD';
        toCurrency.value = 'ILS';
        updateFlag(fromFlag, 'USD');
        updateFlag(toFlag, 'ILS');
        
        // Perform initial conversion once currencies are loaded
        handleConvert();
    } catch (error) {
        resultText.innerText = "Error loading currencies. Check API key.";
    }
}

async function handleConvert() {
    const from = fromCurrency.value;
    const to = toCurrency.value;
    const amount = amountInput.value || 1; // Default to 1 if empty

    if (!from || !to) return; // Prevent calling if codes aren't loaded yet

    resultText.innerText = "Converting...";
    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}/${amount}`);
        if (!response.ok) throw new Error('Conversion failed');        
        const data = await response.json();
        
        resultText.innerText = `${amount} ${from} = ${data.conversion_result.toFixed(2)} ${to}`;
    } catch (error) {
        resultText.innerText = "Error fetching rates.";
    }
}

function handleSwitch() {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    
    updateFlag(fromFlag, fromCurrency.value);
    updateFlag(toFlag, toCurrency.value);
    handleConvert(); 
}

// 4. Event Listeners
convertBtn.addEventListener('click', handleConvert);
switchBtn.addEventListener('click', handleSwitch);
fromCurrency.addEventListener('change', () => updateFlag(fromFlag, fromCurrency.value));
toCurrency.addEventListener('change', () => updateFlag(toFlag, toCurrency.value));
amountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleConvert();
});

// Initialize
loadCurrencies();