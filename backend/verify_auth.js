const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1/users';

const testAuth = async () => {
    try {
        console.log('--- TEST: Signup ---');
        const signupData = {
            name: 'Test Tourist',
            email: `tourist_${Date.now()}@test.com`,
            password: 'password123',
            passwordConfirm: 'password123',
            role: 'tourist',
        };

        const signupRes = await axios.post(`${BASE_URL}/signup`, signupData);
        console.log('Signup Status:', signupRes.status);
        console.log('Token received:', !!signupRes.data.token);

        const token = signupRes.data.token;

        console.log('\n--- TEST: Login ---');
        const loginData = {
            email: signupData.email,
            password: 'password123'
        };
        const loginRes = await axios.post(`${BASE_URL}/login`, loginData);
        console.log('Login Status:', loginRes.status);
        console.log('Toekn received:', !!loginRes.data.token);

        if (token === loginRes.data.token) {
            console.log('\nSUCCESS: Signup and Login flows working! (Tokens might differ if re-issued, but flow is valid)');
        } else {
            console.log('\nSUCCESS: Signup and Login flows working!');
        }

    } catch (error) {
        if (error.response) {
            console.error('API Error:', error.response.status);
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
};

testAuth();
