const axios = require('axios');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: 1 }, 'secret_key'); // Mock token, may fail if project uses a different secret. Let's see.

axios.get('http://localhost:5000/api/dashboard/export-stats', {
    headers: { Authorization: `Bearer ${token}` }
}).then(console.log).catch(e => {
    if (e.response) {
        console.error("STATUS:", e.response.status, "DATA:", e.response.data);
    } else {
        console.error(e.message);
    }
});
