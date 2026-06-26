from cryptography.fernet import Fernet
import os
import sys
from dotenv import load_dotenv

load_dotenv()

# In a real enterprise app, the key should be managed securely (e.g., Windows Key Manager)
# For this implementation, we use an environment variable or a fallback for the .exe
ENCRYPTION_KEY = os.getenv("SABAY_ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    # Generate a persistent key if not exists (simplified for standalone demo)
    if getattr(sys, 'frozen', False):
        BASE_DIR = os.path.dirname(sys.executable)
    else:
        BASE_DIR = os.path.dirname(__file__)
    KEY_FILE = os.path.join(BASE_DIR, "data", ".key")
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE, "rb") as f:
            ENCRYPTION_KEY = f.read()
    else:
        ENCRYPTION_KEY = Fernet.generate_key()
        if not os.path.exists(os.path.dirname(KEY_FILE)):
            os.makedirs(os.path.dirname(KEY_FILE))
        with open(KEY_FILE, "wb") as f:
            f.write(ENCRYPTION_KEY)

cipher_suite = Fernet(ENCRYPTION_KEY)

def encrypt_data(data: str) -> str:
    if not data: return data
    return cipher_suite.encrypt(data.encode()).decode()

def decrypt_data(encrypted_data: str) -> str:
    if not encrypted_data: return encrypted_data
    try:
        return cipher_suite.decrypt(encrypted_data.encode()).decode()
    except:
        return encrypted_data # Fallback to original if not encrypted
