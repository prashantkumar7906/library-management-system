const fetch = require('node-fetch');

async function verify() {
    const adminEmail = 'libadmin@library.com';
    const adminPassword = 'admin123';
    const baseUrl = 'http://localhost:5000/api';

    try {
        console.log('--- Phase 1: Login as Admin ---');
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: adminPassword })
        });
        const loginData = await loginRes.json();

        if (!loginData.token) {
            console.error('Login failed:', loginData);
            return;
        }
        console.log('Login successful');
        const token = loginData.token;

        console.log('\n--- Phase 2: Verify Payment History API ---');
        const paymentsRes = await fetch(`${baseUrl}/admin/payments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const paymentsData = await paymentsRes.json();
        console.log('Payments fetch status:', paymentsRes.status);
        console.log('Number of payments found:', paymentsData.payments?.length || 0);

        if (paymentsData.payments && paymentsData.payments.length > 0) {
            const firstId = paymentsData.payments[0].payment_id;
            console.log(`\n--- Phase 3: Verify Receipt API for ID ${firstId} ---`);
            const receiptRes = await fetch(`${baseUrl}/admin/payments/${firstId}/receipt`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const receiptData = await receiptRes.json();
            console.log('Receipt fetch status:', receiptRes.status);
            console.log('Receipt data user name:', receiptData.receipt?.full_name);
        }

    } catch (error) {
        console.error('Verification script error:', error);
    }
}

verify();
