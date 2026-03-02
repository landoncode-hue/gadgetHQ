document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const progressFill = document.getElementById('progress-fill');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-to-whatsapp');
    const productGrid = document.querySelector('.options-grid'); // Step 1 grid

    let currentStep = 1;
    const totalSteps = 4;
    let inventory = [];

    const formData = {
        product: '20,000mAh Power Bank',
        state: '',
        city: '',
        deal: '2 Power Banks - N26,000 (Save N2,000)',
        fullname: '',
        whatsapp: '',
        payment: 'Transfer'
    };

    // Airtable Fetching
    async function init() {
        try {
            const response = await fetch(CONFIG.API.GET_GADGETS);
            const data = await response.json();
            inventory = data.records
                .map(r => {
                    const f = r.fields || {};
                    return {
                        id: r.id,
                        name: f.Name || f.name || 'Unnamed Gadget',
                        price: f.Price || f.price || 0,
                        image: getImageUrl(f),
                        status: f.Status || f.status || 'Available',
                        description: f.Description || f.description || ''
                    };
                })
                .filter(item => {
                    const s = item.status.toLowerCase();
                    return s === 'available' || s === 'in stock';
                });
            if (inventory.length > 0) renderDynamicProducts();
        } catch (err) {
            console.error('Airtable fetch failed:', err);
            const grid = document.getElementById('product-grid-main');
            if (grid) {
                grid.innerHTML = '<div class="error-state">Failed to load products. Please refresh the page to try again.</div>';
            }
        }
    }

    // Helper to extract image URL from either a string or an Airtable Attachment array
    function getImageUrl(fields) {
        const val = fields.Image || fields.image;
        if (!val) return '';
        if (Array.isArray(val) && val.length > 0) {
            return val[0].url || val[0].thumbnails?.large?.url || '';
        }
        return typeof val === 'string' ? val : '';
    }

    function renderDynamicProducts() {
        const productGridMain = document.getElementById('product-grid-main');
        if (productGrid) productGrid.innerHTML = '';
        if (productGridMain) productGridMain.innerHTML = '';

        inventory.forEach((item, index) => {
            const name = item.name;
            const price = item.price;
            const image = item.image;

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img class="product-img" src="${image}" alt="${name}" onerror="this.src='https://placehold.co/300x300?text=Gadget'">
                <div class="product-info">
                    <h3>${name}</h3>
                    <p class="price">₦${price.toLocaleString()}</p>
                    <button class="btn btn-primary select-btn" onclick="selectProduct('${name}', '${price}')">Order Now</button>
                </div>
            `;
            if (productGrid) {
                const step1Card = card.cloneNode(true);
                step1Card.querySelector('.select-btn').onclick = () => {
                    formData.product = name;
                    formData.deal = `1 Unit - ₦${price.toLocaleString()}`;
                    goToStep(2);
                };
                productGrid.appendChild(step1Card);
            }
            if (productGridMain && index < 4) productGridMain.appendChild(card);
        });
    }

    window.selectProduct = (name, price) => {
        formData.product = name;
        formData.deal = `1 Unit - ₦${parseInt(price).toLocaleString()}`;
        document.getElementById('qualification-form').scrollIntoView({ behavior: 'smooth' });
        goToStep(2);
    };

    function goToStep(step) {
        steps.forEach(s => s.classList.remove('active'));
        document.querySelector(`[data-step="${step}"]`).classList.add('active');
        currentStep = step;
        updateProgress();
        updateHeader();
    }

    function updateProgress() {
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressFill.style.width = `${progress}%`;
    }

    function updateHeader() {
        const titles = [
            'Select Your Gadget',
            'Delivery Information',
            'Order Summary',
            'Confirm Order'
        ];
        formTitle.textContent = titles[currentStep - 1];
    }

    // Event Listeners
    nextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                goToStep(currentStep + 1);
                if (currentStep === 3) populateSummary();
            }
        });
    });

    prevButtons.forEach(btn => {
        btn.addEventListener('click', () => goToStep(currentStep - 1));
    });

    function validateStep(step) {
        if (step === 2) {
            const state = document.getElementById('p-state').value;
            const city = document.getElementById('p-city').value;
            if (!state || !city) {
                alert('Please fill in delivery details.');
                return false;
            }
            formData.state = state;
            formData.city = city;
        }
        return true;
    }

    function populateSummary() {
        const summaryGrid = document.querySelector('.summary-grid');
        summaryGrid.innerHTML = `
            <div class="summary-item"><strong>Product:</strong> ${formData.product}</div>
            <div class="summary-item"><strong>Deal:</strong> ${formData.deal}</div>
            <div class="summary-item"><strong>Delivery:</strong> ${formData.city}, ${formData.state}</div>
        `;
    }

    submitBtn.addEventListener('click', () => {
        const name = document.getElementById('p-name').value;
        const phone = document.getElementById('p-phone').value;
        const payment = document.querySelector('input[name="payment"]:checked')?.value || 'Transfer';

        if (!name || !phone) {
            alert('Please provide your name and WhatsApp number.');
            return;
        }

        formData.fullname = name;
        formData.whatsapp = phone;
        formData.payment = payment;

        sendToWhatsApp();
    });

    function sendToWhatsApp() {
        const businessNumber = "2348106337016";
        const message = `Hi GadgetHQ,\n\nI want to order:\n*Product:* ${formData.product}\n*Option:* ${formData.deal}\n*Location:* ${formData.city}, ${formData.state}\n*Payment Method:* ${formData.payment}\n\n*Name:* ${formData.fullname}\n*Phone:* ${formData.whatsapp}\n\nPlease confirm availability and next steps.`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    }

    init();
});
