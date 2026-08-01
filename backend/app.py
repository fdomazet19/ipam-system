import ipaddress

from flask import Flask, jsonify, render_template, request
from pony.orm import db_session

from models import Network, IPAddress


app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/networks")
def networks_page():
    return render_template("networks.html")
@app.route("/ip-addresses")
def ip_addresses_page():
    
    return render_template("ip_addresses.html")
@app.route("/validate")
def validate_page():
    return render_template("validate.html")

@app.route("/api/networks", methods=["GET"])
@db_session
def get_networks():
    networks = Network.select()[:]

    data = []

    for network in networks:
        data.append({
            "id": network.id,
            "name": network.name,
            "cidr": network.cidr,
            "description": network.description
        })

    return jsonify(data)


@app.route("/api/networks", methods=["POST"])
@db_session
def add_network():
    data = request.get_json()

    if data is None:
        return jsonify({
            "error": "Podaci moraju biti poslani u JSON formatu."
        }), 400

    name = data.get("name")
    cidr = data.get("cidr")
    description = data.get("description", "")

    if not name or not cidr:
        return jsonify({
            "error": "Polja 'name' i 'cidr' su obavezna."
        }), 400

    network = Network(
        name=name,
        cidr=cidr,
        description=description
    )

    return jsonify({
        "message": "Mreza je uspjesno dodana.",
        "network": {
            "id": network.id,
            "name": network.name,
            "cidr": network.cidr,
            "description": network.description
        }
    }), 201


@app.route("/api/networks/<int:network_id>", methods=["DELETE"])
@db_session
def delete_network(network_id):
    network = Network.get(id=network_id)

    if network is None:
        return jsonify({
            "error": "Mreza nije pronadena."
        }), 404

    network.delete()

    return jsonify({
        "message": "Mreza je uspjesno obrisana."
    }), 200


@app.route("/api/networks/<int:network_id>", methods=["PUT"])
@db_session
def update_network(network_id):
    network = Network.get(id=network_id)

    if network is None:
        return jsonify({
            "error": "Mreza nije pronadena."
        }), 404

    data = request.get_json()

    if data is None:
        return jsonify({
            "error": "Podaci moraju biti poslani u JSON formatu."
        }), 400

    name = data.get("name")
    cidr = data.get("cidr")
    description = data.get("description", "")

    if not name or not cidr:
        return jsonify({
            "error": "Polja 'name' i 'cidr' su obavezna."
        }), 400

    network.name = name
    network.cidr = cidr
    network.description = description

    return jsonify({
        "message": "Mreza je uspjesno uredena."
    }), 200

@app.route("/api/ip-addresses", methods=["GET"])
@db_session
def get_ip_addresses():
    ip_addresses = IPAddress.select()[:]

    data = []

    for ip_address in ip_addresses:
        data.append({
            "id": ip_address.id,
            "address": ip_address.address,
            "status": ip_address.status,
            "hostname": ip_address.hostname,
            "network_id": ip_address.network.id,
            "network_name": ip_address.network.name
        })

    return jsonify(data)


@app.route("/api/ip-addresses", methods=["POST"])
@db_session
def add_ip_address():
    data = request.get_json()

    if data is None:
        return jsonify({
            "error": "Podaci moraju biti poslani u JSON formatu."
        }), 400

    address = data.get("address")
    status = data.get("status", "free")
    hostname = data.get("hostname", "")
    network_id = data.get("network_id")

    if not address or not network_id:
        return jsonify({
            "error": "IP adresa i mreza su obavezni."
        }), 400

    network = Network.get(id=int(network_id))

    if network is None:
        return jsonify({
            "error": "Odabrana mreza ne postoji."
        }), 404

    ip_address = IPAddress(
        address=address,
        status=status,
        hostname=hostname,
        network=network
    )

    return jsonify({
        "message": "IP adresa je uspjesno dodana.",
        "ip_address": {
            "id": ip_address.id,
            "address": ip_address.address,
            "status": ip_address.status,
            "hostname": ip_address.hostname,
            "network_id": network.id,
            "network_name": network.name
        }
    }), 201
@app.route("/api/ip-addresses/<int:ip_id>", methods=["DELETE"])
@db_session
def delete_ip_address(ip_id):

    ip_address = IPAddress.get(id=ip_id)

    if ip_address is None:
        return jsonify({
            "error": "IP adresa nije pronađena."
        }), 404

    ip_address.delete()

    return jsonify({
        "message": "IP adresa je uspješno obrisana."
    }), 200
@app.route("/api/ip-addresses/<int:ip_id>", methods=["PUT"])
@db_session
def update_ip_address(ip_id):

    ip_address = IPAddress.get(id=ip_id)

    if ip_address is None:
        return jsonify({
            "error": "IP adresa nije pronađena."
        }), 404

    data = request.get_json()

    ip_address.address = data["address"]
    ip_address.hostname = data["hostname"]
    ip_address.status = data["status"]

    network = Network.get(id=int(data["network_id"]))

    if network:
        ip_address.network = network

    return jsonify({
        "message": "IP adresa je uspješno uređena."
    })
@app.route("/api/statistics", methods=["GET"])
@db_session
def get_statistics():
    networks = Network.select()[:]
    ip_addresses = IPAddress.select()[:]

    free_count = 0
    reserved_count = 0
    used_count = 0

    for ip_address in ip_addresses:
        if ip_address.status == "free":
            free_count += 1
        elif ip_address.status == "reserved":
            reserved_count += 1
        elif ip_address.status == "used":
            used_count += 1

    return jsonify({
        "networks": len(networks),
        "ip_addresses": len(ip_addresses),
        "free": free_count,
        "reserved": reserved_count,
        "used": used_count
    })
@app.route("/api/validate-ip", methods=["POST"])
@db_session
def validate_ip():
    data = request.get_json()

    if data is None:
        return jsonify({
            "valid": False,
            "message": "Podaci moraju biti poslani u JSON formatu."
        }), 400

    address = data.get("address")
    network_id = data.get("network_id")

    if not address or not network_id:
        return jsonify({
            "valid": False,
            "message": "IP adresa i mreža su obavezni."
        }), 400

    network = Network.get(id=int(network_id))

    if network is None:
        return jsonify({
            "valid": False,
            "message": "Odabrana mreža ne postoji."
        }), 404

    try:
        parsed_address = ipaddress.ip_address(address)
        parsed_network = ipaddress.ip_network(
            network.cidr,
            strict=False
        )
    except ValueError:
        return jsonify({
            "valid": False,
            "message": "IP adresa ili CIDR mreže nisu ispravnog formata."
        }), 400

    if parsed_address not in parsed_network:
        return jsonify({
            "valid": False,
            "message": (
                f"IP adresa {address} ne pripada mreži "
                f"{network.cidr}."
            )
        }), 200

    existing_address = IPAddress.get(address=address)

    if existing_address is not None:
        return jsonify({
            "valid": False,
            "message": (
                f"IP adresa {address} već postoji u bazi "
                f"sa statusom '{existing_address.status}'."
            )
        }), 200

    return jsonify({
        "valid": True,
        "message": (
            f"IP adresa {address} je ispravna, pripada mreži "
            f"{network.cidr} i nije evidentirana u bazi."
        )
    }), 200

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=8000,
        debug=True
    )
    