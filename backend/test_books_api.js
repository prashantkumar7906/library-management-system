const fetch = require('node-fetch');

async function testApi() {
    try {
        const response = await fetch('http://localhost:5000/api/books');
        const data = await response.json();
        console.log('API Status:', response.status);
        if (response.status === 500) {
            console.log('Error Details:', data.details);
        }
        console.log('Total books returned:', data.books ? data.books.length : 0);
        if (data.books && data.books.length > 0) {
            console.log('First book:', data.books[0].title);
        }
    } catch (error) {
        console.error('API Test Failed:', error);
    }
}

testApi();
