import sqlite3

def init_shoes_table():
    con = sqlite3.connect("clerksdb.db")
    cur = con.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS shoes(
            ID INTEGER PRIMARY KEY  AUTOINCREMENT,
            NAME           TEXT    NOT NULL,
            PRICE          INTEGER    NOT NULL,
            CATEGORY         TEXT    NOT NULL,
            STYLE          TEXT    NOT NULL,
            COLOR          TEXT    NOT NULL,
            MATERIAL       TEXT    NOT NULL
        );
        """
    )

def seed_shoes():
    con = sqlite3.connect("clerksdb.db")
    cur = con.cursor()
    cur.executemany("""
        INSERT INTO shoes (NAME, PRICE, CATEGORY, STYLE, COLOR, MATERIAL)
        VALUES (?, ?, ?, ?, ?, ?)
    """, [
        ("Air Max", 120, "Sneakers", "Low Top", "White", "Leather"),
        ("Timberland Boot", 150, "Boots", "High Top", "Brown", "Suede"),
        ("Stan Smith", 90, "Sneakers", "Low Top", "White", "Canvas"),
        ("Jordan 1", 180, "Sneakers", "High Top", "Red", "Leather"),
    ])
    con.commit()
    con.close()

