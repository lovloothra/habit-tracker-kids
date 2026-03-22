# Habit tracker for kids

A simple, mobile-friendly web app that helps a child log daily habits with yes/no questions, streaks, and on-screen rewards. It runs entirely in the browser—no accounts or server required.

## What you need

- A modern web browser (Safari on iPhone, Chrome, Edge, Firefox, etc.).
- The project files: `index.html`, `styles.css`, and `app.js` in the same folder.

There is no install step, no Node.js, and no build command.

## Setup

### Option A: Open the file directly

1. Clone or download this repository.
2. Double-click `index.html`, or drag it into a browser window.

Some browsers limit features when pages are opened as `file://`. If anything feels off, use Option B.

### Option B: Use a tiny local server (recommended)

From the project folder in a terminal:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in the browser.

To stop the server, press `Ctrl+C` in the terminal.

### Hosting on the web (optional)

Upload the same three files to any static host (GitHub Pages, Netlify, Cloudflare Pages, etc.). Only `index.html`, `styles.css`, and `app.js` are required.

## How to use it

1. **Open the app** on the device your child will use (phone or tablet works well).
2. **Answer “Today”** — For each question, tap **Yes** or **No**. Questions can be left untouched until you tap; when you press **Save my day**, any question not chosen is saved as **No**.
3. **Save** — Tap **Save my day** to store that day and update streaks and badges.
4. **Stars & streaks** — Scroll sideways to see each reward track, current streak length, and progress toward a badge (for example `2/3` means two days in a row so far).
5. **Past days** — Tap **See past days** to expand a list of recent saved days with small dots for each answer (green = Yes, pink = No).

### Rewards and streaks

- Streaks count **consecutive calendar days** with a saved entry, looking backward from **today**. If a day has no save, the streak resets for that habit.
- When a streak reaches the threshold (by default **3 days in a row** for each track), that badge unlocks and a celebration appears the next time you earn a **new** badge on save.
- **Growth star** counts days where she either **tried something hard** or **made a mistake** (either one counts).
- Saying **Yes** to making a mistake shows a short positive message—framing mistakes as part of learning.

### Fonts

The page loads the **Nunito** font from Google Fonts. For the app to look as designed, the device needs internet access the first time the page loads (fonts are cached afterward).

## Data and privacy

- All answers are stored in this browser’s **localStorage** under the key `habitTrackerKids_v1`.
- Data **does not leave the device** unless you copy it yourself.
- Clearing site data or using a different browser/device starts a fresh history.

### Backup (for parents)

To copy the saved data:

1. Open the page.
2. Open developer tools (varies by browser; on desktop Chrome: `F12` or right-click → Inspect).
3. Open the **Application** (Chrome) or **Storage** (Firefox) tab → **Local Storage** → select your site’s origin.
4. Find `habitTrackerKids_v1`, copy the value, and save it in a text file if you want a backup.

Restoring: paste that JSON back into the same key (or use the browser’s storage editor).

## Changing streak thresholds

Edit the `THRESHOLDS` object near the top of [`app.js`](app.js). Each number is how many days in a row are needed to unlock that track’s badge.

## Files

| File        | Purpose                          |
| ----------- | -------------------------------- |
| `index.html` | Page structure and content      |
| `styles.css` | Layout, pink theme, responsiveness |
| `app.js`    | Saving answers, streaks, badges, history |

---

Made for a kid-friendly daily check-in; adjust copy or thresholds in `app.js` to fit your family.
