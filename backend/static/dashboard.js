let statusChart = null;


async function loadDashboard() {
    const message = document.getElementById("dashboard-message");

    try {
        const response = await fetch("/api/statistics");

        if (!response.ok) {
            throw new Error("Nije moguće dohvatiti statistiku.");
        }

        const statistics = await response.json();

        document.getElementById("network-count").textContent =
            statistics.networks;

        document.getElementById("ip-address-count").textContent =
            statistics.ip_addresses;

        document.getElementById("free-count").textContent =
            statistics.free;

        document.getElementById("reserved-count").textContent =
            statistics.reserved;

        document.getElementById("used-count").textContent =
            statistics.used;

        createStatusChart(statistics);

    } catch (error) {
        message.innerHTML = `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;
    }
}


function createStatusChart(statistics) {
    const canvas = document.getElementById("status-chart");

    if (statusChart) {
        statusChart.destroy();
    }

    statusChart = new Chart(canvas, {
        type: "doughnut",

        data: {
            labels: [
                "Free",
                "Reserved",
                "Used"
            ],

            datasets: [
                {
                    data: [
                        statistics.free,
                        statistics.reserved,
                        statistics.used
                    ]
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}


loadDashboard();