# Bibliotheca Pro — Unified 3-in-1 Library Management System

A production-grade, full-stack Library Management System engineered to satisfy three distinct operational paradigms in a single cohesive codebase:
1. **Web-Based Dashboard**: Modern, desktop-optimized Bento/SaaS administrative suite for librarians.
2. **App-Based Mobile View**: Responsive smartphone simulator with dynamic island, bottom navigation bar, and swipeable cards.
3. **Console-Based Mode & Kotlin Source**: Interactive in-browser retro-modern CLI terminal running against live shared state, alongside an idiomatic Kotlin (`LibraryManagementSystem.kt`) implementation.

---

## 📸 Architectural Overview & Highlights

```
+---------------------------------------------------------------------------------------+
|                               BIBLIOTHECA PRO (LMS)                                   |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  [PARADIGM 1: Web Dashboard]        [PARADIGM 2: Mobile View]  [PARADIGM 3: Console]  |
|  - 4 Live KPI Metric Cards          - Realistic iPhone Frame   - Interactive CLI      |
|  - Sortable Catalog Table & Grid    - Bottom Tab Navigation    - Real-Time Live State |
|  - 1-Click Quick Issue & Return     - Touch-Optimized Cards    - ASCII Tables         |
|  - Live Search & Filter Pills       - Compact Drawer Modals    - Kotlin Source Viewer |
|                                                                                       |
+---------------------------------------------------------------------------------------+
|  SHARED IN-MEMORY ENGINE & STRICT BUSINESS VALIDATIONS                                |
|  - HashMap<String, Book> (O(1) lookups)                                               |
|  - MutableList<IssueRecord> (Active loans & full history)                             |
|  - Duplicate Book ID prevention (case-insensitive)                                    |
|  - Stock constraints (copies >= 0) & Year bounds (1450 - Current Year)                |
|  - Borrower Safeguards (No duplicate concurrent loans of same book to same student)   |
+---------------------------------------------------------------------------------------+
```

---

## 🎨 Aesthetic & UI/UX Design System

- **Color Palette**: Clean Slate & Indigo SaaS palette with tailored dark mode and light mode support.
- **Top KPI Summary Bar**:
  - **Total Registered Books**: Total unique titles in catalog.
  - **Total Available Copies**: Total inventory across all books currently available to borrow.
  - **Currently Issued Books**: Active student loans requiring return.
  - **Unique Active Borrowers**: Distinct student IDs currently possessing unreturned library copies.
- **Micro-Interactions & Feedback**:
  - Animated toast notification stack with slide-in / fade-out transitions.
  - Non-intrusive Web Audio API synthesizer chimes for success/error alerts.
  - Visual status badges: Emerald Green (`Available`), Rose Red (`Out of Stock`), and Indigo (`Issued`).
- **Pre-Loaded Seed Data**:
  - **8 realistic books** across Computer Science, Software Engineering, Architecture, and Literature (including *Structure and Interpretation of Computer Programs* as an Out-of-Stock demonstration).
  - **3 active issue records** (Alice Chen, David Miller, Sarah Jenkins) to populate live metrics on initial launch.

---

## 🚀 Tasks 1 – 7 Functional Implementation

### Task 1: Add Books (With Strict Validation)
- Slide-over / modal form accepting:
  - `Book ID` (String, e.g., `BK-109`)
  - `Book Title` (String)
  - `Author Name` (String)
  - `Publication Year` (Int, strictly between 1450 and current year)
  - `Available Copies` (Int, must be $\ge 0$)
- **Validation Rules**:
  - Case-insensitive duplicate Book ID check against in-memory catalog.
  - Rejection of empty strings, whitespace, or negative copy counts.
  - Immediate inline error alerts with toast notifications.

### Task 2: Display All Books (Catalog Table & Grid)
- Dual-mode catalog viewer:
  - **Table View**: Desktop view featuring sortable columns (`Book ID`, `Title`, `Author`, `Year`, `Copies`, `Availability Badge`, and `Quick Issue` action).
  - **Card Grid View**: Modern SaaS Bento cards displaying cover tags, author information, and quick-action buttons.

### Task 3: Real-Time Search & Filtering
- Instant search bar with real-time feedback matching Book ID, Title, or Author.
- Filter pills:
  - `All Books`
  - `Available Only` (copies > 0)
  - `Out of Stock` (copies == 0)
- Sort dropdown: Book ID (A-Z / Z-A), Title (A-Z), Year (Newest), Copies (Highest).

### Task 4: Issue a Book
- Modal workflow and 1-click Quick Issue buttons on every book row.
- Inputs: `Book ID` (with dynamic stock counter) and `Student ID`.
- **Validation & Business Logic**:
  - Verifies book exists.
  - Verifies `availableCopies >= 1`.
  - **Safeguard Rule**: Prevents issuing the exact same book twice to the same student while an unreturned copy is still active.
  - Decrements `availableCopies` by 1 and creates an active `IssueRecord` (`TXN-xxxx`).

### Task 5: Return a Book
- Inputs: `Book ID` and `Student ID` (or 1-click "Return" button on Issued Books rows).
- **Validation & Business Logic**:
  - Strictly verifies that an active, unreturned issue record exists matching **both** `Book ID` and `Student ID`.
  - If no matching active record exists, blocks return with an explicit error alert.
  - On return, increments `availableCopies` by 1, records `returnTimestamp`, and moves the loan into returned history.

### Task 6: Display Currently Issued Books
- Dedicated table displaying `Transaction ID`, `Book ID`, `Book Title`, `Student ID`, `Issue Timestamp`, `Status`, and a 1-click `Return Book` button that executes Task 5 validation automatically.
- Collapsible full Transaction History log displaying past returned loans.

### Task 7: Menu-Driven Interface & Kotlin Source Code
- **Unified Command Bar**: Keyboard shortcuts and quick launchers mirroring options 1–7.
- **Interactive CLI Terminal**:
  - Simulated shell drawer (`LMS > `) supporting typing `1` to `7`.
  - Step-by-step interactive wizards for adding books, searching, issuing, and returning.
  - Direct command shortcuts: `issue <bookId> <studentId>`, `return <bookId> <studentId>`, `search <query>`, `kpi`, `clear`, `help`.
  - **Live Synchronization**: Terminal modifications immediately reflect on the Web/Mobile GUI in real time, and vice versa!
- **Kotlin Source Code Tab**:
  - Highlighting the complete `LibraryManagementSystem.kt` implementation.
  - Features `HashMap<String, Book>`, `MutableList<IssueRecord>`, formatted `String.format` ASCII tables, and a clean Kotlin `when (choice)` expression menu.
  - 1-click "Copy Code" and "Download .kt" buttons.

---

## 💻 How to Run the Applications

### 1. Web Application (Zero Dependencies)
You can launch the web application in any of the following ways:
- **Direct Browser Launch**: Double-click `index.html` or open it with Google Chrome, Edge, Firefox, or Safari.
- **Python Local Server**:
  ```bash
  python server.py
  ```
  *(Automatically opens `http://localhost:8080/index.html` in your default browser)*

### 2. Kotlin Console Application (`LibraryManagementSystem.kt`)
To compile and run the native JVM Kotlin implementation:
```bash
# 1. Compile with Kotlin JVM compiler
kotlinc LibraryManagementSystem.kt -include-runtime -d LibraryManagementSystem.jar

# 2. Run the JAR with Java
java -jar LibraryManagementSystem.jar
```

---

## 🧪 Verification & Test Scenarios

| Test Case | Inputs | Expected Outcome |
| :--- | :--- | :--- |
| **Duplicate Book ID** | `BK-101`, "New Title", "Author", 2022, 3 | ❌ Rejected: Duplicate Book ID alert |
| **Invalid Year** | `BK-109`, "Future Book", "Author", 2099, 2 | ❌ Rejected: Year must be $\le$ current year |
| **Out of Stock Issue** | Issue `BK-104` to `STU-105` | ❌ Rejected: Book is Out of Stock (0 copies) |
| **Duplicate Borrower** | Issue `BK-101` to `STU-101` | ❌ Rejected: Student already holds active copy |
| **Invalid Return** | Return `BK-102` with `STU-999` | ❌ Rejected: No matching active issue record |
| **Valid Return** | Return `BK-101` with `STU-101` | ✅ Success: Book returned, copies incremented |
| **CLI Sync Test** | Type `4` in CLI, issue `BK-105` to `STU-108` | ✅ Success: KPI cards and web table update live |

