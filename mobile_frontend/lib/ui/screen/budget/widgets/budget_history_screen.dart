import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/budget/expense.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/screen/budget/widgets/expense_card.dart';

class BudgetHistoryScreen extends StatefulWidget {
  final List<Expense> expenses;
  final String currency;
  final double totalBudget;
  final double dailyBudget;
  final DateTime tripStartDate;
  final DateTime tripEndDate;

  const BudgetHistoryScreen({
    super.key,
    required this.expenses,
    required this.currency,
    required this.totalBudget,
    required this.dailyBudget,
    required this.tripStartDate,
    required this.tripEndDate,
  });

  @override
  State<BudgetHistoryScreen> createState() => _BudgetHistoryScreenState();
}

class _BudgetHistoryScreenState extends State<BudgetHistoryScreen> with TickerProviderStateMixin {
  // State management
  late BudgetHistoryState _state;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _state = BudgetHistoryState();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _state.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: _buildAppBar(),
      body: Column(
        children: [
          _buildSummaryCard(),
          _buildExpenseList(),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: DertamColors.white,
      elevation: 0,
      leading: IconButton(
        icon: Icon(Icons.arrow_back, color: DertamColors.black),
        onPressed: () => Navigator.pop(context),
      ),
      title: Text(
        'Expense History',
        style: TextStyle(
          color: DertamColors.black,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      centerTitle: true,
      actions: [
        IconButton(
          icon: Icon(Icons.filter_list, color: DertamColors.black),
          onPressed: () => _state.showFilterBottomSheet(context, _updateState),
        ),
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(120),
        child: Column(
          children: [
            _buildSearchBar(),
            _buildTabBar(),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: TextField(
        controller: _state.searchController,
        decoration: InputDecoration(
          hintText: 'Search expenses...',
          prefixIcon: Icon(Icons.search, color: Colors.grey[600]),
          suffixIcon: _state.searchQuery.isNotEmpty
            ? IconButton(
                icon: Icon(Icons.clear, color: Colors.grey[600]),
                onPressed: () {
                  _state.clearSearch();
                  _updateState();
                },
              )
            : null,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: DertamColors.primaryDark),
          ),
        ),
        onChanged: (value) {
          _state.updateSearchQuery(value);
          _updateState();
        },
      ),
    );
  }

  Widget _buildTabBar() {
    return TabBar(
      controller: _tabController,
      labelColor: DertamColors.primaryDark,
      unselectedLabelColor: Colors.grey[600],
      indicatorColor: DertamColors.primaryDark,
      onTap: (index) => _updateState(),
      tabs: const [
        Tab(text: 'All'),
        Tab(text: 'Today'),
        Tab(text: 'This Week'),
        Tab(text: 'This Month'),
      ],
    );
  }

  Widget _buildSummaryCard() {
    final filteredExpenses = _state.getFilteredExpenses(widget.expenses, _tabController.index);
    final categoryTotals = _state.getCategoryTotals(filteredExpenses);
    final totalFiltered = _state.getTotalFiltered(filteredExpenses);

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: DertamColors.primaryDark,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total Expenses',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                '${filteredExpenses.length} transactions',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${_state.getCurrencySymbol(widget.currency)} ${totalFiltered.toStringAsFixed(2)}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          
          // Category Breakdown
          if (categoryTotals.isNotEmpty) ...[
            Text(
              'Top Categories',
              style: TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            ..._buildCategoryBreakdown(categoryTotals),
          ],
        ],
      ),
    );
  }

  List<Widget> _buildCategoryBreakdown(Map<ExpenseCategory, double> categoryTotals) {
    return (categoryTotals.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value)))
      .take(3)
      .map((entry) => Padding(
        padding: const EdgeInsets.only(bottom: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(entry.key.icon, color: Colors.white70, size: 16),
                const SizedBox(width: 8),
                Text(
                  entry.key.label,
                  style: TextStyle(color: Colors.white70, fontSize: 14),
                ),
              ],
            ),
            Text(
              '${_state.getCurrencySymbol(widget.currency)} ${entry.value.toStringAsFixed(0)}',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      )).toList();
  }

  Widget _buildExpenseList() {
    final filteredExpenses = _state.getFilteredExpenses(widget.expenses, _tabController.index);

    return Expanded(
      child: filteredExpenses.isEmpty
        ? EmptyExpenseState()
        : ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: filteredExpenses.length,
            itemBuilder: (context, index) {
              final expense = filteredExpenses[index];
              return ExpenseItem(
                expense: expense,
                index: index,
                currencySymbol: _state.getCurrencySymbol(widget.currency),
                onDelete: () {
                  // Handle delete if needed
                },
                onTap: () {
                  _state.showExpenseDetails(context, expense, widget.currency);
                },
              );
            },
          ),
    );
  }

  void _updateState() {
    setState(() {});
  }
}

// Separate state management class
class BudgetHistoryState {
  final TextEditingController searchController = TextEditingController();
  String searchQuery = '';
  ExpenseCategory? selectedCategory;
  DateTimeRange? selectedDateRange;

  void dispose() {
    searchController.dispose();
  }

  void updateSearchQuery(String query) {
    searchQuery = query;
  }

  void clearSearch() {
    searchController.clear();
    searchQuery = '';
  }

  void updateSelectedCategory(ExpenseCategory? category) {
    selectedCategory = category;
  }

  void updateSelectedDateRange(DateTimeRange? dateRange) {
    selectedDateRange = dateRange;
  }

  void clearFilters() {
    selectedCategory = null;
    selectedDateRange = null;
  }

  String getCurrencySymbol(String currency) {
    switch (currency) {
      case 'USD':
        return '\$';
      case 'KHR':
        return '៛';
      case 'EUR':
        return '€';
      default:
        return '\$';
    }
  }

  List<Expense> getFilteredExpenses(List<Expense> expenses, int tabIndex) {
    List<Expense> filtered = expenses;

    // Apply search filter
    if (searchQuery.isNotEmpty) {
      filtered = filtered.where((expense) =>
        expense.description.toLowerCase().contains(searchQuery.toLowerCase())
      ).toList();
    }

    // Apply category filter
    if (selectedCategory != null) {
      filtered = filtered.where((expense) => expense.category == selectedCategory).toList();
    }

    // Apply date range filter
    if (selectedDateRange != null) {
      filtered = filtered.where((expense) {
        final expenseDate = DateTime(expense.date.year, expense.date.month, expense.date.day);
        final startDate = DateTime(selectedDateRange!.start.year, selectedDateRange!.start.month, selectedDateRange!.start.day);
        final endDate = DateTime(selectedDateRange!.end.year, selectedDateRange!.end.month, selectedDateRange!.end.day);
        return expenseDate.isAtSameMomentAs(startDate) || 
               expenseDate.isAtSameMomentAs(endDate) ||
               (expenseDate.isAfter(startDate) && expenseDate.isBefore(endDate));
      }).toList();
    }

    // Apply tab filter
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    
    switch (tabIndex) {
      case 1: // Today
        filtered = filtered.where((expense) {
          final expenseDate = DateTime(expense.date.year, expense.date.month, expense.date.day);
          return expenseDate.isAtSameMomentAs(today);
        }).toList();
        break;
      case 2: // This Week
        final weekStart = today.subtract(Duration(days: today.weekday - 1));
        final weekEnd = weekStart.add(const Duration(days: 6));
        filtered = filtered.where((expense) {
          final expenseDate = DateTime(expense.date.year, expense.date.month, expense.date.day);
          return expenseDate.isAtSameMomentAs(weekStart) ||
                 expenseDate.isAtSameMomentAs(weekEnd) ||
                 (expenseDate.isAfter(weekStart) && expenseDate.isBefore(weekEnd));
        }).toList();
        break;
      case 3: // This Month
        filtered = filtered.where((expense) {
          final expenseDate = DateTime(expense.date.year, expense.date.month, expense.date.day);
          return expenseDate.month == today.month && expenseDate.year == today.year;
        }).toList();
        break;
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.date.compareTo(a.date));
    return filtered;
  }

  Map<ExpenseCategory, double> getCategoryTotals(List<Expense> expenses) {
    final Map<ExpenseCategory, double> totals = {};
    for (final expense in expenses) {
      totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount;
    }
    return totals;
  }

  double getTotalFiltered(List<Expense> expenses) {
    return expenses.fold(0.0, (sum, expense) => sum + expense.amount);
  }

  void showFilterBottomSheet(BuildContext context, VoidCallback onUpdate) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => FilterBottomSheet(
        state: this,
        onUpdate: onUpdate,
      ),
    );
  }

  void showExpenseDetails(BuildContext context, Expense expense, String currency) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (context) => ExpenseDetailsSheet(
      expense: expense,
      currencySymbol: getCurrencySymbol(currency),
    ),
  );
}
}

// Separate widget for empty state
class EmptyExpenseState extends StatelessWidget {
  const EmptyExpenseState({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.receipt_long_outlined,
                size: 64, 
                color: Colors.grey[400]
              ),
              const SizedBox(height: 16),
              Text(
                'No expenses found',
                style: TextStyle(
                  fontSize: 18,
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Try adjusting your filters or add some expenses',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[500],
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Separate widget for filter bottom sheet
class FilterBottomSheet extends StatefulWidget {
  final BudgetHistoryState state;
  final VoidCallback onUpdate;

  const FilterBottomSheet({
    super.key,
    required this.state,
    required this.onUpdate,
  });

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      height: MediaQuery.of(context).size.height * 0.7,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Filter Expenses',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: DertamColors.black,
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: Icon(Icons.close, color: Colors.grey[600]),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Category Filter
          Text(
            'Category',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: DertamColors.black,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              FilterChip(
                label: const Text('All'),
                selected: widget.state.selectedCategory == null,
                onSelected: (selected) {
                  setState(() {
                    widget.state.updateSelectedCategory(null);
                  });
                  widget.onUpdate();
                },
              ),
              ...ExpenseCategory.values.map((category) => FilterChip(
                label: Text(category.label),
                selected: widget.state.selectedCategory == category,
                onSelected: (selected) {
                  setState(() {
                    widget.state.updateSelectedCategory(selected ? category : null);
                  });
                  widget.onUpdate();
                },
              )),
            ],
          ),

          const SizedBox(height: 24),

          // Date Range Filter
          Text(
            'Date Range',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: DertamColors.black,
            ),
          ),
          const SizedBox(height: 12),
          InkWell(
            onTap: () async {
              final DateTimeRange? picked = await showDateRangePicker(
                context: context,
                firstDate: DateTime.now().subtract(const Duration(days: 365)),
                lastDate: DateTime.now().add(const Duration(days: 365)),
                initialDateRange: widget.state.selectedDateRange,
              );
              if (picked != null) {
                setState(() {
                  widget.state.updateSelectedDateRange(picked);
                });
                widget.onUpdate();
              }
            },
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                widget.state.selectedDateRange == null
                  ? 'Select date range'
                  : '${widget.state.selectedDateRange!.start.day}/${widget.state.selectedDateRange!.start.month} - ${widget.state.selectedDateRange!.end.day}/${widget.state.selectedDateRange!.end.month}',
                style: TextStyle(
                  color: widget.state.selectedDateRange == null ? Colors.grey[600] : DertamColors.black,
                ),
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Clear Filters Button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {
                setState(() {
                  widget.state.clearFilters();
                });
                widget.onUpdate();
              },
              child: const Text('Clear All Filters'),
            ),
          ),
        ],
      ),
    );
  }
}