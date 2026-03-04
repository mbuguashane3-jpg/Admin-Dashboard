
import fetch from 'node-fetch';

async function test() {
    try {
        const addRes = await fetch('http://localhost:3000/api/executive/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Product',
                category: 'Testing',
                status: 'Healthy',
                traction: 'New Entry'
            })
        });
        const addResult = await addRes.json();
        console.log('Add Result:', addResult);

        const getRes = await fetch('http://localhost:3000/api/executive');
        const getResult = await getRes.json();
        console.log('Get Result Products Length:', getResult.products.length);
        console.log('Last Product:', getResult.products[getResult.products.length - 1]);
    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

test();
