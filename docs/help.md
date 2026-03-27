# PostGrip User Guide

## Getting Started

### Connecting to a Database

1. Click the **+** button in the Connections panel or use **File > New Connection**
2. Enter your PostgreSQL connection details:
   - **Host** -- the server address (default: 127.0.0.1)
   - **Port** -- the PostgreSQL port (default: 5432)
   - **User** -- your database username (default: postgres)
   - **Password** -- your password, or select **pgpass** auth to use ~/.pgpass
   - **Database** -- the database name (default: postgres)
3. Click **Test Connection** to verify, then **Connect** to save and connect

### Using ~/.pgpass

PostGrip automatically detects entries in your `~/.pgpass` file and displays them in the Connections panel under the **.pgpass** section. Click any entry to pre-fill the connection form.

The pgpass format is: `hostname:port:database:username:password`

### SSH Tunneling

To connect through a bastion host:

1. Open the **SSH / SSL** tab in the connection dialog
2. Enable **SSH Tunnel**
3. Enter the SSH host, port, user, and authentication method (password or private key)
4. PostGrip routes your database connection through the SSH tunnel automatically

---

## Schema Explorer

The **Database** tab in the Explorer panel shows your database structure:

- **Schemas** -- expand to see tables and views
- **Tables** -- expand to see columns, keys, and indexes
- **Columns** -- shows data type, nullability, and default values
- **Keys** -- primary keys, unique constraints, and foreign keys
- **Indexes** -- index names, columns, and uniqueness

Right-click any table for a context menu with additional operations.

---

## SQL Editor

Click **SQL Editor** in the menu bar or press the editor icon in the toolbar.

### Writing Queries

- The editor provides **SQL syntax highlighting** and **schema-aware autocomplete**
- Type table or column names to see suggestions from your connected database
- Use the query presets dropdown for common queries (Session info, Tables, Activity)

### Running Queries

- Click **Run** or press the run button to execute your query
- Results appear in the Data pane below with sortable, paginated columns
- Click column headers to sort ascending/descending

### Multiple Tabs

- Click **+** to open new query tabs
- Each tab maintains its own SQL and results independently
- Close tabs with the **x** button

### Saving Queries

Use **File > Save** or the export options to save your query text to a `.sql` file.

---

## Data Pane

The Data pane shows query results and table data.

### Viewing Results

- Results display in a grid with column headers
- **Resize columns** by dragging the right edge of any column header
- **Sort** by clicking column headers
- **Paginate** using the navigation controls at the bottom

### Editing Table Data

1. Right-click a table in the Explorer and select **Edit Data**
2. **Double-click** any cell to edit its value
3. Use **Tab** / **Shift+Tab** to navigate between cells
4. Click **+ Row** to add a new row
5. Click the delete icon to mark rows for deletion
6. Review pending changes in the toolbar, then click **Apply** to commit or **Discard** to cancel

All changes are applied in a single database transaction.

---

## Table Operations

Right-click any table in the Schema Explorer for these operations:

| Operation | Description |
|-----------|-------------|
| **Preview** | View the first rows of the table |
| **Show DDL** | Display the CREATE TABLE statement |
| **Edit Data** | Open the inline data editor |
| **Modify Table** | Add, drop, or rename columns; change types and defaults |
| **Export CSV** | Export table data to a CSV file |
| **Export pg_dump** | Export using pg_dump (SQL, custom, or tar format) |
| **Truncate** | Remove all rows (with optional CASCADE) |
| **Drop** | Permanently delete the table (with optional CASCADE) |

### Modify Table

The Modify Table dialog lets you:

- Rename the table
- Add new columns with type, nullability, and default value
- Drop existing columns
- Rename columns
- Change column data types
- Toggle NOT NULL constraints
- Set or remove default values

A live DDL preview shows the ALTER TABLE statements that will be executed. All changes are applied in a single transaction.

---

## Dashboard

When connected to a database, the Dashboard panel shows real-time server metrics:

- **CPU Usage** -- server CPU utilization (Linux servers with superuser access)
- **RAM Usage** -- server memory utilization (Linux servers with superuser access)
- **Cache Hit Ratio** -- database buffer cache effectiveness
- **Transaction Throughput** -- transactions per second (TPS)
- **Connection Saturation** -- active connections vs. max_connections

Metrics update every 10 seconds and display sparkline graphs for trend visualization. Polling automatically pauses when the app window is not visible.

---

## File Explorer

The **Files** tab in the Explorer panel lets you browse your local filesystem:

- Click folders to expand/collapse them
- Double-click folders to navigate into them
- Click the **up arrow** to go to the parent directory
- Click any file to open it -- `.sql` files open in the SQL Editor

---

## Git Integration

The **Git** tab in the Explorer panel shows git repositories found in your developer directories:

### Repository List

Repositories are automatically discovered from common directories (~/Developer, ~/Projects, ~/repos, etc.). Click a repository to:

- View its current **branch**
- See **changed files** with status indicators (M=Modified, A=Added, D=Deleted)
- Browse **recent commits**
- Expand the repository as a **file tree**

### Working with Changes

- Click a **modified file** to view its diff
- Click an **untracked file** to open it in the editor
- `.sql` files always open in the SQL Editor

---

## Export Options

### CSV Export

- From results: Use **View > Export CSV** to export the current query results
- From tables: Right-click a table and select **Export CSV**

### Excel Export

Query results can be exported to Excel format via the View menu.

### pg_dump Export

Right-click a table and select **Export pg_dump** to export using PostgreSQL's native dump tool. Supported formats:

- **SQL** -- plain SQL statements
- **Custom** -- compressed binary format (restorable with pg_restore)
- **Tar** -- tar archive format

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Navigate cells (Edit Data) | Tab / Shift+Tab |
| Confirm cell edit | Enter |
| Cancel cell edit | Escape |

---

## Tips

- **Quick connect**: If your credentials are in ~/.pgpass, PostGrip shows them in the sidebar for one-click connection setup
- **Multiple connections**: Save multiple connections and switch between them instantly from the sidebar
- **Query history**: The Dashboard panel tracks your recent queries with execution times
- **Column resize**: Drag column borders in the results grid to adjust widths
