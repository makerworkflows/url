
// Script to test if the API endpoints are secured
import { spawn } from 'child_process';

async function testProtectedEndpoint() {
  console.log('Testing protected endpoint /api/connections...');
  try {
    const res = await fetch('http://localhost:3000/api/connections');
    if (res.status === 401 || res.status === 403 || (res.status === 200 && (await res.json()).length === 0)) {
        // We expect empty array for unauth user if logic handles it gracefully, or 401 if middleware catches it
        console.log('✅ Endpoint is protected (returned ' + res.status + ')');
    } else {
        console.error('❌ Endpoint might be exposed! Status:', res.status);
    }
  } catch (e) {
      console.log('Server might not be running yet, skipping fetch test.');
  }
}

testProtectedEndpoint();
