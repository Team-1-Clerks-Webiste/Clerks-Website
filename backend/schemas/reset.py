import sqlite3
import json

DB_PATH = "clerksdb.db"
SQL_PATH = "backend/schemas/shoe.sql"


def seed():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    with open(SQL_PATH) as f:
        cur.executescript(f.read())

    cur.execute("DELETE FROM shoes")

    # for p in products:
    #     cur.execute(
    #         """
    #         INSERT INTO shoes (name, category, price, gender, style)
    #         VALUES (?, ?, ?, ?, ?)
    #         """,
    #         (p["name"], p["category"], p["price"], p["gender"], p["style"]),
    #     )

    con.commit()
    con.close()
    # print(f"Seeded {len(products)} products into {DB_PATH}")


if __name__ == "__main__":
    print("ARE YOU SURE YOU WANT TO RESET THE DATABASE (LOCAL)")
    if input() == 'y':
        seed()
    else:
        print("Aborting.")