# Connecting the CEO dashboard to Google Sheets

The dashboard reads Babu's and Vasudha's Google Sheets through a small Google Apps Script. It's free and needs
no Google Cloud project. The sheets stay private: they are shared with one Google account, and the script
running in that account sends the dashboard only the figures it needs, and only with the dashboard password.

Takes about 10 minutes, once.

## 1. Make a Google account for the dashboard

Create a free Gmail account just for this, for example `upshift.dashboard@gmail.com`.
(Any Google account works, but a dedicated one means nobody's personal account is involved.)

## 2. Share the two sheets with it

Babu and Vasudha each open their sheet → **Share** → add the dashboard email → set to **Viewer** → **Send**.

- Babu: *QT Career campaign - Babu*
- Vasudha: *QT Hitech City META AD SPENT*
- Sales: *Attendees For WS From Meta Leads* (for the **Sales** page; its link is already in the script)

Leave *General access* as **Restricted**. No public links are needed.

## 3. Add the script

Signed in as the dashboard account:

1. Go to <https://script.google.com> → **New project**. Name it *Upshift Dashboard Feed*.
2. Delete the sample code and paste in everything from [`Code.gs`](Code.gs).
3. In `SOURCES`, replace `PASTE_BABU_SHEET_LINK_HERE` and `PASTE_VASUDHA_SHEET_LINK_HERE` with the two sheet links
   (copy them from the browser address bar).
4. The dashboard password is `PASSWORD` at the top. Change it here if you want a different one.
5. Click **Save** (disk icon).
6. Pick **setup** in the function dropdown at the top and click **Run** (approve the permission prompt).
   This starts a timer that re-reads the sheets every 5 minutes and keeps a ready snapshot, so the dashboard
   loads in about a second instead of waiting for the sheets. The **Refresh** button still reads them directly.
   You can check it under **Triggers** (clock icon on the left): `refreshSnapshot`, every 5 minutes.

## 4. Deploy it

1. **Deploy → New deployment** → click the gear → **Web app**.
2. *Execute as*: **Me**. *Who has access*: **Anyone**.
   (Anyone can reach the link, but it returns nothing without the password.)
3. **Deploy** → **Authorize access** → pick the dashboard account.
   Google shows *"Google hasn't verified this app"* because it's your own script: click **Advanced → Go to Upshift
   Dashboard Feed (unsafe) → Allow**.
4. Copy the **Web app URL** (ends in `/exec`).

Check it: opening that URL in a browser should show `{"ok":true,"service":"upshift-dashboard"}`.

## 5. Point the backend at it

Put the URL and the password in `backend/.env`:

```
APPS_SCRIPT_URL="https://script.google.com/macros/s/…/exec"
APPS_SCRIPT_PASSWORD="the PASSWORD from the script"
```

Restart the backend. It reads the sheets every 5 minutes and saves them in MySQL, and the dashboard's
**Sources** page shows what was read from each sheet.

## Changing things later

Edit the script (e.g. a new password or sheet link), then **Deploy → Manage deployments → ✏️ → Version: New version →
Deploy**. The URL stays the same, so the backend doesn't need changing.

## What the script reads

| Person  | Tab                      | Columns  |
|---------|--------------------------|----------|
| Babu    | Reports (whole tab sent; dashboard uses A to AC) | A to AC  |
| Vasudha | every visible tab — each tab with a Campaign Name table is read and combined | all      |
| Sales   | every tab (one per workshop / campaign) | all — the dashboard finds Amount and Payment date in each tab |

Awareness campaigns in Vasudha's sheet (Leads column like `53,326- Reach`) are shown separately and left out of
spend, leads and cost per lead. Her summary table can sit to the right of the daily rows or below them.

## Sales page

The **Sales** button opens a separate page built from *Attendees For WS From Meta Leads*. Each tab is one
workshop or campaign. The columns sit in different places in each tab, so the dashboard looks for them per tab:

- **Amount**: a heading like *Amount Paid*, *Amount*, *Fee*, *Price* or *Paid*, whose cells are numbers
  (₹1,999 / Rs. 499/- / 2,500). Columns such as *Balance*, *Due*, *Discount* or *Payment Status* are ignored.
- **Payment date**: a heading like *Payment Date*, *Paid On*, *Date of Payment*, or failing that *Date*.
  Times after the date are ignored.
- The heading row can be anywhere in the first 30 rows. A tab with no recognisable headings is read from its
  cell contents instead and marked *guessed*. Tabs with no amount column are listed as skipped.

The table on the Sales page shows which column letters were used for each tab, so they can be checked against
the sheet.
