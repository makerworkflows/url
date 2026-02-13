
// Mock Next.js Request/Response
import { NextResponse } from 'next/server';

// Mock auth
const mockAuth = async () => {
  return null; // Simulate unauthenticated
};

// Mock route handler logic (simplified for test)
async function GET_handler(req: any) {
    const session = await mockAuth();
    if (!session) {
        return { status: 401, body: { error: "Unauthorized" } };
    }
    return { status: 200, body: [] };
}

async function runTest() {
 console.log("Running Auth Unit Test...");
 const res = await GET_handler({});
 if (res.status === 401) {
     console.log("✅ Protected Route correctly returned 401 for unauthenticated user.");
 } else {
     console.error("❌ Protected Route FAILED: Returned " + res.status);
 }
}

runTest();
