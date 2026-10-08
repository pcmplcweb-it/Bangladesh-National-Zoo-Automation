# BNZ Management System (frontend)

A separate React application for running the Bangladesh National Zoo: online and counter ticketing with payment, QR entry/exit at the gates, a live dashboard and reports for central management, animal feeding, and staff attendance and leave.

**This phase is frontend only.** All data is either generated demo data or saved in the browser (localStorage). The `src/services/` folder is the boundary where the backend API will plug in. The public website lives in the repository root and is not affected.

## Run

```bash
cd zoo-management-app
npm install
npm run dev        # http://localhost:5174
npm run build      # production build in dist/
```

| URL | Who | What |
|---|---|---|
| `/book` | Public | Online booking with bKash / Nagad / Rocket / card payment |
| `/ticket/:code` | Public | E-ticket with QR code (print / save as PDF) |
| `/login` | Staff | Sign-in with one-click demo accounts |
| `/app/...` | Staff | Management screens (menu depends on role) |

### Demo accounts

| Role | Username / password | Lands on | Can open |
|---|---|---|---|
| Central management | `admin` / `admin123` | Live dashboard | Everything |
| Ticket counter | `counter` / `counter123` | Counter sale | Counter sale, tickets, own leave |
| Gate staff | `gate` / `gate123` | Gate entry / exit | Gate, tickets, own leave |
| Animal keeper | `keeper` / `keeper123` | Feeding today | Feeding, meal schedule, own leave |
| HR officer | `hr` / `hr123` | Attendance | Employees, attendance, leave approval |

**Demo time:** the "⏱ Set demo time" button in the top bar moves today's clock (for example to 2:30 PM). Use it to see the live screens during opening hours when you're testing at night. It only affects your browser.

**Test payments:** wallet code `123456`, PIN `12345`. Card `4111 1111 1111 1111`, any future expiry, any CVC. A card ending in `0002` is declined.

## Modules

**Live dashboard (central management)**
- Visitors inside now, entered since opening, exited, and yet to enter (valid tickets for today that haven't been used).
- Tickets sold, visitors and revenue, split online / counter and by payment method.
- Visitor flow by hour (entries, exits, people inside).
- Today's mix: adult male, adult female, children and students.
- Feeding status (on time / late / missed / due), staff present / late / absent, pending leave requests, latest gate scans and the last 14 days.

**Reports**
- Presets: today, yesterday, this week (starts Saturday), this month, last month, this year. Custom picks any two dates.
- Group by day, week, month or year.
- KPIs with % change against the previous period of the same length.
- Stacked visitor-category chart, revenue chart and a detail table with totals.
- CSV export and print.

**Ticketing**
- Online booking: visitor categories, visit date (Sunday is closed; bookings run up to 30 days ahead), contact details and payment method. The simulated gateway walks through account number → OTP → PIN, or card details. On success the visitor gets an e-ticket with a QR code.
- Counter sale: cash (shows change due), bKash, Nagad, Rocket or card POS with a transaction ID. It can admit the visitors straight away and prints the ticket. The clerk's cash-drawer total for the day is shown.
- Ticket list for any visit date: search, filters, CSV export, gate log, and cancellation (admin only).

**Gate entry / exit**
- Works with USB or Bluetooth QR scanners, which type the code and press Enter. Uses the device camera where the browser supports `BarcodeDetector`.
- Checks validity: wrong date, expired, cancelled, unpaid, already used, or nobody from the ticket inside.
- Supports partial groups (for example, 3 of 4 enter now), entry and exit direction per gate, and an optional auto-confirm for speed.

**Animal feeding**
- Daily meal schedule per animal: time, food, quantity, keeper and days of the week.
- Today's timeline with a status per meal:
  - **On time:** fed within ±15 min of the scheduled time.
  - **Late or too early:** fed outside that window.
  - **Missed:** not fed 60 min after the scheduled time.
  - **Due now** and **Upcoming** for meals not yet served.
- Keepers mark a meal as fed with the time, quantity and a note. There's a history for any past day and a 30-day on-time-rate chart.

**Staff**
- Employee register with departments, shifts and weekly off days; add new employees.
- Today's attendance board: check in / check out, late flag after a 15-min grace period, mark absent. Monthly summary with CSV export, and a per-employee calendar sheet.
- Leave: apply (checks balance and overlapping requests), approve / reject, see who is away today, and yearly balances for casual, sick, earned, maternity and unpaid leave.

## Code layout

```
src/
  data/master.js        ticket prices, gates, payment methods, employees, shifts, feeding schedule, roles
  services/             the API boundary – replace these with backend calls
    db.js               localStorage store + useLive() hook (re-renders on data change / every 15 s)
    demo.js             deterministic demo history, today's demo tickets, feeding and attendance
    tickets.js          bookings, gate validation, live stats, report rows
    payments.js         simulated payment gateway (see notes inside for the real flow)
    feeding.js          meal status / compliance
    hr.js               attendance, leave, employees
    auth.jsx            demo login and role permissions
  components/           layout, UI kit, charts, e-ticket
  pages/                public/, ticketing/, gate/, feeding/, hr/, Dashboard, Reports
```

## Backend plan (next phase)

A Django + Django REST Framework backend (PostgreSQL) maps directly onto the services:

| Frontend service | Suggested endpoints |
|---|---|
| `auth.jsx` | `POST /api/auth/login/` (JWT), `GET /api/auth/me/` |
| `tickets.createBooking` | `POST /api/tickets/` → ticket with `payment.status = pending` |
| `payments.*` | `POST /api/payments/` → gateway redirect URL; `POST /api/payments/callback/<provider>/` (IPN, server-to-server verification) |
| `tickets.findTicket` / `checkTicket` / `recordGate` | `GET /api/tickets/<code>/`, `POST /api/gate/scan/ {code, direction, count, gate}` |
| `tickets.liveStats` / `hourlyFlow` | `GET /api/stats/live/?date=` (cache for a few seconds, or push over WebSocket / Django Channels) |
| `tickets.dailyRows` | `GET /api/reports/visitors/?from=&to=&group=day\|week\|month\|year` (SQL `GROUP BY date_trunc`) |
| `feeding.*` | `GET /api/feeding/schedule/`, `GET /api/feeding/day/<date>/`, `POST /api/feeding/logs/` |
| `hr.*` | `/api/employees/`, `/api/attendance/` (biometric device sync), `/api/leaves/` + `POST /api/leaves/<id>/decide/` |

Core tables: `Ticket` (code, channel, visit_date, buyer, counts per category, amount, status), `Payment` (ticket, provider, trx_id, status, raw callback), `GateEvent` (ticket, direction, count, gate, scanned_by, at), `FeedingSlot`, `FeedingLog`, `Employee`, `Attendance`, `LeaveType`, `LeaveRequest`.

Payment integration must run on the server: bKash Tokenized Checkout, Nagad, and SSLCommerz for cards and Rocket. Keys must never ship in the frontend. The ticket QR should carry a signed code (for example an HMAC of the ticket ID) so tickets can't be forged.

## Credits

Login photo: "Mirpur national zoo" by Sojol Rana, CC BY-SA 4.0, via Wikimedia Commons. Visitor numbers, names and staff are fictional demo data.
