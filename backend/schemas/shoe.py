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
    con.commit()
    con.close()

