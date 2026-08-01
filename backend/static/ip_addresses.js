async function loadNetworkOptions() {
    const networkSelect = document.getElementById("network-id");

    try {
        const response = await fetch("/api/networks");
        const networks = await response.json();

        networkSelect.innerHTML = `
            <option value="">Odaberite mrežu</option>
        `;

        networks.forEach((network) => {
            networkSelect.innerHTML += `
                <option value="${network.id}">
                    ${network.name} (${network.cidr})
                </option>
            `;
        });

    } catch (error) {
        alert("Nije moguće učitati mreže.");
    }
}


async function loadIPAddresses() {
    const tableBody = document.getElementById(
        "ip-address-table-body"
    );

    try {
        const response = await fetch("/api/ip-addresses");

        if (!response.ok) {
            throw new Error("Nije moguće dohvatiti IP adrese.");
        }

        const ipAddresses = await response.json();

        tableBody.innerHTML = "";

        if (ipAddresses.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        class="text-center text-muted"
                    >
                        Trenutno nema spremljenih IP adresa.
                    </td>
                </tr>
            `;

            return;
        }

        ipAddresses.forEach((ipAddress) => {
            const row = document.createElement("tr");

            row.innerHTML = `
    <td>${ipAddress.id}</td>
    <td>${ipAddress.address}</td>
    <td>${ipAddress.hostname || "-"}</td>
    <td>${ipAddress.status}</td>
    <td>${ipAddress.network_name}</td>

    <td>

        <button
            class="btn btn-warning btn-sm me-2"
            onclick="editIPAddress(
                ${ipAddress.id},
                '${ipAddress.address}',
                '${ipAddress.hostname || ""}',
                '${ipAddress.status}',
                ${ipAddress.network_id}
            )">

            Uredi

        </button>

        <button
            class="btn btn-danger btn-sm"
            onclick="deleteIPAddress(${ipAddress.id})">

            Obriši

        </button>

    </td>
`;

            tableBody.appendChild(row);
        });

    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="text-center text-danger"
                >
                    Greška pri učitavanju IP adresa.
                </td>
            </tr>
        `;
    }
}


const ipAddressForm = document.getElementById(
    "ip-address-form"
);

ipAddressForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const address = document.getElementById(
        "ip-address"
    ).value;

    const hostname = document.getElementById(
        "hostname"
    ).value;

    const status = document.getElementById(
        "status"
    ).value;

    const networkId = document.getElementById(
        "network-id"
    ).value;

    try {
        const response = await fetch("/api/ip-addresses", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                address: address,
                hostname: hostname,
                status: status,
                network_id: networkId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Dodavanje nije uspjelo.");
            return;
        }

        alert(data.message);

        ipAddressForm.reset();

        loadIPAddresses();

    } catch (error) {
        alert("Dogodila se greška pri dodavanju IP adrese.");
    }
});
async function deleteIPAddress(ipId) {

    if (!confirm("Želite li obrisati ovu IP adresu?")) {
        return;
    }

    const response = await fetch(
        `/api/ip-addresses/${ipId}`,
        {
            method: "DELETE"
        }
    );

    const data = await response.json();

    alert(data.message);

    loadIPAddresses();
}
async function editIPAddress(
    id,
    currentAddress,
    currentHostname,
    currentStatus,
    currentNetwork
) {

    const address = prompt(
        "IP adresa:",
        currentAddress
    );

    if (address === null) return;

    const hostname = prompt(
        "Hostname:",
        currentHostname
    );

    if (hostname === null) return;

    const status = prompt(
        "Status (free/reserved/used):",
        currentStatus
    );

    if (status === null) return;

    const networkId = prompt(
        "ID mreže:",
        currentNetwork
    );

    if (networkId === null) return;

    const response = await fetch(
        `/api/ip-addresses/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                address,
                hostname,
                status,
                network_id: networkId

            })

        }
    );

    const data = await response.json();

    alert(data.message);

    loadIPAddresses();
}


loadNetworkOptions();
loadIPAddresses();