from pony.orm import Database, PrimaryKey, Required, Optional, Set


db = Database()


class Network(db.Entity):
    id = PrimaryKey(int, auto=True)
    name = Required(str)
    cidr = Required(str, unique=True)
    description = Optional(str)
    ip_addresses = Set("IPAddress")


class IPAddress(db.Entity):
    id = PrimaryKey(int, auto=True)
    address = Required(str, unique=True)
    status = Required(str, default="free")
    hostname = Optional(str)
    network = Required(Network)


db.bind(
    provider="sqlite",
    filename="database.sqlite",
    create_db=True
)

db.generate_mapping(create_tables=True)