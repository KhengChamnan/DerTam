import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/budget/budget.dart';
import 'package:mobile_frontend/models/budget/expense.dart';
import 'package:mobile_frontend/ui/screen/budget/widgets/add_expend_screen.dart';
import 'package:mobile_frontend/ui/screen/budget/widgets/budget_history_screen.dart';
import 'package:mobile_frontend/ui/screen/budget/widgets/expense_card.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/screen/budget/widgets/budget_card.dart';

class BudgetDetail {
  final String label;
  final String value;
  final String description;

  BudgetDetail(this.label, this.value, this.description);
}

class BudgetScreen extends StatefulWidget {
  final String tripId;
  final double totalBudget;
  final double dailyBudget;
  final String currency;
  final DateTime tripStartDate;
  final DateTime tripEndDate;

  const BudgetScreen({
    super.key,
    required this.tripId,
    required this.totalBudget,
    required this.dailyBudget,
    required this.currency,
    required this.tripStartDate,
    required this.tripEndDate,
  });

  @override
  State<BudgetScreen> createState() => _BudgetScreenState();
}

class _BudgetScreenState extends State<BudgetScreen> {
  int _selectedTabIndex = 0;
  final List<String> _tabs = ['All', 'Today', 'Upcoming'];

  // Sample expenses with different dates
  final List<Expense> _expenses = [
    Expense.create(
      amount: 25000,
      description: 'Lunch at local restaurant',
      date: DateTime.now(), // Today
      category: ExpenseCategory.food,
    ),
    Expense.create(
      amount: 15000,
      description: 'Taxi to hotel',
      date: DateTime.now().subtract(
        const Duration(hours: 2),
      ), // Today, 2 hours ago
      category: ExpenseCategory.transportation,
    ),
    Expense.create(
      amount: 50000,
      description: 'Hotel accommodation',
      date: DateTime.now().subtract(const Duration(days: 1)), // Yesterday
      category: ExpenseCategory.accommodation,
    ),
    Expense.create(
      amount: 30000,
      description: 'Airport pickup',
      date: DateTime.now().add(const Duration(days: 1)), // Tomorrow (upcoming)
      category: ExpenseCategory.transportation,
    ),
  ];

  Budget? _budget;

  @override
  void initState() {
    super.initState();
    _initializeBudget();
  }

  void _initializeBudget() {
    try {
      _budget = Budget(
        id: 'budget_${widget.tripId}',
        total: widget.totalBudget,
        currency: widget.currency,
        dailyBudget: widget.dailyBudget,
        expenses: _expenses,
        categoryLimits: {
          ExpenseCategory.food: widget.totalBudget * 0.3,
          ExpenseCategory.transportation: widget.totalBudget * 0.2,
          ExpenseCategory.accommodation: widget.totalBudget * 0.4,
          ExpenseCategory.tickets: widget.totalBudget * 0.05,
          ExpenseCategory.shopping: widget.totalBudget * 0.03,
          ExpenseCategory.other: widget.totalBudget * 0.02,
        },
        tripId: widget.tripId,
      );
    } catch (e) {
      print('Error initializing budget: $e');
      _budget = Budget(
        id: 'budget_${widget.tripId}',
        total: widget.totalBudget,
        currency: widget.currency,
        dailyBudget: widget.dailyBudget,
        expenses: [],
        categoryLimits: {},
        tripId: widget.tripId,
      );
    }
  }

  // CORRECTED: Total expenses across all time
  double get _totalSpent => _budget?.spentTotal ?? 0.0;

  // CORRECTED: Only today's expenses
  double get _todaySpent {
    final today = DateTime.now();
    final todayDate = DateTime(today.year, today.month, today.day);

    return _expenses
        .where((expense) {
          final expenseDate = DateTime(
            expense.date.year,
            expense.date.month,
            expense.date.day,
          );
          return expenseDate.isAtSameMomentAs(todayDate);
        })
        .fold(0.0, (sum, expense) => sum + expense.amount);
  }

  double get _remainingBudget => _budget?.remaining ?? widget.totalBudget;

  // CORRECTED: Daily budget remaining for today
  double get _dailyBudgetRemaining => widget.dailyBudget - _todaySpent;

  List<Expense> get _filteredExpenses {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    switch (_selectedTabIndex) {
      case 1: // Today
        return _expenses.where((expense) {
          final expenseDate = DateTime(
            expense.date.year,
            expense.date.month,
            expense.date.day,
          );
          return expenseDate.isAtSameMomentAs(today);
        }).toList();
      case 2: // Upcoming
        return _expenses.where((expense) {
          final expenseDate = DateTime(
            expense.date.year,
            expense.date.month,
            expense.date.day,
          );
          return expenseDate.isAfter(today);
        }).toList();
      default: // All
        return _expenses;
    }
  }

  void _showBudgetCardDetails({
  required BuildContext context,
  required String title,
  required IconData icon,
  required Color iconColor,
  required List<BudgetDetail> details,
  required String explanation,
  required List<String> tips,
}) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        child: Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.6,
            maxWidth: MediaQuery.of(context).size.width * 0.7,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Fixed Header
              Container(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: title == 'Daily Budget'
                            ? DertamColors.primaryDark
                            : Colors.grey[200],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(icon, color: iconColor, size: 24),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        title,
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: DertamColors.black,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(Icons.close, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),

              // Scrollable Content
              Flexible(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Use BudgetDetailItem
                      ...details.map((detail) => BudgetDetailItem(
                        label: detail.label,
                        value: detail.value,
                        description: detail.description,
                      )),

                      const SizedBox(height: 16),

                      // Explanation
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.blue[50],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  Icons.info_outline,
                                  color: Colors.blue[700],
                                  size: 18,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'How it works',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.blue[700],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              explanation,
                              style: TextStyle(
                                color: Colors.blue[800],
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Tips
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: tips.any((tip) => tip.contains('🚨') || tip.contains('⚠️'))
                              ? Colors.orange[50]
                              : Colors.green[50],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  tips.any((tip) => tip.contains('🚨'))
                                      ? Icons.warning
                                      : tips.any((tip) => tip.contains('⚠️'))
                                      ? Icons.info
                                      : Icons.check_circle,
                                  color: tips.any((tip) => tip.contains('🚨') || tip.contains('⚠️'))
                                      ? Colors.orange[700]
                                      : Colors.green[700],
                                  size: 18,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Tips',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: tips.any((tip) => tip.contains('🚨') || tip.contains('⚠️'))
                                        ? Colors.orange[700]
                                        : Colors.green[700],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            ...tips.map(
                              (tip) => Padding(
                                padding: const EdgeInsets.only(bottom: 4),
                                child: Text(
                                  tip,
                                  style: TextStyle(
                                    color: tips.any((tip) => tip.contains('🚨') || tip.contains('⚠️'))
                                        ? Colors.orange[800]
                                        : Colors.green[800],
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}

  void _showExpenseDetails(Expense expense) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => ExpenseDetailsSheet(
        expense: expense,
        currencySymbol: _getCurrencySymbol(),
      ),
    );
  }


  String _getCurrencySymbol() {
    switch (widget.currency) {
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

  void _deleteExpense(Expense expense) {
    setState(() {
      _expenses.removeWhere((e) => e.id == expense.id);
      _initializeBudget();
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${expense.description} deleted'),
        action: SnackBarAction(
          label: 'Undo',
          onPressed: () {
            setState(() {
              _expenses.add(expense);
              _initializeBudget();
            });
          },
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_budget == null) {
      return Scaffold(
        backgroundColor: DertamColors.white,
        appBar: AppBar(
          backgroundColor: DertamColors.white,
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.arrow_back, color: DertamColors.black),
            onPressed: () => Navigator.pop(context),
          ),
          title: Text(
            'Budget & Expense',
            style: TextStyle(
              color: DertamColors.black,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          centerTitle: true,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: DertamColors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Budget & Expense',
          style: TextStyle(
            color: DertamColors.black,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(Icons.history, color: DertamColors.black),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => BudgetHistoryScreen(
                    expenses: _expenses,
                    currency: widget.currency,
                    totalBudget: widget.totalBudget,
                    dailyBudget: widget.dailyBudget,
                    tripStartDate: widget.tripStartDate,
                    tripEndDate: widget.tripEndDate,
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Budget Cards Section - CORRECTED LOGIC
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Total Budget Card - Shows TOTAL spent vs TOTAL budget
                Expanded(
                  child: BudgetCard(
                    title: 'Total',
                    amount: _totalSpent,
                    subtitle:
                        '${_totalSpent.toStringAsFixed(0)}/${_budget!.total.toStringAsFixed(0)}',
                    progress: _budget!.total > 0
                        ? _totalSpent / _budget!.total
                        : 0,
                    backgroundColor: Colors.grey[200]!,
                    textColor: DertamColors.black,
                    // Change to red if over budget
                    progressColor: _totalSpent > _budget!.total
                        ? Colors.red
                        : DertamColors.primaryDark,
                    currencySymbol: _getCurrencySymbol(),
                    onTap: () {
                      _showBudgetCardDetails(
                        context: context,
                        title: 'Total Budget',
                        icon: Icons.account_balance_wallet,
                        iconColor: DertamColors.primaryDark,
                        details: [
                          BudgetDetail(
                            'Total Budget',
                            '${_getCurrencySymbol()}${_budget!.total.toStringAsFixed(0)}',
                            'Your complete trip budget',
                          ),
                          BudgetDetail(
                            'Total Spent',
                            '${_getCurrencySymbol()}${_totalSpent.toStringAsFixed(0)}',
                            'All expenses across the entire trip',
                          ),
                          BudgetDetail(
                            'Remaining',
                            '${_getCurrencySymbol()}${_remainingBudget.toStringAsFixed(0)}',
                            'Money left for the rest of your trip',
                          ),
                          BudgetDetail(
                            'Usage',
                            '${((_totalSpent / _budget!.total) * 100).toStringAsFixed(1)}%',
                            'Percentage of total budget used',
                          ),
                        ],
                        explanation:
                            'This card shows your overall trip spending. It tracks all expenses from start to finish and helps you stay within your total budget.',
                        tips: _totalSpent > _budget!.total * 0.8
                            ? [
                                '⚠️ You\'ve used ${((_totalSpent / _budget!.total) * 100).toStringAsFixed(1)}% of your budget',
                                'Consider reducing daily spending',
                              ]
                            : [
                                '✅ Good progress! You\'re staying within budget',
                                'Keep tracking your daily expenses',
                              ],
                      );
                    },
                  ),
                ),

                const SizedBox(width: 12),

                // Daily Budget Card - Shows TODAY's spent vs DAILY budget
                Expanded(
                  child: BudgetCard(
                    title: 'Daily Budget',
                    amount: _todaySpent,
                    subtitle:
                        '${_todaySpent.toStringAsFixed(0)}/${_budget!.dailyBudget.toStringAsFixed(0)}',
                    progress: _budget!.dailyBudget > 0
                        ? _todaySpent / _budget!.dailyBudget
                        : 0,
                    backgroundColor: DertamColors.primaryDark,
                    textColor: Colors.white,
                    // Change to red if over daily budget
                    progressColor: _todaySpent > _budget!.dailyBudget
                        ? Colors.red
                        : Colors.white,
                    currencySymbol: _getCurrencySymbol(),
                    onTap: () {
                      _showBudgetCardDetails(
                        context: context,
                        title: 'Daily Budget',
                        icon: Icons.today,
                        iconColor: Colors.white,
                        details: [
                          BudgetDetail(
                            'Daily Limit',
                            '${_getCurrencySymbol()}${_budget!.dailyBudget.toStringAsFixed(0)}',
                            'Recommended daily spending limit',
                          ),
                          BudgetDetail(
                            'Today\'s Spent',
                            '${_getCurrencySymbol()}${_todaySpent.toStringAsFixed(0)}',
                            'Total expenses for today only',
                          ),
                          BudgetDetail(
                            'Daily Remaining',
                            '${_getCurrencySymbol()}${_dailyBudgetRemaining.toStringAsFixed(0)}',
                            'Money left for today',
                          ),
                          BudgetDetail(
                            'Daily Usage',
                            '${((_todaySpent / _budget!.dailyBudget) * 100).toStringAsFixed(1)}%',
                            'Percentage of daily budget used',
                          ),
                        ],
                        explanation:
                            'This card resets every day and shows only today\'s spending. It helps you pace your spending throughout the trip.',
                        tips: _todaySpent > _budget!.dailyBudget
                            ? [
                                '🚨 Over daily budget by ${_getCurrencySymbol()}${(_todaySpent - _budget!.dailyBudget).toStringAsFixed(0)}',
                                'Try to spend less tomorrow to balance out',
                              ]
                            : _todaySpent > _budget!.dailyBudget * 0.8
                            ? [
                                '⚠️ Close to daily limit',
                                'Consider your remaining expenses for today',
                              ]
                            : [
                                '✅ Within daily budget',
                                'You can spend ${_getCurrencySymbol()}${_dailyBudgetRemaining.toStringAsFixed(0)} more today',
                              ],
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // Filter Tabs
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: List.generate(_tabs.length, (index) {
                final isSelected = index == _selectedTabIndex;
                return Expanded(
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedTabIndex = index;
                      });
                    },
                    child: Container(
                      margin: EdgeInsets.only(
                        right: index < _tabs.length - 1 ? 8 : 0,
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? DertamColors.primaryDark
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                        border: isSelected
                            ? null
                            : Border.all(color: Colors.grey[300]!),
                      ),
                      child: Text(
                        _tabs[index],
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.grey[600],
                          fontWeight: FontWeight.w500,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),

          const SizedBox(height: 16),

          // Expense List Header
          if (_filteredExpenses.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Expense list',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: DertamColors.black,
                    ),
                  ),
                  Text(
                    'Remaining: ${_getCurrencySymbol()}${_remainingBudget.toStringAsFixed(0)} left',
                    style: TextStyle(
                      fontSize: 14,
                      color: _remainingBudget > 0
                          ? DertamColors.primaryDark
                          : Colors.red,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 16),

          // Expense List or Empty State
          Expanded(
            child: _filteredExpenses.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "It's pretty empty here...",
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[400],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          "Enter your\n1st expense",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 32,
                            color: Colors.grey[300],
                            fontWeight: FontWeight.w300,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _filteredExpenses.length,
                    itemBuilder: (context, index) {
                      final expense = _filteredExpenses[index];
                      return ExpenseItem(
                        expense: expense,
                        index: index,
                        currencySymbol: _getCurrencySymbol(),
                        onDelete: () => _deleteExpense(expense),
                        onTap: () => _showExpenseDetails(
                          expense,
                        ), // Now shows detailed view
                      );
                    },
                  ),
          ),
        ],
      ),

      // Floating Action Button
      floatingActionButton: FloatingActionButton(
        onPressed: _navigateToAddExpense, 
        backgroundColor: DertamColors.primaryDark,
        child: const Icon(Icons.add, color: Colors.white, size: 28),
      ),
    );
  }

  void _navigateToAddExpense() async {
    if (_budget == null) return;

    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddExpenseScreen(
          selectedCurrency: widget.currency,
          remainingBudget: _remainingBudget,
          dailyBudget: widget.dailyBudget,
          totalBudget: widget.totalBudget,
          tripId: widget.tripId,
          budgetId: _budget!.id,
          tripStartDate: widget.tripStartDate,
          tripEndDate: widget.tripEndDate,
        ),
      ),
    );

    // If an expense was added, refresh the budget
    if (result == true) {
      setState(() {
        // Trigger a rebuild to refresh the data
        _initializeBudget();
      });
    }
  }

  // Add method for editing expenses
  void _navigateToEditExpense(Expense expense) async {
    if (_budget == null) return;

    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddExpenseScreen(
          selectedCurrency: widget.currency,
          remainingBudget: _remainingBudget + expense.amount,
          dailyBudget: widget.dailyBudget,
          totalBudget: widget.totalBudget,
          tripId: widget.tripId,
          budgetId: _budget!.id,
          tripStartDate: widget.tripStartDate, // Pass trip start date
          tripEndDate: widget.tripEndDate, // Pass trip end date
          expense: expense,
          isEditing: true,
        ),
      ),
    );

    if (result == true) {
      setState(() {
        _initializeBudget();
      });
    }
  }
}
