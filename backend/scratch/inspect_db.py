from sqlalchemy import create_engine, inspect
import os

db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "sabay_bbq.db"))
print(f"DB Path: {db_path}")
if os.path.exists(db_path):
    engine = create_engine(f"sqlite:///{db_path}")
    inspector = inspect(engine)
    for table_name in inspector.get_table_names():
        print(f"\nTable: {table_name}")
        for column in inspector.get_columns(table_name):
            print(f" - {column['name']}: {column['type']}")
else:
    print("Database file does not exist!")
