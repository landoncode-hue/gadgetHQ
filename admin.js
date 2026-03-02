document.addEventListener('DOMContentLoaded', () => {
    // Helper to convert File to Base64 for serverless upload
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });

    const loginScreen = document.getElementById('login-screen');
    const pinInput = document.getElementById('admin-pin');
    const loginBtn = document.getElementById('login-btn');
    const inventoryBody = document.getElementById('inventory-body');
    const addItemBtn = document.getElementById('add-item-btn');
    const crudModal = document.getElementById('crud-modal');
    const closeModal = document.getElementById('close-modal');
    const gadgetForm = document.getElementById('gadget-form');

    let fieldNames = {
        name: 'Name',
        price: 'Price',
        image: 'Image',
        status: 'Status'
    };

    // Check for existing session
    if (sessionStorage.getItem('admin_pin')) {
        loginScreen.classList.add('hidden');
        fetchInventory();
    }

    const statusMsg = document.getElementById('form-status-msg');
    const loginError = document.getElementById('login-error');

    function showStatus(message, type, duration = 3000) {
        statusMsg.textContent = message;
        statusMsg.className = `form-status ${type}`;
        statusMsg.style.display = 'block';

        if (duration > 0) {
            setTimeout(() => {
                if (statusMsg.textContent === message) {
                    statusMsg.style.display = 'none';
                    statusMsg.className = 'form-status';
                }
            }, duration);
        }
    }

    // Simple Login logic
    loginBtn.addEventListener('click', async () => {
        const response = await fetch(CONFIG.API.VALIDATE_PIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: pinInput.value })
        });
        const result = await response.json();

        if (result.success) {
            sessionStorage.setItem('admin_pin', pinInput.value);
            loginScreen.classList.add('hidden');
            fetchInventory();
        } else {
            loginError.style.display = 'block';
        }
    });

    pinInput.addEventListener('input', () => {
        loginError.style.display = 'none';
    });

    // Image Upload Logic
    async function uploadToImgBB(file) {
        if (!CONFIG.IMGBB_API_KEY || CONFIG.IMGBB_API_KEY === 'YOUR_IMGBB_API_KEY') {
            throw new Error('Please configure your ImgBB API Key in config.js');
        }

        const statusEl = document.getElementById('upload-status');
        statusEl.textContent = 'Uploading image...';

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(CONFIG.API.UPLOAD_IMAGE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-PIN': sessionStorage.getItem('admin_pin')
                },
                body: JSON.stringify({ image: await toBase64(file) })
            });
            const data = await response.json();
            if (data.success) {
                statusEl.textContent = 'Upload successful!';
                statusEl.style.color = 'green';
                // Using display_url as it often provides a more reliable direct link
                return data.data.display_url || data.data.url;
            } else {
                throw new Error(data.error.message);
            }
        } catch (err) {
            statusEl.textContent = 'Upload failed: ' + err.message;
            statusEl.style.color = 'red';
            showStatus('Image upload failed: ' + err.message, 'error');
            throw err;
        }
    }

    // Airtable Fetching
    async function fetchInventory() {
        try {
            const response = await fetch(CONFIG.API.GET_GADGETS);
            const data = await response.json();
            renderInventory(data.records);
        } catch (err) {
            console.error(err);
            inventoryBody.innerHTML = '<tr><td colspan="5">Error fetching data. Check Console.</td></tr>';
        }
    }

    function renderInventory(records) {
        if (records.length > 0) {
            const firstFields = Object.keys(records[0].fields);
            // Auto-detect correct field names (favoring whatever is actually in the record)
            if (firstFields.includes('Name')) fieldNames.name = 'Name';
            if (firstFields.includes('Price')) fieldNames.price = 'Price';
            if (firstFields.includes('Image')) fieldNames.image = 'Image';
            if (firstFields.includes('Status')) fieldNames.status = 'Status';

            // Re-verify lowercase if that's what's actually there
            if (firstFields.includes('name')) fieldNames.name = 'name';
            if (firstFields.includes('price')) fieldNames.price = 'price';
            if (firstFields.includes('image')) fieldNames.image = 'image';
            if (firstFields.includes('status')) fieldNames.status = 'status';
        }

        inventoryBody.innerHTML = '';
        records.forEach(rec => {
            const row = document.createElement('tr');
            const imgUrl = getImageUrl(rec.fields, fieldNames.image);
            row.innerHTML = `
                <td><img src="${imgUrl}" class="img-preview" onerror="this.src='https://placehold.co/60'"></td>
                <td>${rec.fields[fieldNames.name] || 'Unnamed Gadget'}</td>
                <td>₦${(rec.fields[fieldNames.price] || 0).toLocaleString()}</td>
                <td><span class="badge">${rec.fields[fieldNames.status] || 'No Status'}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editItem('${rec.id}')">Edit</button>
                    <button class="btn btn-secondary btn-sm" onclick="deleteItem('${rec.id}')">Delete</button>
                </td>
            `;
            inventoryBody.appendChild(row);
        });
    }

    // Helper to extract image URL from either a string or an Airtable Attachment array
    function getImageUrl(fields, fieldName) {
        const val = fields[fieldName] || fields.Image || fields.image;
        if (!val) return '';
        if (Array.isArray(val) && val.length > 0) {
            // If it's an Airtable Attachment field
            return val[0].url || val[0].thumbnails?.large?.url || '';
        }
        return typeof val === 'string' ? val : '';
    }

    // CRUD Operations
    addItemBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add New Gadget';
        document.getElementById('edit-id').value = '';
        statusMsg.style.display = 'none';
        gadgetForm.reset();
        crudModal.classList.add('active');
    });

    closeModal.addEventListener('click', () => {
        document.getElementById('p-file').value = '';
        document.getElementById('upload-status').textContent = '';
        statusMsg.style.display = 'none';
        crudModal.classList.remove('active');
    });

    gadgetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        const fileInput = document.getElementById('p-file');
        let imageUrl = document.getElementById('p-image').value;

        // Upload if file is selected
        if (fileInput.files.length > 0) {
            try {
                imageUrl = await uploadToImgBB(fileInput.files[0]);
            } catch (err) {
                return; // Stop if upload fails
            }
        }

        if (!imageUrl) {
            showStatus('Please provide an image URL or upload a file.', 'error');
            return;
        }

        showStatus('Saving...', 'success', 0);

        const statusValue = document.getElementById('p-status').value;
        const payload = {
            fields: {}
        };

        // Use detected field names for the payload
        payload.fields[fieldNames.name] = document.getElementById('p-name').value;
        payload.fields[fieldNames.price] = parseInt(document.getElementById('p-price').value);
        payload.fields[fieldNames.image] = imageUrl;
        payload.fields[fieldNames.status] = statusValue;

        const method = id ? 'PATCH' : 'POST';
        const url = id ? `${CONFIG.API.UPDATE_GADGET}/${id}` : CONFIG.API.CREATE_GADGET;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-PIN': sessionStorage.getItem('admin_pin')
                },
                body: JSON.stringify(id ? { fields: payload.fields } : { records: [payload] })
            });

            if (response.ok) {
                showStatus('Product Saved Successfully!', 'success', 0);
                setTimeout(() => {
                    crudModal.classList.remove('active');
                    fetchInventory();
                }, 1500);
            } else {
                const errData = await response.json().catch(() => ({ error: { message: 'Unknown Server Error' } }));
                console.error('Save Error:', errData);
                const errorMsg = errData.error?.message || errData.message || 'Unknown Error';

                if (response.status === 401) {
                    showStatus('Session expired or unauthorized. Please log in again.', 'error', 0);
                    sessionStorage.removeItem('admin_pin');
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    showStatus(`Error: ${errorMsg}`, 'error', 0);
                }
            }
        } catch (err) {
            showStatus('Connection Error: ' + err.message, 'error', 0);
        }
    });

    window.editItem = async (id) => {
        // Fetch specific item through proxy (or just use local state, but fetching is more reliable)
        const response = await fetch(`${CONFIG.API.GET_GADGETS}/${id}`);
        const rec = await response.json();

        document.getElementById('edit-id').value = rec.id;
        document.getElementById('p-name').value = rec.fields[fieldNames.name] || '';
        document.getElementById('p-price').value = rec.fields[fieldNames.price] || 0;
        document.getElementById('p-image').value = getImageUrl(rec.fields, fieldNames.image);
        document.getElementById('p-status').value = rec.fields[fieldNames.status] || 'Available';
        document.getElementById('p-file').value = '';
        document.getElementById('upload-status').textContent = '';

        document.getElementById('modal-title').textContent = 'Edit Gadget';
        crudModal.classList.add('active');
    };

    window.deleteItem = async (id) => {
        if (!confirm('Are you sure?')) return;
        await fetch(`${CONFIG.API.DELETE_GADGET}/${id}`, {
            method: 'DELETE',
            headers: {
                'X-Admin-PIN': sessionStorage.getItem('admin_pin')
            }
        });
        fetchInventory();
    };
});
