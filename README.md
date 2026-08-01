# IPAM System

## Opis projekta

IPAM System je web aplikacija razvijena u Python Flask okruženju za upravljanje računalnim mrežama i IP adresama.

Aplikacija omogućuje administratorima jednostavno dodavanje, uređivanje i brisanje mreža i IP adresa te pregled statistike i validaciju IP adresa.


## Funkcionalnosti
- CRUD operacije za Networks
- CRUD operacije za IP Addresses
- Dashboard sa statistikom
- Chart.js graf statusa IP adresa
- Validacija IP adrese
- SQLite baza podataka
- Docker podrška


## Korištene tehnologije
- Python
- Flask
- PonyORM
- SQLite
- HTML
- CSS
- Bootstrap
- JavaScript
- Chart.js
- Docker


## Pokretanje aplikacije

1. Uđite u folder `backend`
2. Izgradite Docker image:

docker build -t ipam-system .

3. Pokrenite Docker container:

docker run -p 8000:8000 ipam-system

4. Otvorite preglednik:


http://localhost:8000



## Autor

Filip Domazet