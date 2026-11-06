/**
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

/**
 * Represents a library book entry.
 *
 * @property bookId Unique alphanumeric identifier (e.g., BK-101)
 * @property title Full title of the book
 * @property author Name of author(s)
 * @property publicationYear Year of publication (1450 to Current Year)
 * @property availableCopies Current inventory available for borrowing
 */
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

/**
 * Represents an issue transaction record.
 *
 * @property transactionId Unique loan identifier (e.g., TXN-1001)
 * @property bookId Foreign key referencing [Book.bookId]
 * @property bookTitle Cached book title for historical clarity
 * @property studentId Identifier of the borrowing student (e.g., STU-101)
 * @property issueTimestamp Timestamp when book was issued
 * @property returnTimestamp Timestamp when book was returned (nullable)
 * @property status Current transaction status ("ISSUED" or "RETURNED")
 */
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

    /**
     * Seeds realistic computer science and literature books and active loans.
     */
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

        // Active issue records
        val initialLoans = listOf(
            IssueRecord("TXN-1001", "BK-101", "Clean Code: A Handbook of Agile Software Craftsmanship", "STU-101", LocalDateTime.now().minusDays(3)),
            IssueRecord("TXN-1002", "BK-103", "Introduction to Algorithms (CLRS 3rd Ed)", "STU-102", LocalDateTime.now().minusDays(2)),
            IssueRecord("TXN-1003", "BK-106", "Designing Data-Intensive Applications", "STU-103", LocalDateTime.now().minusDays(1))
        )

        activeIssues.addAll(initialLoans)
        transactionHistory.addAll(initialLoans)
    }

    // -------------------------------------------------------------
    // Task 1: Add Book (With Strict Validation)
    // -------------------------------------------------------------
    fun addBook(
        rawBookId: String,
        rawTitle: String,
        rawAuthor: String,
        publicationYear: Int,
        availableCopies: Int
    ): Pair<Boolean, String> {
        val bookId = rawBookId.trim()
        val title = rawTitle.trim()
        val author = rawAuthor.trim()

        // 1. Empty string validation
        if (bookId.isEmpty()) return Pair(false, "Validation Error: Book ID cannot be empty.")
        if (title.isEmpty()) return Pair(false, "Validation Error: Book Title cannot be empty.")
        if (author.isEmpty()) return Pair(false, "Validation Error: Author Name cannot be empty.")

        // 2. Duplicate Book ID check (case-insensitive)
        val normalizedId = bookId.uppercase()
        if (books.containsKey(normalizedId)) {
            return Pair(false, "Validation Error: Book with ID '$bookId' already exists in catalog.")
        }

        // 3. Publication Year validation (1450 to current year)
        val currentYear = Year.now().value
        if (publicationYear < 1450 || publicationYear > currentYear) {
            return Pair(false, "Validation Error: Publication year must be between 1450 and $currentYear.")
        }

        // 4. Copy Count validation (>= 0)
        if (availableCopies < 0) {
            return Pair(false, "Validation Error: Available copies cannot be negative.")
        }

        val newBook = Book(
            bookId = bookId,
            title = title,
            author = author,
            publicationYear = publicationYear,
            availableCopies = availableCopies
        )

        books[normalizedId] = newBook
        return Pair(true, "Success: Book '$title' [ID: $bookId] successfully added to catalog.")
    }

    // -------------------------------------------------------------
    // Task 2: Display All Books (Formatted Console Table)
    // -------------------------------------------------------------
    fun displayAllBooks(): List<Book> {
        val catalog = books.values.sortedBy { it.bookId }
        printCatalogTable(catalog, "MASTER BOOK CATALOG")
        return catalog
    }

    // -------------------------------------------------------------
    // Task 3: Real-Time Search & Filtering
    // -------------------------------------------------------------
    fun searchBooks(query: String): List<Book> {
        val trimmed = query.trim().lowercase()
        if (trimmed.isEmpty()) return emptyList()

        val results = books.values.filter { book ->
            book.bookId.lowercase().contains(trimmed) ||
            book.title.lowercase().contains(trimmed) ||
            book.author.lowercase().contains(trimmed)
        }.sortedBy { it.bookId }

        printCatalogTable(results, "SEARCH RESULTS FOR: \"$query\"")
        return results
    }

    // -------------------------------------------------------------
    // Task 4: Issue a Book
    // -------------------------------------------------------------
    fun issueBook(rawBookId: String, rawStudentId: String): Pair<Boolean, String> {
        val bookId = rawBookId.trim()
        val studentId = rawStudentId.trim()

        if (bookId.isEmpty()) return Pair(false, "Validation Error: Book ID is required.")
        if (studentId.isEmpty()) return Pair(false, "Validation Error: Student ID is required.")

        val normalizedBookId = bookId.uppercase()
        val book = books[normalizedBookId]
            ?: return Pair(false, "Issue Error: Book with ID '$bookId' does not exist in catalog.")

        // Check copy inventory
        if (book.availableCopies <= 0) {
            return Pair(false, "Issue Error: No copies available for '${book.title}' (Out of Stock).")
        }

        // Safeguard: Check if student already has an active, unreturned copy of this book
        val alreadyHolding = activeIssues.any {
            it.bookId.equals(book.bookId, ignoreCase = true) &&
            it.studentId.equals(studentId, ignoreCase = true)
        }
        if (alreadyHolding) {
            return Pair(false, "Issue Safeguard: Student '$studentId' already holds an unreturned copy of '${book.title}'.")
        }

        // Decrement available copies
        book.availableCopies -= 1

        val txnId = "TXN-${transactionCounter++}"
        val record = IssueRecord(
            transactionId = txnId,
            bookId = book.bookId,
            bookTitle = book.title,
            studentId = studentId.uppercase(),
            issueTimestamp = LocalDateTime.now()
        )

        activeIssues.add(record)
        transactionHistory.add(record)

        return Pair(
            true,
            "Success: Book '${book.title}' issued to $studentId. Remaining copies: ${book.availableCopies} (Txn: $txnId)"
        )
    }

    // -------------------------------------------------------------
    // Task 5: Return a Book
    // -------------------------------------------------------------
    fun returnBook(rawBookId: String, rawStudentId: String): Pair<Boolean, String> {
        val bookId = rawBookId.trim()
        val studentId = rawStudentId.trim()

        if (bookId.isEmpty()) return Pair(false, "Validation Error: Book ID is required.")
        if (studentId.isEmpty()) return Pair(false, "Validation Error: Student ID is required.")

        // Strict validation: find matching unreturned issue record
        val recordIndex = activeIssues.indexOfFirst {
            it.bookId.equals(bookId, ignoreCase = true) &&
            it.studentId.equals(studentId, ignoreCase = true)
        }

        if (recordIndex == -1) {
            return Pair(
                false,
                "Return Error: No active issue record found for Book '$bookId' borrowed by Student '$studentId'."
            )
        }

        val record = activeIssues.removeAt(recordIndex)
        record.returnTimestamp = LocalDateTime.now()
        record.status = "RETURNED"

        // Increment available copies
        val normalizedBookId = record.bookId.uppercase()
        val book = books[normalizedBookId]
        if (book != null) {
            book.availableCopies += 1
        }

        return Pair(
            true,
            "Success: Book '${record.bookTitle}' [ID: ${record.bookId}] returned by $studentId. Restored copies: ${book?.availableCopies ?: "N/A"}."
        )
    }

    // -------------------------------------------------------------
    // Task 6: Display Currently Issued Books
    // -------------------------------------------------------------
    fun displayIssuedBooks(): List<IssueRecord> {
        printIssuedTable(activeIssues, "CURRENTLY ISSUED BOOKS")
        return activeIssues
    }

    // -------------------------------------------------------------
    // KPI Metrics Summary
    // -------------------------------------------------------------
    fun printKpiSummary() {
        val totalBooks = books.size
        val totalAvailableCopies = books.values.sumOf { it.availableCopies }
        val currentlyIssued = activeIssues.size
        val uniqueBorrowers = activeIssues.map { it.studentId }.distinct().size

        println("\n+--------------------------------------------------------------------------------+")
        println("|                             LIBRARY KPI SUMMARY                                |")
        println("+-----------------------------------+--------------------------------------------+")
        println(String.format("| %-33s | %-42d |", "Total Registered Books", totalBooks))
        println(String.format("| %-33s | %-42d |", "Total Available Copies", totalAvailableCopies))
        println(String.format("| %-33s | %-42d |", "Currently Issued Books", currentlyIssued))
        println(String.format("| %-33s | %-42d |", "Unique Active Borrowers", uniqueBorrowers))
        println("+-----------------------------------+--------------------------------------------+\n")
    }

    // -------------------------------------------------------------
    // Formatted Table Printers (String.format with Box Borders)
    // -------------------------------------------------------------
    private fun printCatalogTable(catalog: List<Book>, titleHeader: String) {
        val line = "+----------+----------------------------------------------------+--------------------------+------+--------+--------------+"
        println("\n$line")
        println(String.format("| %-114s |", titleHeader.center(114)))
        println(line)
        println(String.format(
            "| %-8s | %-50s | %-24s | %-4s | %-6s | %-12s |",
            "Book ID", "Title", "Author", "Year", "Copies", "Availability"
        ))
        println(line)

        if (catalog.isEmpty()) {
            println(String.format("| %-114s |", "No books found in this view.".center(114)))
        } else {
            for (b in catalog) {
                val status = if (b.isAvailable) "Available" else "OUT OF STOCK"
                val truncatedTitle = if (b.title.length > 50) b.title.substring(0, 47) + "..." else b.title
                val truncatedAuthor = if (b.author.length > 24) b.author.substring(0, 21) + "..." else b.author

                println(String.format(
                    "| %-8s | %-50s | %-24s | %4d | %6d | %-12s |",
                    b.bookId, truncatedTitle, truncatedAuthor, b.publicationYear, b.availableCopies, status
                ))
            }
        }
        println("$line\n")
    }

    private fun printIssuedTable(records: List<IssueRecord>, titleHeader: String) {
        val line = "+----------+----------+----------------------------------------------------+------------------+----------+"
        println("\n$line")
        println(String.format("| %-94s |", titleHeader.center(94)))
        println(line)
        println(String.format(
            "| %-8s | %-8s | %-50s | %-16s | %-8s |",
            "Txn ID", "Book ID", "Title", "Issue Date/Time", "Status"
        ))
        println(line)

        if (records.isEmpty()) {
            println(String.format("| %-94s |", "No books are currently issued.".center(94)))
        } else {
            for (r in records) {
                val formattedDate = r.issueTimestamp.format(dateFormatter)
                val truncatedTitle = if (r.bookTitle.length > 50) r.bookTitle.substring(0, 47) + "..." else r.bookTitle

                println(String.format(
                    "| %-8s | %-8s | %-50s | %-16s | %-8s |",
                    r.transactionId, r.bookId, truncatedTitle, formattedDate, r.status
                ))
            }
        }
        println("$line\n")
    }

    private fun String.center(width: Int): String {
        if (this.length >= width) return this.take(width)
        val pad = (width - this.length) / 2
        val left = " ".repeat(pad)
        val right = " ".repeat(width - this.length - pad)
        return left + this + right
    }
}

// ==========================================
// Task 7: Interactive Menu-Driven Loop (Main)
// ==========================================

fun main() {
    val library = LibraryManager()
    val scanner = Scanner(System.`in`)
    var running = true

    println("""
    ========================================================================
     LIBRARY MANAGEMENT SYSTEM (LMS) - KOTLIN CONSOLE EDITION
     Architecture: MutableMap<String, Book> + MutableList<IssueRecord>
    ========================================================================
    """.trimIndent())

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
        print("\nEnter choice (1-7): ")

        val input = scanner.nextLine().trim()

        // Kotlin 'when' expression menu dispatcher
        when (input) {
            "1" -> {
                println("\n--- [Task 1: Add New Book] ---")
                print("Enter Book ID (e.g., BK-109): ")
                val id = scanner.nextLine()

                print("Enter Book Title: ")
                val title = scanner.nextLine()

                print("Enter Author Name: ")
                val author = scanner.nextLine()

                print("Enter Publication Year: ")
                val yearInput = scanner.nextLine().trim()
                val year = yearInput.toIntOrNull()
                if (year == null) {
                    println("❌ Error: Invalid number for publication year.")
                    continue
                }

                print("Enter Available Copies: ")
                val copiesInput = scanner.nextLine().trim()
                val copies = copiesInput.toIntOrNull()
                if (copies == null) {
                    println("❌ Error: Invalid number for available copies.")
                    continue
                }

                val (success, message) = library.addBook(id, title, author, year, copies)
                if (success) println("✅ $message") else println("❌ $message")
            }

            "2" -> {
                println("\n--- [Task 2: Master Book Catalog] ---")
                library.displayAllBooks()
            }

            "3" -> {
                println("\n--- [Task 3: Search Catalog] ---")
                print("Enter Search Term (Book ID, Title, or Author): ")
                val query = scanner.nextLine()
                val results = library.searchBooks(query)
                println("Found ${results.size} match(es).")
            }

            "4" -> {
                println("\n--- [Task 4: Issue a Book] ---")
                print("Enter Book ID to Issue: ")
                val bookId = scanner.nextLine()

                print("Enter Student ID (e.g., STU-104): ")
                val studentId = scanner.nextLine()

                val (success, message) = library.issueBook(bookId, studentId)
                if (success) println("✅ $message") else println("❌ $message")
            }

            "5" -> {
                println("\n--- [Task 5: Return a Book] ---")
                print("Enter Book ID to Return: ")
                val bookId = scanner.nextLine()

                print("Enter Student ID: ")
                val studentId = scanner.nextLine()

                val (success, message) = library.returnBook(bookId, studentId)
                if (success) println("✅ $message") else println("❌ $message")
            }

            "6" -> {
                println("\n--- [Task 6: Currently Issued Books] ---")
                library.displayIssuedBooks()
            }

            "7" -> {
                println("\nExiting Library Management System. Have a productive day!")
                running = false
            }

            else -> {
                println("\n⚠️ Invalid selection. Please enter a number between 1 and 7.")
            }
        }

        if (running) {
            println("Press ENTER to return to menu...")
            scanner.nextLine()
        }
    }
}

