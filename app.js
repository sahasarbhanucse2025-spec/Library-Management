/**
 * ============================================================================
 * Bibliotheca Pro - Application Logic & State Engine
 * Implements Tasks 1 - 7: Web Bento + Mobile Simulator + Interactive CLI
 * ============================================================================
 */

// ==========================================
// SEED DATA CONSTANTS
// ==========================================
const INITIAL_BOOKS = [
  {
    bookId: "BK-101",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    publicationYear: 2008,
    availableCopies: 3,
    category: "Software Engineering"
  },
  {
    bookId: "BK-102",
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    publicationYear: 1994,
    availableCopies: 2,
    category: "Architecture"
  },
  {
    bookId: "BK-103",
    title: "Introduction to Algorithms (CLRS 3rd Edition)",
    author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    publicationYear: 2009,
    availableCopies: 4,
    category: "Computer Science"
  },
  {
    bookId: "BK-104",
    title: "Structure and Interpretation of Computer Programs",
    author: "Harold Abelson, Gerald Jay Sussman",
    publicationYear: 1996,
    availableCopies: 0, // Demonstrating Out of Stock state
    category: "Computer Science"
  },
  {
    bookId: "BK-105",
    title: "The Pragmatic Programmer: Your Journey to Mastery",
    author: "Andrew Hunt, David Thomas",
    publicationYear: 1999,
    availableCopies: 5,
    category: "Software Engineering"
  },
  {
    bookId: "BK-106",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    publicationYear: 2017,
    availableCopies: 2,
    category: "Distributed Systems"
  },
  {
    bookId: "BK-107",
    title: "Kotlin in Action",
    author: "Dmitry Jemerov, Svetlana Isakova",
    publicationYear: 2017,
    availableCopies: 3,
    category: "Programming Languages"
  },
  {
    bookId: "BK-108",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    publicationYear: 1960,
    availableCopies: 4,
    category: "Literature"
  }
];

const INITIAL_ISSUES = [
  {
    transactionId: "TXN-1001",
    bookId: "BK-101",
    bookTitle: "Clean Code: A Handbook of Agile Software Craftsmanship",
    studentId: "STU-101",
    issueTimestamp: "2026-11-04 10:30",
    returnTimestamp: null,
    status: "ISSUED"
  },
  {
    transactionId: "TXN-1002",
    bookId: "BK-103",
    bookTitle: "Introduction to Algorithms (CLRS 3rd Edition)",
    studentId: "STU-102",
    issueTimestamp: "2026-11-05 14:15",
    returnTimestamp: null,
    status: "ISSUED"
  },
  {
    transactionId: "TXN-1003",
    bookId: "BK-106",
    bookTitle: "Designing Data-Intensive Applications",
    studentId: "STU-103",
    issueTimestamp: "2026-11-06 09:00",
    returnTimestamp: null,
    status: "ISSUED"
  }
];

// ==========================================
// STATE MANAGEMENT ENGINE
// ==========================================
class LibraryState {
  constructor() {
    this.books = new Map();
    this.activeIssues = [];
    this.transactionHistory = [];
    this.txnCounter = 1004;

    // View & Filter States
    this.searchQuery = "";
    this.activeFilter = "all"; // 'all' | 'available' | 'outOfStock'
    this.sortOption = "id_asc";
    this.catalogView = "table"; // 'table' | 'grid'
    this.viewportMode = "web";  // 'web' | 'mobile'
    this.mobileTab = "catalog"; // 'catalog' | 'issued'

    // Interactive Terminal State Machine
    this.terminalStep = null; // null | { action: 'add'|'issue'|'return'|'search', stage: number, payload: {} }
    this.commandHistory = [];
    this.historyIndex = -1;

    this.initSeedData();
  }

  initSeedData() {
    this.books.clear();
    this.activeIssues = [];
    this.transactionHistory = [];

    // Clone initial books
    INITIAL_BOOKS.forEach(b => {
      this.books.set(b.bookId.toUpperCase(), { ...b });
    });

    // Clone initial issues
    INITIAL_ISSUES.forEach(issue => {
      const copy = { ...issue };
      this.activeIssues.push(copy);
      this.transactionHistory.push({ ...copy });
    });
  }

  // -------------------------------------------------------------
  // Task 1: Add Book (Strict Validation Rules)
  // -------------------------------------------------------------
  addBook(bookId, title, author, publicationYear, availableCopies) {
    const rawId = (bookId || "").trim();
    const rawTitle = (title || "").trim();
    const rawAuthor = (author || "").trim();
    const year = parseInt(publicationYear, 10);
    const copies = parseInt(availableCopies, 10);
    const currentYear = new Date().getFullYear();

    // 1. Empty string validation
    if (!rawId) {
      return { success: false, message: "Validation Error: Book ID cannot be empty." };
    }
    if (!rawTitle) {
      return { success: false, message: "Validation Error: Book Title cannot be empty." };
    }
    if (!rawAuthor) {
      return { success: false, message: "Validation Error: Author Name cannot be empty." };
    }

    // 2. Case-insensitive Duplicate ID Check
    const normalizedId = rawId.toUpperCase();
    if (this.books.has(normalizedId)) {
      return { 
        success: false, 
        message: `Validation Error: Duplicate Book ID. A book with ID '${rawId}' already exists.` 
      };
    }

    // 3. Publication Year (1450 to current year)
    if (isNaN(year) || year < 1450 || year > currentYear) {
      return { 
        success: false, 
        message: `Validation Error: Publication year must be between 1450 and ${currentYear}.` 
      };
    }

    // 4. Copy Count (>= 0)
    if (isNaN(copies) || copies < 0) {
      return { 
        success: false, 
        message: "Validation Error: Available copies cannot be negative." 
      };
    }

    // Construct and store new book
    const newBook = {
      bookId: rawId,
      title: rawTitle,
      author: rawAuthor,
      publicationYear: year,
      availableCopies: copies,
      category: "General Collection"
    };

    this.books.set(normalizedId, newBook);
    return { 
      success: true, 
      message: `Book '${rawTitle}' [ID: ${rawId}] successfully added with ${copies} copies.`,
      book: newBook
    };
  }

  // -------------------------------------------------------------
  // Task 4: Issue a Book (Stock & Duplicate Safeguard Validation)
  // -------------------------------------------------------------
  issueBook(rawBookId, rawStudentId) {
    const bookId = (rawBookId || "").trim();
    const studentId = (rawStudentId || "").trim().toUpperCase();

    if (!bookId) {
      return { success: false, message: "Validation Error: Book ID is required." };
    }
    if (!studentId) {
      return { success: false, message: "Validation Error: Student ID is required." };
    }

    // Verify book exists
    const normalizedBookId = bookId.toUpperCase();
    const book = this.books.get(normalizedBookId);
    if (!book) {
      return { 
        success: false, 
        message: `Issue Error: Book with ID '${bookId}' does not exist in catalog.` 
      };
    }

    // Verify stock availability
    if (book.availableCopies <= 0) {
      return { 
        success: false, 
        message: `Issue Error: '${book.title}' is currently OUT OF STOCK (0 copies available).` 
      };
    }

    // Safeguard: Verify student does not already hold an unreturned copy of this book
    const alreadyHolding = this.activeIssues.some(
      issue => issue.bookId.toUpperCase() === normalizedBookId && issue.studentId.toUpperCase() === studentId
    );
    if (alreadyHolding) {
      return {
        success: false,
        message: `Issue Safeguard: Student '${studentId}' already has an active, unreturned copy of '${book.title}'.`
      };
    }

    // State update: decrement copies
    book.availableCopies -= 1;

    const txnId = `TXN-${this.txnCounter++}`;
    const nowStr = formatTimestamp(new Date());

    const record = {
      transactionId: txnId,
      bookId: book.bookId,
      bookTitle: book.title,
      studentId: studentId,
      issueTimestamp: nowStr,
      returnTimestamp: null,
      status: "ISSUED"
    };

    this.activeIssues.unshift(record);
    this.transactionHistory.unshift({ ...record });

    return {
      success: true,
      message: `Book '${book.title}' issued to ${studentId}. Remaining copies: ${book.availableCopies}. (Txn: ${txnId})`,
      record: record
    };
  }

  // -------------------------------------------------------------
  // Task 5: Return a Book (Strict Active Record Verification)
  // -------------------------------------------------------------
  returnBook(rawBookId, rawStudentId) {
    const bookId = (rawBookId || "").trim().toUpperCase();
    const studentId = (rawStudentId || "").trim().toUpperCase();

    if (!bookId) {
      return { success: false, message: "Validation Error: Book ID is required." };
    }
    if (!studentId) {
      return { success: false, message: "Validation Error: Student ID is required." };
    }

    // Find active loan record matching both Book ID & Student ID
    const recordIndex = this.activeIssues.findIndex(
      issue => issue.bookId.toUpperCase() === bookId && issue.studentId.toUpperCase() === studentId
    );

    if (recordIndex === -1) {
      return {
        success: false,
        message: `Return Error: No matching active issue record found for Book '${bookId}' borrowed by Student '${studentId}'.`
      };
    }

    // Remove from active issues
    const returnedRecord = this.activeIssues.splice(recordIndex, 1)[0];
    const returnTimeStr = formatTimestamp(new Date());
    returnedRecord.returnTimestamp = returnTimeStr;
    returnedRecord.status = "RETURNED";

    // Update in transaction history
    const historyEntry = this.transactionHistory.find(h => h.transactionId === returnedRecord.transactionId);
    if (historyEntry) {
      historyEntry.returnTimestamp = returnTimeStr;
      historyEntry.status = "RETURNED";
    }

    // Increment available copies
    const book = this.books.get(bookId);
    if (book) {
      book.availableCopies += 1;
    }

    return {
      success: true,
      message: `Book '${returnedRecord.bookTitle}' [ID: ${returnedRecord.bookId}] successfully returned by ${studentId}. Restored copies: ${book ? book.availableCopies : 'N/A'}.`,
      record: returnedRecord
    };
  }

  // -------------------------------------------------------------
  // Filter & Search Engine (Task 2 & Task 3)
  // -------------------------------------------------------------
  getFilteredCatalog() {
    let list = Array.from(this.books.values());

    // 1. Filter pill
    if (this.activeFilter === "available") {
      list = list.filter(b => b.availableCopies > 0);
    } else if (this.activeFilter === "outOfStock") {
      list = list.filter(b => b.availableCopies === 0);
    }

    // 2. Search query (Book ID, Title, Author)
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(b => 
        b.bookId.toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
      );
    }

    // 3. Sorting
    switch (this.sortOption) {
      case "id_desc":
        list.sort((a, b) => b.bookId.localeCompare(a.bookId));
        break;
      case "title_asc":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "year_desc":
        list.sort((a, b) => b.publicationYear - a.publicationYear);
        break;
      case "copies_desc":
        list.sort((a, b) => b.availableCopies - a.availableCopies);
        break;
      case "id_asc":
      default:
        list.sort((a, b) => a.bookId.localeCompare(b.bookId));
        break;
    }

    return list;
  }

  // -------------------------------------------------------------
  // Live KPI Aggregators
  // -------------------------------------------------------------
  getKpis() {
    const totalBooks = this.books.size;
    let totalAvailableCopies = 0;
    this.books.forEach(b => {
      totalAvailableCopies += b.availableCopies;
    });
    const currentlyIssued = this.activeIssues.length;
    const uniqueBorrowers = new Set(this.activeIssues.map(i => i.studentId.toUpperCase())).size;

    return {
      totalBooks,
      totalAvailableCopies,
      currentlyIssued,
      uniqueBorrowers
    };
  }
}

// Global Application Instance
const state = new LibraryState();

// Helper: Format Date
function formatTimestamp(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${mins}`;
}

// ==========================================
// AUDIO SYNTHESIZER (Gentle Web Audio Chimes)
// ==========================================
let audioCtx = null;
function playAudioFeedback(type = "success") {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (type === "success") {
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "error") {
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {
    // Audio context may be restricted by autoplay policy; silent fail is acceptable
  }
}

// ==========================================
// TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(message, type = "success") {
  playAudioFeedback(type);

  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast-enter pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border text-sm backdrop-blur-md transition-all duration-300";

  let bgClass, borderClass, textClass, iconName;
  if (type === "success") {
    bgClass = "bg-emerald-50/95 dark:bg-emerald-950/90";
    borderClass = "border-emerald-200 dark:border-emerald-800";
    textClass = "text-emerald-900 dark:text-emerald-200";
    iconName = "check-circle";
  } else if (type === "error") {
    bgClass = "bg-rose-50/95 dark:bg-rose-950/90";
    borderClass = "border-rose-200 dark:border-rose-800";
    textClass = "text-rose-900 dark:text-rose-200";
    iconName = "alert-circle";
  } else {
    bgClass = "bg-indigo-50/95 dark:bg-indigo-950/90";
    borderClass = "border-indigo-200 dark:border-indigo-800";
    textClass = "text-indigo-900 dark:text-indigo-200";
    iconName = "info";
  }

  toast.classList.add(...bgClass.split(" "), ...borderClass.split(" "), ...textClass.split(" "));

  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-5 h-5 shrink-0 mt-0.5"></i>
    <div class="flex-1 pr-2">
      <p class="font-semibold text-xs uppercase tracking-wider opacity-75">${type}</p>
      <p class="text-xs mt-0.5">${escapeHtml(message)}</p>
    </div>
    <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" onclick="dismissToast(this.parentElement)">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  container.appendChild(toast);
  lucide.createIcons({ root: toast });

  setTimeout(() => {
    dismissToast(toast);
  }, 4200);
}

function dismissToast(toast) {
  if (!toast || toast.classList.contains("toast-exit")) return;
  toast.classList.remove("toast-enter");
  toast.classList.add("toast-exit");
  setTimeout(() => {
    if (toast.parentElement) toast.parentElement.removeChild(toast);
  }, 250);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// UI RENDERERS & DATA BINDING
// ==========================================

/**
 * Updates top KPI metric cards in real time
 */
function renderKPIs() {
  const kpis = state.getKpis();

  // Desktop KPI Cards
  const totalBooksEl = document.getElementById("kpiTotalBooks");
  const availableCopiesEl = document.getElementById("kpiAvailableCopies");
  const currentlyIssuedEl = document.getElementById("kpiCurrentlyIssued");
  const activeBorrowersEl = document.getElementById("kpiActiveBorrowers");
  const issuedBadgeCountEl = document.getElementById("issuedBadgeCount");

  if (totalBooksEl) totalBooksEl.textContent = kpis.totalBooks;
  if (availableCopiesEl) availableCopiesEl.textContent = kpis.totalAvailableCopies;
  if (currentlyIssuedEl) currentlyIssuedEl.textContent = kpis.currentlyIssued;
  if (activeBorrowersEl) activeBorrowersEl.textContent = kpis.uniqueBorrowers;
  if (issuedBadgeCountEl) issuedBadgeCountEl.textContent = kpis.currentlyIssued;

  // Mobile Glance KPIs
  const mobileKpiAvailable = document.getElementById("mobileKpiAvailable");
  const mobileKpiIssued = document.getElementById("mobileKpiIssued");
  if (mobileKpiAvailable) mobileKpiAvailable.textContent = kpis.totalAvailableCopies;
  if (mobileKpiIssued) mobileKpiIssued.textContent = kpis.currentlyIssued;
}

/**
 * Renders the Book Catalog (Task 2 & Task 3)
 */
function renderCatalog() {
  const container = document.getElementById("catalogContent");
  if (!container) return;

  const books = state.getFilteredCatalog();

  if (books.length === 0) {
    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center text-center">
        <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <i data-lucide="search-x" class="w-6 h-6"></i>
        </div>
        <h4 class="font-bold text-slate-700 dark:text-slate-300">No books found</h4>
        <p class="text-xs text-slate-400 mt-1 max-w-sm">No books match your current search query "${escapeHtml(state.searchQuery)}" or filter.</p>
        <button onclick="clearSearch()" class="mt-4 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition">
          Clear Filters
        </button>
      </div>
    `;
    lucide.createIcons({ root: container });
    return;
  }

  if (state.catalogView === "table") {
    // Render Desktop Formatted Catalog Table
    let tableHtml = `
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <th class="py-3 px-4">Book ID</th>
              <th class="py-3 px-4">Title</th>
              <th class="py-3 px-4">Author</th>
              <th class="py-3 px-4">Year</th>
              <th class="py-3 px-4 text-center">Copies</th>
              <th class="py-3 px-4">Availability</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
    `;

    books.forEach(book => {
      const isAvail = book.availableCopies > 0;
      const badgeClass = isAvail ? "badge-available" : "badge-out-of-stock";
      const badgeText = isAvail ? `${book.availableCopies} Available` : "Out of Stock";

      tableHtml += `
        <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
          <td class="py-3.5 px-4 font-mono font-medium text-xs text-indigo-600 dark:text-indigo-400">
            ${escapeHtml(book.bookId)}
          </td>
          <td class="py-3.5 px-4">
            <div class="font-semibold text-slate-900 dark:text-white">${escapeHtml(book.title)}</div>
            <span class="text-[11px] text-slate-400">${escapeHtml(book.category || 'General')}</span>
          </td>
          <td class="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
            ${escapeHtml(book.author)}
          </td>
          <td class="py-3.5 px-4 text-xs text-slate-500">
            ${book.publicationYear}
          </td>
          <td class="py-3.5 px-4 text-center font-bold text-xs ${isAvail ? 'text-slate-800 dark:text-slate-200' : 'text-rose-500'}">
            ${book.availableCopies}
          </td>
          <td class="py-3.5 px-4">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}">
              <span class="w-1.5 h-1.5 rounded-full ${isAvail ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
              ${badgeText}
            </span>
          </td>
          <td class="py-3.5 px-4 text-right">
            <div class="flex items-center justify-end gap-1.5">
              ${isAvail ? `
                <button onclick="quickIssueBook('${escapeHtml(book.bookId)}')" class="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition flex items-center gap-1" title="Issue this book">
                  <i data-lucide="arrow-up-right" class="w-3 h-3"></i>
                  <span>Issue</span>
                </button>
              ` : `
                <button disabled class="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60">
                  Out of Stock
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    });

    tableHtml += `
          </tbody>
        </table>
      </div>
    `;
    container.innerHTML = tableHtml;
  } else {
    // Render Card Grid View (App-like Bento Cards)
    let gridHtml = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">`;

    books.forEach(book => {
      const isAvail = book.availableCopies > 0;
      const badgeClass = isAvail ? "badge-available" : "badge-out-of-stock";
      const badgeText = isAvail ? `${book.availableCopies} Copies Available` : "Out of Stock";

      gridHtml += `
        <div class="bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900">
                ${escapeHtml(book.bookId)}
              </span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}">
                ${badgeText}
              </span>
            </div>
            
            <h4 class="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
              ${escapeHtml(book.title)}
            </h4>
            <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <i data-lucide="user" class="w-3 h-3"></i> ${escapeHtml(book.author)}
            </p>
          </div>

          <div class="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span class="text-slate-400">Year: ${book.publicationYear}</span>
            ${isAvail ? `
              <button onclick="quickIssueBook('${escapeHtml(book.bookId)}')" class="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1 transition shadow-sm">
                <i data-lucide="arrow-up-right" class="w-3 h-3"></i> Quick Issue
              </button>
            ` : `
              <span class="text-rose-500 font-semibold text-xs">Unavailable</span>
            `}
          </div>
        </div>
      `;
    });

    gridHtml += `</div>`;
    container.innerHTML = gridHtml;
  }

  lucide.createIcons({ root: container });
}

/**
 * Renders Currently Issued Books Table (Task 6)
 */
function renderIssuedTable() {
  const tbody = document.getElementById("issuedBooksTableBody");
  if (!tbody) return;

  const records = state.activeIssues;

  if (records.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-400 text-xs">
          <i data-lucide="check-check" class="w-6 h-6 mx-auto mb-1 text-emerald-500"></i>
          All books have been returned! No active loans at this time.
        </td>
      </tr>
    `;
    lucide.createIcons({ root: tbody });
    return;
  }

  let html = "";
  records.forEach(rec => {
    html += `
      <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
        <td class="py-3 px-4 font-mono text-xs text-slate-500">${escapeHtml(rec.transactionId)}</td>
        <td class="py-3 px-4 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">${escapeHtml(rec.bookId)}</td>
        <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 text-xs">${escapeHtml(rec.bookTitle)}</td>
        <td class="py-3 px-4 font-mono text-xs font-bold text-purple-600 dark:text-purple-400">${escapeHtml(rec.studentId)}</td>
        <td class="py-3 px-4 text-xs text-slate-500">${escapeHtml(rec.issueTimestamp)}</td>
        <td class="py-3 px-4">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold badge-issued">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            ${rec.status}
          </span>
        </td>
        <td class="py-3 px-4 text-right">
          <!-- 1-Click Return Button (Task 5) -->
          <button onclick="handleQuickReturn('${escapeHtml(rec.bookId)}', '${escapeHtml(rec.studentId)}')" class="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5 ml-auto">
            <i data-lucide="corner-down-left" class="w-3 h-3 text-emerald-500"></i>
            <span>Return Book</span>
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  lucide.createIcons({ root: tbody });
}

/**
 * Renders Transaction History Log (Collapsible)
 */
function renderHistoryTable() {
  const tbody = document.getElementById("historyTableBody");
  const countEl = document.getElementById("historyRecordCount");
  if (!tbody) return;

  const records = state.transactionHistory;
  if (countEl) countEl.textContent = `${records.length} records`;

  let html = "";
  records.forEach(rec => {
    const isReturned = rec.status === "RETURNED";
    html += `
      <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
        <td class="py-2 font-mono">${escapeHtml(rec.transactionId)}</td>
        <td class="py-2 font-mono font-semibold">${escapeHtml(rec.bookId)}</td>
        <td class="py-2 font-mono">${escapeHtml(rec.studentId)}</td>
        <td class="py-2">${escapeHtml(rec.issueTimestamp)}</td>
        <td class="py-2">${rec.returnTimestamp ? escapeHtml(rec.returnTimestamp) : '<span class="text-amber-500">Active</span>'}</td>
        <td class="py-2">
          <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold ${isReturned ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'}">
            ${rec.status}
          </span>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

/**
 * Renders Mobile App View Simulator Cards
 */
function renderMobileView() {
  const bookCardsContainer = document.getElementById("mobileBookCardsContainer");
  const issuedCardsContainer = document.getElementById("mobileIssuedCardsContainer");
  if (!bookCardsContainer || !issuedCardsContainer) return;

  // 1. Mobile Book Cards
  const books = state.getFilteredCatalog();
  let bHtml = "";
  books.forEach(b => {
    const isAvail = b.availableCopies > 0;
    bHtml += `
      <div class="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="font-mono text-[10px] font-bold text-indigo-500">${escapeHtml(b.bookId)}</span>
            <span class="text-[9px] px-1.5 py-0.2 rounded-full ${isAvail ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}">
              ${isAvail ? `${b.availableCopies} Left` : 'Sold Out'}
            </span>
          </div>
          <h5 class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">${escapeHtml(b.title)}</h5>
          <p class="text-[10px] text-slate-400 truncate">${escapeHtml(b.author)} • ${b.publicationYear}</p>
        </div>
        ${isAvail ? `
          <button onclick="quickIssueBook('${escapeHtml(b.bookId)}')" class="shrink-0 px-2 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1">
            <i data-lucide="arrow-up-right" class="w-3 h-3"></i> Issue
          </button>
        ` : `
          <span class="shrink-0 text-[10px] text-rose-500 font-semibold px-2 py-1">Unavailable</span>
        `}
      </div>
    `;
  });
  bookCardsContainer.innerHTML = bHtml;

  // 2. Mobile Issued Cards
  const issues = state.activeIssues;
  let iHtml = "";
  if (issues.length === 0) {
    iHtml = `<p class="text-[11px] text-slate-400 text-center py-4">No active loans.</p>`;
  } else {
    issues.forEach(i => {
      iHtml += `
        <div class="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-mono text-[10px] font-bold text-purple-500">${escapeHtml(i.studentId)}</span>
              <span class="text-[9px] text-slate-400">${escapeHtml(i.issueTimestamp)}</span>
            </div>
            <h6 class="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[200px]">${escapeHtml(i.bookTitle)}</h6>
          </div>
          <button onclick="handleQuickReturn('${escapeHtml(i.bookId)}', '${escapeHtml(i.studentId)}')" class="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-semibold">
            Return
          </button>
        </div>
      `;
    });
  }
  issuedCardsContainer.innerHTML = iHtml;

  lucide.createIcons({ root: document.getElementById("mobileDashboardContainer") });
}

/**
 * Populates issue modal dropdown with current books
 */
function updateIssueModalOptions() {
  const select = document.getElementById("issueBookSelect");
  if (!select) return;

  const currentSelection = select.value;
  select.innerHTML = "";

  state.books.forEach(book => {
    const opt = document.createElement("option");
    opt.value = book.bookId;
    opt.textContent = `[${book.bookId}] ${book.title} (${book.availableCopies} copies)`;
    if (book.availableCopies <= 0) {
      opt.textContent += " - OUT OF STOCK";
    }
    select.appendChild(opt);
  });

  if (currentSelection && state.books.has(currentSelection.toUpperCase())) {
    select.value = currentSelection;
  }
  onIssueBookSelectionChange();
}

function onIssueBookSelectionChange() {
  const select = document.getElementById("issueBookSelect");
  const stockEl = document.getElementById("selectedBookStockCount");
  if (!select || !stockEl) return;

  const book = state.books.get((select.value || "").toUpperCase());
  if (book) {
    stockEl.textContent = `${book.availableCopies} available`;
    stockEl.className = book.availableCopies > 0 ? "text-emerald-500 font-bold" : "text-rose-500 font-bold";
  } else {
    stockEl.textContent = "--";
  }
}

/**
 * Master Re-render Trigger
 */
function renderAll() {
  renderKPIs();
  renderCatalog();
  renderIssuedTable();
  renderHistoryTable();
  renderMobileView();
  updateIssueModalOptions();
}

// ==========================================
// USER INTERACTIONS & EVENT HANDLERS
// ==========================================

// Search Input Handler (Task 3)
function handleSearchInput(e) {
  state.searchQuery = e.target.value.trim();
  const clearBtn = document.getElementById("searchClearBtn");
  if (clearBtn) {
    if (state.searchQuery) {
      clearBtn.classList.remove("hidden");
    } else {
      clearBtn.classList.add("hidden");
    }
  }
  renderCatalog();
}

function handleMobileSearch(e) {
  state.searchQuery = e.target.value.trim();
  renderCatalog();
  renderMobileView();
}

function clearSearch() {
  state.searchQuery = "";
  const input = document.getElementById("catalogSearchInput");
  const mobInput = document.getElementById("mobileSearchInput");
  const clearBtn = document.getElementById("searchClearBtn");
  if (input) input.value = "";
  if (mobInput) mobInput.value = "";
  if (clearBtn) clearBtn.classList.add("hidden");
  renderCatalog();
  renderMobileView();
}

// Filter Pills Handler
function setFilter(filterType) {
  state.activeFilter = filterType;
  
  const allBtn = document.getElementById("filterAll");
  const availBtn = document.getElementById("filterAvailable");
  const outBtn = document.getElementById("filterOutOfStock");

  [allBtn, availBtn, outBtn].forEach(b => {
    if (b) {
      b.className = "px-3 py-1.5 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition";
    }
  });

  const activeBtn = filterType === "all" ? allBtn : (filterType === "available" ? availBtn : outBtn);
  if (activeBtn) {
    activeBtn.className = "px-3 py-1.5 rounded-lg font-semibold bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm transition";
  }

  renderCatalog();
}

// Sort Option Handler
function handleSortChange(e) {
  state.sortOption = e.target.value;
  renderCatalog();
}

// Table / Grid Switcher
function setCatalogView(mode) {
  state.catalogView = mode;
  const tableBtn = document.getElementById("viewModeTable");
  const gridBtn = document.getElementById("viewModeGrid");

  if (mode === "table") {
    tableBtn.className = "p-1.5 rounded-lg bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm";
    gridBtn.className = "p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white";
  } else {
    gridBtn.className = "p-1.5 rounded-lg bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm";
    tableBtn.className = "p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white";
  }

  renderCatalog();
}

// Viewport Switcher (Web View vs Mobile App View)
function setViewportMode(mode) {
  state.viewportMode = mode;
  const webBtn = document.getElementById("viewToggleWeb");
  const mobBtn = document.getElementById("viewToggleMobile");
  const desktopContainer = document.getElementById("desktopDashboardContainer");
  const mobileContainer = document.getElementById("mobileDashboardContainer");

  if (mode === "web") {
    webBtn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300";
    mobBtn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200";
    desktopContainer.classList.remove("hidden");
    mobileContainer.classList.add("hidden");
  } else {
    mobBtn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300";
    webBtn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200";
    desktopContainer.classList.add("hidden");
    mobileContainer.classList.remove("hidden");
  }
}

// Mobile Bottom Nav Tabs
function setMobileAppTab(tab) {
  state.mobileTab = tab;
  const catTab = document.getElementById("mobileTabCatalog");
  const issTab = document.getElementById("mobileTabIssued");
  const navCat = document.getElementById("mobNavCatalog");
  const navIss = document.getElementById("mobNavIssued");

  if (tab === "catalog") {
    catTab.classList.remove("hidden");
    issTab.classList.add("hidden");
    navCat.className = "flex flex-col items-center gap-1 text-indigo-600 dark:text-indigo-400";
    navIss.className = "flex flex-col items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200";
  } else {
    catTab.classList.add("hidden");
    issTab.classList.remove("hidden");
    navIss.className = "flex flex-col items-center gap-1 text-indigo-600 dark:text-indigo-400";
    navCat.className = "flex flex-col items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200";
  }
}

// Mobile Clock updater
function updateMobileClock() {
  const clock = document.getElementById("mobileClock");
  if (!clock) return;
  const now = new Date();
  clock.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}
setInterval(updateMobileClock, 1000);

// History Accordion Toggle
function toggleHistoryAccordion() {
  const content = document.getElementById("historyAccordionContent");
  const chevron = document.getElementById("historyAccordionChevron");
  if (!content) return;

  if (content.classList.contains("hidden")) {
    content.classList.remove("hidden");
    if (chevron) chevron.style.transform = "rotate(180deg)";
  } else {
    content.classList.add("hidden");
    if (chevron) chevron.style.transform = "rotate(0deg)";
  }
}

// Modal Management
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove("hidden");
    // Clear alerts inside
    const alert = modal.querySelector("[id$='ErrorAlert']");
    if (alert) alert.classList.add("hidden");
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("hidden");
}

function openAddBookModal() {
  document.getElementById("addBookForm").reset();
  const alert = document.getElementById("addBookErrorAlert");
  if (alert) alert.classList.add("hidden");
  openModal("addBookModal");
}

function openIssueModal(prefillBookId = null) {
  updateIssueModalOptions();
  if (prefillBookId) {
    const select = document.getElementById("issueBookSelect");
    if (select) {
      select.value = prefillBookId;
      onIssueBookSelectionChange();
    }
  }
  openModal("issueBookModal");
}

function quickIssueBook(bookId) {
  openIssueModal(bookId);
}

function openReturnModal() {
  document.getElementById("returnBookForm").reset();
  openModal("returnBookModal");
}

// Quick 1-Click Return on Issued Row
function handleQuickReturn(bookId, studentId) {
  const res = state.returnBook(bookId, studentId);
  if (res.success) {
    showToast(res.message, "success");
    logToTerminal(`[GUI Action] ${res.message}`);
    renderAll();
  } else {
    showToast(res.message, "error");
  }
}

// Add Book Form Submission (Task 1)
function handleAddBookSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("inputBookId").value;
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputPublicationYear").value;
  const copies = document.getElementById("inputAvailableCopies").value;

  const res = state.addBook(id, title, author, year, copies);
  if (!res.success) {
    const alert = document.getElementById("addBookErrorAlert");
    const msg = document.getElementById("addBookErrorMessage");
    if (alert && msg) {
      msg.textContent = res.message;
      alert.classList.remove("hidden");
    }
    showToast(res.message, "error");
    return;
  }

  closeModal("addBookModal");
  showToast(res.message, "success");
  logToTerminal(`[GUI Action] Task 1: Added new book '${title}' [${id}]`);
  renderAll();
}

// Issue Book Form Submission (Task 4)
function handleIssueBookSubmit(e) {
  e.preventDefault();
  const bookId = document.getElementById("issueBookSelect").value;
  const studentId = document.getElementById("issueStudentId").value;

  const res = state.issueBook(bookId, studentId);
  if (!res.success) {
    const alert = document.getElementById("issueErrorAlert");
    const msg = document.getElementById("issueErrorMessage");
    if (alert && msg) {
      msg.textContent = res.message;
      alert.classList.remove("hidden");
    }
    showToast(res.message, "error");
    return;
  }

  closeModal("issueBookModal");
  showToast(res.message, "success");
  logToTerminal(`[GUI Action] Task 4: Issued Book '${bookId}' to Student '${studentId}'`);
  renderAll();
}

// Return Book Form Submission (Task 5)
function handleReturnBookSubmit(e) {
  e.preventDefault();
  const bookId = document.getElementById("returnBookId").value;
  const studentId = document.getElementById("returnStudentId").value;

  const res = state.returnBook(bookId, studentId);
  if (!res.success) {
    const alert = document.getElementById("returnErrorAlert");
    const msg = document.getElementById("returnErrorMessage");
    if (alert && msg) {
      msg.textContent = res.message;
      alert.classList.remove("hidden");
    }
    showToast(res.message, "error");
    return;
  }

  closeModal("returnBookModal");
  showToast(res.message, "success");
  logToTerminal(`[GUI Action] Task 5: Returned Book '${bookId}' by Student '${studentId}'`);
  renderAll();
}

// Reset Session / Re-seed State (Task 7 Option 7)
function resetSessionState() {
  if (confirm("Reset library catalog and transaction records back to default seed data?")) {
    state.initSeedData();
    renderAll();
    showToast("Session state reset to original seeds.", "info");
    logToTerminal("[System] Library catalog and active loans reset to initial seed state.");
  }
}

// Dark Mode Toggle
function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("lms_theme", isDark ? "dark" : "light");
  updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
  const icon = document.getElementById("themeIcon");
  if (!icon) return;
  icon.setAttribute("data-lucide", isDark ? "sun" : "moon");
  lucide.createIcons({ root: icon.parentElement });
}

// ==========================================
// INTERACTIVE CONSOLE / CLI TERMINAL (Task 7)
// ==========================================
function toggleTerminalDrawer() {
  const drawer = document.getElementById("terminalDrawer");
  if (!drawer) return;

  const isClosed = drawer.classList.contains("translate-y-full");
  if (isClosed) {
    drawer.classList.remove("translate-y-full");
    document.getElementById("terminalInputField")?.focus();
  } else {
    drawer.classList.add("translate-y-full");
  }
}

function clearTerminal() {
  const output = document.getElementById("terminalOutput");
  if (output) output.innerHTML = "";
  printTerminalWelcome();
}

function logToTerminal(text, type = "normal") {
  const output = document.getElementById("terminalOutput");
  if (!output) return;

  const line = document.createElement("div");
  line.className = "terminal-line font-mono text-xs";

  if (type === "prompt") {
    line.className += " text-emerald-400 font-bold";
  } else if (type === "success") {
    line.className += " text-emerald-300";
  } else if (type === "error") {
    line.className += " text-rose-400 font-semibold";
  } else if (type === "table") {
    line.className += " text-indigo-300 whitespace-pre overflow-x-auto";
  } else if (type === "accent") {
    line.className += " text-amber-300";
  } else {
    line.className += " text-slate-300";
  }

  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function printTerminalWelcome() {
  logToTerminal("==================================================================", "accent");
  logToTerminal("  📚 BIBLIOTHECA PRO - INTERACTIVE CONSOLE TERMINAL (LMS)        ", "accent");
  logToTerminal("  Direct in-memory access: Option 1–7 or interactive command loop  ", "normal");
  logToTerminal("==================================================================", "accent");
  logToTerminal("  [1] Add a New Book            [4] Issue a Book");
  logToTerminal("  [2] Display All Books         [5] Return a Book");
  logToTerminal("  [3] Search for a Book         [6] Display Currently Issued Books");
  logToTerminal("  [7] Reset Session / Exit      [help] View quick command syntax");
  logToTerminal("------------------------------------------------------------------\n");
}

function handleTerminalSubmit(e) {
  e.preventDefault();
  const inputEl = document.getElementById("terminalInputField");
  const promptLabel = document.getElementById("terminalPromptLabel");
  if (!inputEl) return;

  const val = inputEl.value.trim();
  inputEl.value = "";

  if (!val && !state.terminalStep) return;

  // Add to command history
  if (val) {
    state.commandHistory.push(val);
    state.historyIndex = state.commandHistory.length;
  }

  // Echo user input
  logToTerminal(`${promptLabel.textContent} ${val}`, "prompt");

  // If in multi-step wizard (Option 1, 3, 4, 5)
  if (state.terminalStep) {
    handleTerminalStepInput(val);
    return;
  }

  // Dispatch Menu Choice or Command
  dispatchTerminalCommand(val);
}

function dispatchTerminalCommand(rawCmd) {
  const parts = rawCmd.split(/\s+/);
  const cmd = parts[0].toLowerCase();

  switch (cmd) {
    case "1":
      // Task 1: Add Book interactive wizard
      state.terminalStep = {
        action: "add",
        stage: 1,
        payload: {}
      };
      setTerminalPrompt("Enter Book ID: ");
      break;

    case "2":
      // Task 2: Display All Books in ASCII Table
      printTerminalCatalogTable();
      break;

    case "3":
      // Task 3: Search for Book wizard
      if (parts.length > 1) {
        const query = parts.slice(1).join(" ");
        printTerminalSearchResults(query);
      } else {
        state.terminalStep = {
          action: "search",
          stage: 1,
          payload: {}
        };
        setTerminalPrompt("Enter Search Term (ID, Title, Author): ");
      }
      break;

    case "4":
      // Task 4: Issue a Book
      if (parts.length >= 3) {
        // Direct command syntax: issue BK-101 STU-104
        executeTerminalIssue(parts[1], parts[2]);
      } else {
        state.terminalStep = {
          action: "issue",
          stage: 1,
          payload: {}
        };
        setTerminalPrompt("Enter Book ID to Issue: ");
      }
      break;

    case "5":
      // Task 5: Return a Book
      if (parts.length >= 3) {
        // Direct command syntax: return BK-101 STU-104
        executeTerminalReturn(parts[1], parts[2]);
      } else {
        state.terminalStep = {
          action: "return",
          stage: 1,
          payload: {}
        };
        setTerminalPrompt("Enter Book ID to Return: ");
      }
      break;

    case "6":
      // Task 6: Display Currently Issued Books in ASCII Table
      printTerminalIssuedTable();
      break;

    case "7":
      // Task 7: Reset / Exit
      logToTerminal("Executing Option 7: Resetting session and catalog to initial seeds...", "accent");
      state.initSeedData();
      renderAll();
      showToast("Catalog state reset via CLI.", "info");
      logToTerminal("Session reset complete. All books and loans restored.", "success");
      break;

    case "kpi":
      // Show KPI summary
      const kpis = state.getKpis();
      logToTerminal(`\n+-------------------------------------------------------+`, "table");
      logToTerminal(`|                LIVE KPI METRICS SUMMARY               |`, "table");
      logToTerminal(`+----------------------------------+--------------------+`, "table");
      logToTerminal(`| Total Registered Books           | ${String(kpis.totalBooks).padEnd(18)} |`, "table");
      logToTerminal(`| Total Available Copies           | ${String(kpis.totalAvailableCopies).padEnd(18)} |`, "table");
      logToTerminal(`| Currently Issued Books           | ${String(kpis.currentlyIssued).padEnd(18)} |`, "table");
      logToTerminal(`| Unique Active Borrowers          | ${String(kpis.uniqueBorrowers).padEnd(18)} |`, "table");
      logToTerminal(`+----------------------------------+--------------------+\n`, "table");
      break;

    case "clear":
      clearTerminal();
      break;

    case "help":
      logToTerminal("Available Terminal Commands:", "accent");
      logToTerminal("  1 - Interactive Add Book (Prompts ID, Title, Author, Year, Copies)");
      logToTerminal("  2 - Display formatted master book catalog table");
      logToTerminal("  3 - Interactive search or 'search <term>'");
      logToTerminal("  4 - Interactive issue or 'issue <bookId> <studentId>'");
      logToTerminal("  5 - Interactive return or 'return <bookId> <studentId>'");
      logToTerminal("  6 - Display formatted currently issued loans table");
      logToTerminal("  7 - Reset session to initial seed data");
      logToTerminal("  kpi - Display library KPI summary");
      logToTerminal("  clear - Clear terminal screen");
      break;

    default:
      logToTerminal(`Unknown command: '${rawCmd}'. Type 'help' or enter 1-7.`, "error");
      break;
  }
}

function setTerminalPrompt(label) {
  const promptLabel = document.getElementById("terminalPromptLabel");
  if (promptLabel) promptLabel.textContent = label;
}

function resetTerminalPrompt() {
  state.terminalStep = null;
  setTerminalPrompt("LMS >");
}

// Step-by-step interactive sub-prompts for options 1, 3, 4, 5
function handleTerminalStepInput(val) {
  const step = state.terminalStep;
  if (!step) return;

  if (step.action === "add") {
    // Task 1 Wizard
    if (step.stage === 1) {
      if (!val) {
        logToTerminal("❌ Book ID cannot be empty. Try again:", "error");
        return;
      }
      step.payload.bookId = val;
      step.stage = 2;
      setTerminalPrompt("Enter Book Title: ");
    } else if (step.stage === 2) {
      if (!val) {
        logToTerminal("❌ Book Title cannot be empty. Try again:", "error");
        return;
      }
      step.payload.title = val;
      step.stage = 3;
      setTerminalPrompt("Enter Author Name: ");
    } else if (step.stage === 3) {
      if (!val) {
        logToTerminal("❌ Author Name cannot be empty. Try again:", "error");
        return;
      }
      step.payload.author = val;
      step.stage = 4;
      setTerminalPrompt("Enter Publication Year (1450-2026): ");
    } else if (step.stage === 4) {
      const year = parseInt(val, 10);
      if (isNaN(year) || year < 1450 || year > new Date().getFullYear()) {
        logToTerminal(`❌ Invalid year. Must be between 1450 and ${new Date().getFullYear()}:`, "error");
        return;
      }
      step.payload.year = year;
      step.stage = 5;
      setTerminalPrompt("Enter Available Copies (>= 0): ");
    } else if (step.stage === 5) {
      const copies = parseInt(val, 10);
      if (isNaN(copies) || copies < 0) {
        logToTerminal("❌ Copies must be a non-negative integer. Try again:", "error");
        return;
      }
      step.payload.copies = copies;

      // Execute Add Book
      const res = state.addBook(
        step.payload.bookId,
        step.payload.title,
        step.payload.author,
        step.payload.year,
        step.payload.copies
      );

      if (res.success) {
        logToTerminal(`✅ ${res.message}`, "success");
        showToast(res.message, "success");
        renderAll();
      } else {
        logToTerminal(`❌ ${res.message}`, "error");
        showToast(res.message, "error");
      }
      resetTerminalPrompt();
    }
  } else if (step.action === "search") {
    // Task 3 Search
    printTerminalSearchResults(val);
    resetTerminalPrompt();
  } else if (step.action === "issue") {
    // Task 4 Issue Wizard
    if (step.stage === 1) {
      if (!val) {
        logToTerminal("❌ Book ID cannot be empty:", "error");
        return;
      }
      step.payload.bookId = val;
      step.stage = 2;
      setTerminalPrompt("Enter Student ID (e.g. STU-104): ");
    } else if (step.stage === 2) {
      if (!val) {
        logToTerminal("❌ Student ID cannot be empty:", "error");
        return;
      }
      executeTerminalIssue(step.payload.bookId, val);
      resetTerminalPrompt();
    }
  } else if (step.action === "return") {
    // Task 5 Return Wizard
    if (step.stage === 1) {
      if (!val) {
        logToTerminal("❌ Book ID cannot be empty:", "error");
        return;
      }
      step.payload.bookId = val;
      step.stage = 2;
      setTerminalPrompt("Enter Student ID (e.g. STU-101): ");
    } else if (step.stage === 2) {
      if (!val) {
        logToTerminal("❌ Student ID cannot be empty:", "error");
        return;
      }
      executeTerminalReturn(step.payload.bookId, val);
      resetTerminalPrompt();
    }
  }
}

function executeTerminalIssue(bookId, studentId) {
  const res = state.issueBook(bookId, studentId);
  if (res.success) {
    logToTerminal(`✅ ${res.message}`, "success");
    showToast(res.message, "success");
    renderAll();
  } else {
    logToTerminal(`❌ ${res.message}`, "error");
    showToast(res.message, "error");
  }
}

function executeTerminalReturn(bookId, studentId) {
  const res = state.returnBook(bookId, studentId);
  if (res.success) {
    logToTerminal(`✅ ${res.message}`, "success");
    showToast(res.message, "success");
    renderAll();
  } else {
    logToTerminal(`❌ ${res.message}`, "error");
    showToast(res.message, "error");
  }
}

// Formatted ASCII Table Output for Terminal
function printTerminalCatalogTable() {
  const books = Array.from(state.books.values()).sort((a, b) => a.bookId.localeCompare(b.bookId));
  const line = "+----------+----------------------------------------------------+--------------------------+------+--------+--------------+";
  
  logToTerminal(`\n${line}`, "table");
  logToTerminal(`| ${"MASTER BOOK CATALOG (JVM / KOTLIN VIEW)".padEnd(114)} |`, "table");
  logToTerminal(line, "table");
  logToTerminal(`| ${"Book ID".padEnd(8)} | ${"Title".padEnd(50)} | ${"Author".padEnd(24)} | Year | Copies | Availability |`, "table");
  logToTerminal(line, "table");

  books.forEach(b => {
    const title = b.title.length > 50 ? b.title.substring(0, 47) + "..." : b.title.padEnd(50);
    const author = b.author.length > 24 ? b.author.substring(0, 21) + "..." : b.author.padEnd(24);
    const avail = b.availableCopies > 0 ? "Available".padEnd(12) : "OUT OF STOCK".padEnd(12);

    logToTerminal(
      `| ${b.bookId.padEnd(8)} | ${title} | ${author} | ${String(b.publicationYear).padStart(4)} | ${String(b.availableCopies).padStart(6)} | ${avail} |`,
      "table"
    );
  });

  logToTerminal(`${line}\n`, "table");
}

function printTerminalSearchResults(query) {
  if (!query) {
    logToTerminal("Search term cannot be empty.", "error");
    return;
  }
  const q = query.toLowerCase();
  const matches = Array.from(state.books.values()).filter(b => 
    b.bookId.toLowerCase().includes(q) ||
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q)
  );

  const line = "+----------+----------------------------------------------------+------+--------+--------------+";
  logToTerminal(`\n${line}`, "table");
  logToTerminal(`| SEARCH RESULTS FOR: "${query}" (${matches.length} matches)`.padEnd(87) + " |", "table");
  logToTerminal(line, "table");
  logToTerminal(`| ${"Book ID".padEnd(8)} | ${"Title".padEnd(50)} | Year | Copies | Availability |`, "table");
  logToTerminal(line, "table");

  if (matches.length === 0) {
    logToTerminal(`| ${"No matching books found in catalog.".padEnd(85)} |`, "table");
  } else {
    matches.forEach(b => {
      const title = b.title.length > 50 ? b.title.substring(0, 47) + "..." : b.title.padEnd(50);
      const avail = b.availableCopies > 0 ? "Available".padEnd(12) : "OUT OF STOCK".padEnd(12);
      logToTerminal(
        `| ${b.bookId.padEnd(8)} | ${title} | ${String(b.publicationYear).padStart(4)} | ${String(b.availableCopies).padStart(6)} | ${avail} |`,
        "table"
      );
    });
  }
  logToTerminal(`${line}\n`, "table");
}

function printTerminalIssuedTable() {
  const issues = state.activeIssues;
  const line = "+----------+----------+----------------------------------------------------+------------------+----------+";

  logToTerminal(`\n${line}`, "table");
  logToTerminal(`| ${"CURRENTLY ISSUED BOOKS".padEnd(94)} |`, "table");
  logToTerminal(line, "table");
  logToTerminal(`| ${"Txn ID".padEnd(8)} | ${"Book ID".padEnd(8)} | ${"Title".padEnd(50)} | ${"Issue Date/Time".padEnd(16)} | Status   |`, "table");
  logToTerminal(line, "table");

  if (issues.length === 0) {
    logToTerminal(`| ${"No books are currently issued.".padEnd(94)} |`, "table");
  } else {
    issues.forEach(r => {
      const title = r.bookTitle.length > 50 ? r.bookTitle.substring(0, 47) + "..." : r.bookTitle.padEnd(50);
      logToTerminal(
        `| ${r.transactionId.padEnd(8)} | ${r.bookId.padEnd(8)} | ${title} | ${r.issueTimestamp.padEnd(16)} | ${r.status.padEnd(8)} |`,
        "table"
      );
    });
  }
  logToTerminal(`${line}\n`, "table");
}

// Arrow Key Terminal History Navigation
document.getElementById("terminalInputField")?.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (state.historyIndex > 0) {
      state.historyIndex--;
      e.target.value = state.commandHistory[state.historyIndex] || "";
    }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (state.historyIndex < state.commandHistory.length - 1) {
      state.historyIndex++;
      e.target.value = state.commandHistory[state.historyIndex] || "";
    } else {
      state.historyIndex = state.commandHistory.length;
      e.target.value = "";
    }
  }
});

// ==========================================
// KOTLIN CODE MODAL & SYNTAX VIEWER (Task 7)
// ==========================================
let cachedKotlinCode = "";

const FALLBACK_KOTLIN_CODE = `/**
 * ============================================================================
 * Production-Grade Library Management System (LMS)
 * Language: Kotlin (Standard JVM / Collections API)
 *
 * Core Features (Tasks 1 - 7):
 * 1. Add Book (Strict input validation & duplicate ID check)
 * 2. Display All Books (Formatted ASCII grid with availability status)
 * 3. Search for a Book (Case-insensitive ID & Title matching)
 * 4. Issue a Book (Stock check, borrower safeguard, copy decrement)
 * 5. Return a Book (Strict active loan verification, copy increment)
 * 6. Display Currently Issued Books (Detailed transaction records)
 * 7. Menu-Driven Loop (Interactive Scanner CLI with Kotlin 'when' expression)
 * ============================================================================
 */

import java.time.LocalDateTime
import java.time.Year
import java.time.format.DateTimeFormatter
import java.util.Scanner

// ==========================================
// DATA MODELS
// ==========================================

data class Book(
    val bookId: String,
    val title: String,
    val author: String,
    val publicationYear: Int,
    var availableCopies: Int
) {
    val isAvailable: Boolean
        get() = availableCopies > 0
}

data class IssueRecord(
    val transactionId: String,
    val bookId: String,
    val bookTitle: String,
    val studentId: String,
    val issueTimestamp: LocalDateTime,
    var returnTimestamp: LocalDateTime? = null,
    var status: String = "ISSUED"
)

// ==========================================
// BUSINESS LOGIC & IN-MEMORY ENGINE
// ==========================================

class LibraryManager {
    // Fast O(1) primary key lookups using case-insensitive normalized keys
    private val books: MutableMap<String, Book> = HashMap()

    // Transaction records maintained via Kotlin MutableList
    private val activeIssues: MutableList<IssueRecord> = mutableListOf()
    private val transactionHistory: MutableList<IssueRecord> = mutableListOf()

    private var transactionCounter: Int = 1004
    private val dateFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")

    init {
        seedInitialData()
    }

    private fun seedInitialData() {
        val seedBooks = listOf(
            Book("BK-101", "Clean Code: A Handbook of Agile Software Craftsmanship", "Robert C. Martin", 2008, 3),
            Book("BK-102", "Design Patterns: Elements of Reusable Object-Oriented Software", "Erich Gamma et al.", 1994, 2),
            Book("BK-103", "Introduction to Algorithms (CLRS 3rd Ed)", "Thomas H. Cormen et al.", 2009, 4),
            Book("BK-104", "Structure and Interpretation of Computer Programs", "Harold Abelson & Gerald Sussman", 1996, 0),
            Book("BK-105", "The Pragmatic Programmer: 20th Anniversary Edition", "Andrew Hunt & David Thomas", 1999, 5),
            Book("BK-106", "Designing Data-Intensive Applications", "Martin Kleppmann", 2017, 2),
            Book("BK-107", "Kotlin in Action", "Dmitry Jemerov & Svetlana Isakova", 2017, 3),
            Book("BK-108", "To Kill a Mockingbird", "Harper Lee", 1960, 4)
        )

        for (book in seedBooks) {
            books[book.bookId.uppercase()] = book
        }

        val initialLoans = listOf(
            IssueRecord("TXN-1001", "BK-101", "Clean Code: A Handbook of Agile Software Craftsmanship", "STU-101", LocalDateTime.now().minusDays(3)),
            IssueRecord("TXN-1002", "BK-103", "Introduction to Algorithms (CLRS 3rd Ed)", "STU-102", LocalDateTime.now().minusDays(2)),
            IssueRecord("TXN-1003", "BK-106", "Designing Data-Intensive Applications", "STU-103", LocalDateTime.now().minusDays(1))
        )

        activeIssues.addAll(initialLoans)
        transactionHistory.addAll(initialLoans)
    }

    // Task 1: Add Book (With Strict Validation)
    fun addBook(rawBookId: String, rawTitle: String, rawAuthor: String, publicationYear: Int, availableCopies: Int): Pair<Boolean, String> {
        val bookId = rawBookId.trim()
        val title = rawTitle.trim()
        val author = rawAuthor.trim()

        if (bookId.isEmpty()) return Pair(false, "Validation Error: Book ID cannot be empty.")
        if (title.isEmpty()) return Pair(false, "Validation Error: Book Title cannot be empty.")
        if (author.isEmpty()) return Pair(false, "Validation Error: Author Name cannot be empty.")

        val normalizedId = bookId.uppercase()
        if (books.containsKey(normalizedId)) {
            return Pair(false, "Validation Error: Book with ID '$bookId' already exists in catalog.")
        }

        val currentYear = Year.now().value
        if (publicationYear < 1450 || publicationYear > currentYear) {
            return Pair(false, "Validation Error: Publication year must be between 1450 and $currentYear.")
        }

        if (availableCopies < 0) {
            return Pair(false, "Validation Error: Available copies cannot be negative.")
        }

        val newBook = Book(bookId, title, author, publicationYear, availableCopies)
        books[normalizedId] = newBook
        return Pair(true, "Success: Book '$title' [ID: $bookId] successfully added to catalog.")
    }

    // Task 2: Display All Books
    fun displayAllBooks(): List<Book> {
        val catalog = books.values.sortedBy { it.bookId }
        printCatalogTable(catalog, "MASTER BOOK CATALOG")
        return catalog
    }

    // Task 3: Real-Time Search & Filtering
    fun searchBooks(query: String): List<Book> {
        val trimmed = query.trim().lowercase()
        if (trimmed.isEmpty()) return emptyList()

        val results = books.values.filter { book ->
            book.bookId.lowercase().contains(trimmed) ||
            book.title.lowercase().contains(trimmed) ||
            book.author.lowercase().contains(trimmed)
        }.sortedBy { it.bookId }

        printCatalogTable(results, "SEARCH RESULTS FOR: \\"$query\\"")
        return results
    }

    // Task 4: Issue a Book
    fun issueBook(rawBookId: String, rawStudentId: String): Pair<Boolean, String> {
        val bookId = rawBookId.trim()
        val studentId = rawStudentId.trim()

        if (bookId.isEmpty()) return Pair(false, "Validation Error: Book ID is required.")
        if (studentId.isEmpty()) return Pair(false, "Validation Error: Student ID is required.")

        val normalizedBookId = bookId.uppercase()
        val book = books[normalizedBookId]
            ?: return Pair(false, "Issue Error: Book with ID '$bookId' does not exist in catalog.")

        if (book.availableCopies <= 0) {
            return Pair(false, "Issue Error: No copies available for '\${book.title}' (Out of Stock).")
        }

        val alreadyHolding = activeIssues.any {
            it.bookId.equals(book.bookId, ignoreCase = true) &&
            it.studentId.equals(studentId, ignoreCase = true)
        }
        if (alreadyHolding) {
            return Pair(false, "Issue Safeguard: Student '$studentId' already holds an unreturned copy of '\${book.title}'.")
        }

        book.availableCopies -= 1
        val txnId = "TXN-\${transactionCounter++}"
        val record = IssueRecord(txnId, book.bookId, book.title, studentId.uppercase(), LocalDateTime.now())
        activeIssues.add(record)
        transactionHistory.add(record)

        return Pair(true, "Success: Book '\${book.title}' issued to $studentId. Remaining copies: \${book.availableCopies} (Txn: $txnId)")
    }

    // Task 5: Return a Book
    fun returnBook(rawBookId: String, rawStudentId: String): Pair<Boolean, String> {
        val bookId = rawBookId.trim()
        val studentId = rawStudentId.trim()

        if (bookId.isEmpty()) return Pair(false, "Validation Error: Book ID is required.")
        if (studentId.isEmpty()) return Pair(false, "Validation Error: Student ID is required.")

        val recordIndex = activeIssues.indexOfFirst {
            it.bookId.equals(bookId, ignoreCase = true) &&
            it.studentId.equals(studentId, ignoreCase = true)
        }

        if (recordIndex == -1) {
            return Pair(false, "Return Error: No active issue record found for Book '$bookId' borrowed by Student '$studentId'.")
        }

        val record = activeIssues.removeAt(recordIndex)
        record.returnTimestamp = LocalDateTime.now()
        record.status = "RETURNED"

        val normalizedBookId = record.bookId.uppercase()
        val book = books[normalizedBookId]
        if (book != null) {
            book.availableCopies += 1
        }

        return Pair(true, "Success: Book '\${record.bookTitle}' [ID: \${record.bookId}] returned by $studentId. Restored copies: \${book?.availableCopies ?: \\"N/A\\"}.")
    }

    // Task 6: Display Currently Issued Books
    fun displayIssuedBooks(): List<IssueRecord> {
        printIssuedTable(activeIssues, "CURRENTLY ISSUED BOOKS")
        return activeIssues
    }

    fun printKpiSummary() {
        val totalBooks = books.size
        val totalAvailableCopies = books.values.sumOf { it.availableCopies }
        val currentlyIssued = activeIssues.size
        val uniqueBorrowers = activeIssues.map { it.studentId }.distinct().size

        println("\\n+--------------------------------------------------------------------------------+")
        println("|                             LIBRARY KPI SUMMARY                                |")
        println("+-----------------------------------+--------------------------------------------+")
        println(String.format("| %-33s | %-42d |", "Total Registered Books", totalBooks))
        println(String.format("| %-33s | %-42d |", "Total Available Copies", totalAvailableCopies))
        println(String.format("| %-33s | %-42d |", "Currently Issued Books", currentlyIssued))
        println(String.format("| %-33s | %-42d |", "Unique Active Borrowers", uniqueBorrowers))
        println("+-----------------------------------+--------------------------------------------+\\n")
    }

    private fun printCatalogTable(catalog: List<Book>, titleHeader: String) {
        val line = "+----------+----------------------------------------------------+--------------------------+------+--------+--------------+"
        println("\\n$line")
        println(String.format("| %-114s |", titleHeader.center(114)))
        println(line)
        println(String.format("| %-8s | %-50s | %-24s | %-4s | %-6s | %-12s |", "Book ID", "Title", "Author", "Year", "Copies", "Availability"))
        println(line)

        if (catalog.isEmpty()) {
            println(String.format("| %-114s |", "No books found in this view.".center(114)))
        } else {
            for (b in catalog) {
                val status = if (b.isAvailable) "Available" else "OUT OF STOCK"
                val truncatedTitle = if (b.title.length > 50) b.title.substring(0, 47) + "..." else b.title
                val truncatedAuthor = if (b.author.length > 24) b.author.substring(0, 21) + "..." else b.author
                println(String.format("| %-8s | %-50s | %-24s | %4d | %6d | %-12s |", b.bookId, truncatedTitle, truncatedAuthor, b.publicationYear, b.availableCopies, status))
            }
        }
        println("$line\\n")
    }

    private fun printIssuedTable(records: List<IssueRecord>, titleHeader: String) {
        val line = "+----------+----------+----------------------------------------------------+------------------+----------+"
        println("\\n$line")
        println(String.format("| %-94s |", titleHeader.center(94)))
        println(line)
        println(String.format("| %-8s | %-8s | %-50s | %-16s | %-8s |", "Txn ID", "Book ID", "Title", "Issue Date/Time", "Status"))
        println(line)

        if (records.isEmpty()) {
            println(String.format("| %-94s |", "No books are currently issued.".center(94)))
        } else {
            for (r in records) {
                val formattedDate = r.issueTimestamp.format(dateFormatter)
                val truncatedTitle = if (r.bookTitle.length > 50) r.bookTitle.substring(0, 47) + "..." else r.bookTitle
                println(String.format("| %-8s | %-8s | %-50s | %-16s | %-8s |", r.transactionId, r.bookId, truncatedTitle, formattedDate, r.status))
            }
        }
        println("$line\\n")
    }

    private fun String.center(width: Int): String {
        if (this.length >= width) return this.take(width)
        val pad = (width - this.length) / 2
        val left = " ".repeat(pad)
        val right = " ".repeat(width - this.length - pad)
        return left + this + right
    }
}

// Task 7: Interactive Menu-Driven Loop
fun main() {
    val library = LibraryManager()
    val scanner = Scanner(System.\`in\`)
    var running = true

    while (running) {
        library.printKpiSummary()
        println("=== LMS MAIN MENU ===")
        println("1. Add a New Book")
        println("2. Display All Books")
        println("3. Search for a Book")
        println("4. Issue a Book")
        println("5. Return a Book")
        println("6. Display Currently Issued Books")
        println("7. Exit Application")
        print("\\nEnter choice (1-7): ")

        val input = scanner.nextLine().trim()

        when (input) {
            "1" -> {
                print("Enter Book ID: "); val id = scanner.nextLine()
                print("Enter Book Title: "); val title = scanner.nextLine()
                print("Enter Author Name: "); val author = scanner.nextLine()
                print("Enter Publication Year: "); val year = scanner.nextLine().trim().toIntOrNull() ?: continue
                print("Enter Available Copies: "); val copies = scanner.nextLine().trim().toIntOrNull() ?: continue
                val (success, message) = library.addBook(id, title, author, year, copies)
                if (success) println("✅ $message") else println("❌ $message")
            }
            "2" -> library.displayAllBooks()
            "3" -> {
                print("Enter Search Term: "); val query = scanner.nextLine()
                library.searchBooks(query)
            }
            "4" -> {
                print("Enter Book ID to Issue: "); val bookId = scanner.nextLine()
                print("Enter Student ID: "); val studentId = scanner.nextLine()
                val (success, message) = library.issueBook(bookId, studentId)
                if (success) println("✅ $message") else println("❌ $message")
            }
            "5" -> {
                print("Enter Book ID to Return: "); val bookId = scanner.nextLine()
                print("Enter Student ID: "); val studentId = scanner.nextLine()
                val (success, message) = library.returnBook(bookId, studentId)
                if (success) println("✅ $message") else println("❌ $message")
            }
            "6" -> library.displayIssuedBooks()
            "7" -> { println("Exiting LMS. Goodbye!"); running = false }
            else -> println("Invalid selection. Please enter 1-7.")
        }

        if (running) {
            println("Press ENTER to return to menu...")
            scanner.nextLine()
        }
    }
}`;

async function openKotlinModal() {
  openModal("kotlinModal");
  const codeEl = document.getElementById("kotlinCodeDisplay");
  if (!codeEl) return;

  if (cachedKotlinCode) {
    codeEl.innerHTML = highlightKotlin(cachedKotlinCode);
    return;
  }

  try {
    const res = await fetch("LibraryManagementSystem.kt");
    if (res.ok) {
      cachedKotlinCode = await res.text();
    } else {
      cachedKotlinCode = FALLBACK_KOTLIN_CODE;
    }
  } catch (err) {
    // Graceful fallback for file:// protocol or offline access
    cachedKotlinCode = FALLBACK_KOTLIN_CODE;
  }

  codeEl.innerHTML = highlightKotlin(cachedKotlinCode);
}

function copyKotlinCode() {
  const code = cachedKotlinCode || FALLBACK_KOTLIN_CODE;
  navigator.clipboard.writeText(code).then(() => {
    const textEl = document.getElementById("copyCodeText");
    if (textEl) {
      textEl.textContent = "Copied!";
      setTimeout(() => { textEl.textContent = "Copy Code"; }, 2000);
    }
    showToast("Kotlin source code copied to clipboard!", "success");
  }).catch(() => {
    showToast("Failed to copy code to clipboard.", "error");
  });
}

function downloadKotlinFile() {
  const code = cachedKotlinCode || FALLBACK_KOTLIN_CODE;
  const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "LibraryManagementSystem.kt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Downloading LibraryManagementSystem.kt", "info");
}

/**
 * Lightweight syntax highlighter for Kotlin tokens
 */
function highlightKotlin(src) {
  let escaped = escapeHtml(src);

  // Comments
  escaped = escaped.replace(/(\/\*[\s\S]*?\*\/|\/\/.*$)/gm, '<span class="syn-comment">$1</span>');

  // Strings
  escaped = escaped.replace(/(&quot;.*?&quot;)/g, '<span class="syn-string">$1</span>');

  // Keywords
  const keywords = /\b(package|import|data class|class|fun|val|var|when|if|else|return|while|for|in|is|init|private|public|override|null|true|false)\b/g;
  escaped = escaped.replace(keywords, '<span class="syn-keyword">$1</span>');

  // Types
  const types = /\b(String|Int|Boolean|List|MutableList|Map|MutableMap|HashMap|Scanner|LocalDateTime|DateTimeFormatter|Year|Pair|Result|Array)\b/g;
  escaped = escaped.replace(types, '<span class="syn-type">$1</span>');

  return escaped;
}

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Theme initialization
  const savedTheme = localStorage.getItem("lms_theme");
  if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
    updateThemeIcon(true);
  } else {
    document.documentElement.classList.remove("dark");
    updateThemeIcon(false);
  }

  // Initial Data Render
  renderAll();
  printTerminalWelcome();

  // Initialize Lucide Icons
  lucide.createIcons();
});
