const http = require('http');

const data = JSON.stringify({
    name: 'Test Registration',
    email: 'testreg@dkhoul.com',
    password: 'password123',
    passwordConfirm: 'password123',
    role: 'tourist'
});

const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/users/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('📡 Sending Registration Request...');
console.log('Payload:', data);

const req = http.request(options, (res) => {
    console.log(`\n🔙 Status Code: ${res.statusCode}`);

    let body = '';

    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:', body);

        try {
            const parsed = JSON.parse(body);
            if (parsed.status === 'success') {
                console.log('\n✅ REGISTRATION SUCCESSFUL!');
                console.log('Saved User:', parsed.data.user);

                if (parsed.data.user.email === 'testreg@dkhoul.com') {
                    console.log('✅ Email matches!');
                } else {
                    console.error('❌ Email MISMATCH! Saved:', parsed.data.user.email);
                }
            } else {
                console.error('\n❌ REGISTRATION FAILED:', parsed.message);
            }
        } catch (e) {
            console.error('Failed to parse response JSON');
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request Error:', error);
});

req.write(data);
req.end();
