import urllib.request
import urllib.parse
import json
import sys

# Ensure UTF-8 output on Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_endpoint(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    req_data = None
    if data:
        req_data = json.dumps(data).encode('utf-8')
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.status
            body = response.read().decode('utf-8')
            return status, json.loads(body) if body else None
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        return e.code, body
    except Exception as e:
        return 0, str(e)

def run_tests():
    base_url = "http://localhost:3001"
    
    # Test 1: Get Categories
    print("Testing GET /api/categories...")
    status, res = test_endpoint(f"{base_url}/api/categories")
    print(f"Status: {status}, Response: {res}")
    
    # Test 2: Get Menu
    print("\nTesting GET /api/menu...")
    status, res = test_endpoint(f"{base_url}/api/menu")
    print(f"Status: {status}, Response length: {len(res) if isinstance(res, list) else 'N/A'}")
    
    # Test 3: Verify Staff PIN
    print("\nTesting POST /api/staff/pin/verify with valid PIN...")
    status, res = test_endpoint(f"{base_url}/api/staff/pin/verify", method="POST", data={"pin": "888888"})
    print(f"Status: {status}, Response: {res}")
    token = None
    if isinstance(res, dict) and "access_token" in res:
        token = res["access_token"]
        
    print("\nTesting POST /api/staff/pin/verify with invalid PIN...")
    status, res = test_endpoint(f"{base_url}/api/staff/pin/verify", method="POST", data={"pin": "123456"})
    print(f"Status: {status}, Response: {res}")
    
    # Test 4: Get Orders without Token
    print("\nTesting GET /api/orders without JWT...")
    status, res = test_endpoint(f"{base_url}/api/orders")
    print(f"Status: {status}, Response: {res}")
    
    # Test 5: Get Orders with Token
    if token:
        print("\nTesting GET /api/orders with JWT...")
        status, res = test_endpoint(f"{base_url}/api/orders", headers={"Authorization": f"Bearer {token}"})
        print(f"Status: {status}, Response length: {len(res) if isinstance(res, list) else 'N/A'}")

        # Test 6: Get Ingredients with Token
        print("\nTesting GET /api/ingredients with JWT...")
        status, res = test_endpoint(f"{base_url}/api/ingredients", headers={"Authorization": f"Bearer {token}"})
        print(f"Status: {status}, Response length: {len(res) if isinstance(res, list) else 'N/A'}")
    else:
        print("\nSkipping authenticated endpoints tests due to missing token.")

if __name__ == "__main__":
    run_tests()
