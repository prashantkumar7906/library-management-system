const API_URL = 'http://localhost:5000/api';

async function verify() {
    try {
        console.log('--- Phase 1: Login as Admin ---');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'libadmin@library.com',
                password: 'admin123'
            })
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) throw new Error(`Login failed: ${JSON.stringify(loginData)}`);

        const token = loginData.token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        console.log('Login successful');

        console.log('\n--- Phase 2: Create New User ---');
        const userRes = await fetch(`${API_URL}/admin/users`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                full_name: 'Verification User',
                email: `verify_${Date.now()}@example.com`,
                phone: '1234567890',
                password: 'User@123',
                role: 'MEMBER',
                batch: 'MORNING'
            })
        });
        const userData = await userRes.json();
        console.log('User creation status:', userRes.status, userData.message || userData.error);

        console.log('\n--- Phase 3: Add New Book ---');
        const bookRes = await fetch(`${API_URL}/books`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                title: 'Automated Verification Guide',
                author: 'Antigravity AI',
                isbn: 'VERIFY-123',
                genre: 'Technical',
                total_copies: 5
            })
        });
        const bookData = await bookRes.json();
        console.log('Book addition status:', bookRes.status, bookData.message || bookData.error);

        console.log('\n--- Phase 4: Check Audit Logs ---');
        const logsRes = await fetch(`${API_URL}/admin/audit-logs?limit=5`, { headers });
        const logsData = await logsRes.json();

        if (!logsRes.ok) throw new Error(`Fetch logs failed: ${JSON.stringify(logsData)}`);

        console.log('Recent Audit Logs:');
        logsData.logs.forEach(log => {
            console.log(`- [${log.action}] by ${log.user_name} (ID: ${log.performed_by}) at ${log.created_at}`);
        });

        console.log('\nVerification completed successfully!');
    } catch (error) {
        console.error('Verification failed:', error.message);
    }
}

verify();
