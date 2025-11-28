import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/budget/budget.dart';
import 'package:mobile_frontend/models/budget/expend.dart';
import 'package:mobile_frontend/ui/screen/budget/widgets/dertam_add_expend_screen.dart';
import 'package:mobile_frontend/ui/screen/budget/widgets/dertam_budget_history_screen.dart';
import 'package:mobile_frontend/ui/screen/budget/widgets/dertam_expense_card.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/screen/budget/widgets/dertam_budget_card.dart';
import 'package:mobile_frontend/ui/providers/budget_provider.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';
import 'package:provider/provider.dart';

class BudgetDetail {
  final String label;
  final String value;
  final String description;
  BudgetDetail(this.label, this.value, this.description);
}

class BudgetScreen extends StatefulWidget {
  final String tripId;
  final DateTime tripStartDate;
  final DateTime tripEndDate;

  const BudgetScreen({
    super.key,
    required this.tripId,
    required this.tripStartDate,
    required this.tripEndDate,
  });

  @override
  State<BudgetScreen> createState() => _BudgetScreenState();
}

class _BudgetScreenState extends State<BudgetScreen> {
  int _selectedTabIndex = 0;
  final List<String> _tabs = ['All', 'Today', 'Upcoming'];

  @override
  void initState() {
    super.initState();
    _loadBudgetData();
  }

  void _loadBudgetData() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final budgetProvider = Provider.of<BudgetProvider>(
        context,
        listen: false,
      );
      budgetProvider.getBudgetDetail(widget.tripId);
    });
  }

  List<Expense> get _expenses {
    final budgetProvider = Provider.of<BudgetProvider>(context);
    return budgetProvider.getBudgetDetails.when(
      empty: () => [],
      loading: () => [],
      error: (error) => [],
      success: (budget) => budget.expenses ?? [],
    );
  }

  Budget? get _budget {
    final budgetProvider = Provider.of<BudgetProvider>(context);
    return budgetProvider.getBudgetDetails.when(
      empty: () => null,
      loading: () => null,
      error: (error) => null,
      success: (budget) => budget,
    );
  }

  // Safe getter for event handlers (uses listen: false)
  Budget? _getBudgetSafe() {
    final budgetProvider = Provider.of<BudgetProvider>(context, listen: false);
    return budgetProvider.getBudgetDetails.when(
      empty: () => null,
      loading: () => null,
      error: (error) => null,
      success: (budget) => budget,
    );
  }

  // CORRECTED: Total expenses across all time
  double get _totalSpent => _budget?.totalSpent ?? 0.0;

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

  double get _remainingBudget =>
      _budget?.remainingBudget ?? (_budget?.totalBudget ?? 0.0);
  double get _dailyBudgetRemaining =>
      (double.tryParse(_budget?.dailyBudget?.toString() ?? '0') ?? 0.0) -
      _todaySpent;
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
                        ...details.map(
                          (detail) => BudgetDetailItem(
                            label: detail.label,
                            value: detail.value,
                            description: detail.description,
                          ),
                        ),
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
                            color:
                                tips.any(
                                  (tip) =>
                                      tip.contains('🚨') || tip.contains('⚠️'),
                                )
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
                                    color:
                                        tips.any(
                                          (tip) =>
                                              tip.contains('🚨') ||
                                              tip.contains('⚠️'),
                                        )
                                        ? Colors.orange[700]
                                        : Colors.green[700],
                                    size: 18,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Tips',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color:
                                          tips.any(
                                            (tip) =>
                                                tip.contains('🚨') ||
                                                tip.contains('⚠️'),
                                          )
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
                                      color:
                                          tips.any(
                                            (tip) =>
                                                tip.contains('🚨') ||
                                                tip.contains('⚠️'),
                                          )
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
    final currency = _budget?.currency ?? 'USD';
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

  void _deleteExpense(Expense expense) async {
    final budgetProvider = Provider.of<BudgetProvider>(context, listen: false);
    try {
      // Delete the expense from the server
      await budgetProvider.deleteExpense(expense.id);

      if (mounted) {
        // Update the local state without full screen reload
        final currentBudget = budgetProvider.getBudgetDetails.data;
        if (currentBudget != null) {
          // Remove the expense from the list
          final updatedExpenses = List<Expense>.from(
            currentBudget.expenses ?? [],
          )..removeWhere((e) => e.id == expense.id);

          // Recalculate totals
          final newTotalSpent = updatedExpenses.fold<double>(
            0.0,
            (sum, e) => sum + e.amount,
          );
          final newRemainingBudget =
              (currentBudget.totalBudget ?? 0.0) - newTotalSpent;

          // Update the budget with new values
          final updatedBudget = Budget(
            budgetId: currentBudget.budgetId,
            tripId: currentBudget.tripId,
            totalBudget: currentBudget.totalBudget,
            dailyBudget: currentBudget.dailyBudget,
            currency: currentBudget.currency,
            expenses: updatedExpenses,
            totalSpent: newTotalSpent,
            remainingBudget: newRemainingBudget,
          );
          // Update the provider state directly
          budgetProvider.updateBudgetDetailsLocally(updatedBudget);
        }

        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Expense deleted successfully'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to delete expense: $e'),
            backgroundColor: DertamColors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final budgetProvider = Provider.of<BudgetProvider>(context);
    final asyncBudget = budgetProvider.getBudgetDetails;

    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: DertamColors.primaryBlue),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Budget & Expense',
          style: TextStyle(
            color: DertamColors.primaryBlue,
            fontSize: 24,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
        actions: asyncBudget.state == AsyncValueState.success
            ? [
                IconButton(
                  icon: Icon(Icons.history, color: DertamColors.primaryBlue),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => BudgetHistoryScreen(
                          expenses: _expenses,
                          currency: asyncBudget.data?.currency ?? 'USD',
                          totalBudget: asyncBudget.data?.totalBudget ?? 0.0,
                          dailyBudget: asyncBudget.data?.dailyBudget ?? 0.0,
                          tripStartDate: widget.tripStartDate,
                          tripEndDate: widget.tripEndDate,
                        ),
                      ),
                    );
                  },
                ),
              ]
            : null,
      ),
      body: _buildBody(asyncBudget),
      floatingActionButton: asyncBudget.state == AsyncValueState.success
          ? FloatingActionButton(
              onPressed: _navigateToAddExpense,
              backgroundColor: DertamColors.primaryDark,
              child: const Icon(Icons.add, color: Colors.white, size: 28),
            )
          : null,
    );
  }

  Widget _buildBody(AsyncValue<Budget> asyncBudget) {
    switch (asyncBudget.state) {
      case AsyncValueState.empty:
      case AsyncValueState.loading:
        return const Center(child: CircularProgressIndicator());

      case AsyncValueState.error:
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: DertamColors.red),
              const SizedBox(height: 16),
              Text(
                'Failed to load budget',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: DertamColors.black,
                ),
              ),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Text(
                  asyncBudget.error.toString(),
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey[600]),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _loadBudgetData,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: DertamColors.primaryDark,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
        );

      case AsyncValueState.success:
        return Column(
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
                          '${_totalSpent.toStringAsFixed(0)}/${_budget!.totalBudget!.toStringAsFixed(0)}',
                      progress: _budget!.totalBudget! > 0
                          ? _totalSpent / _budget!.totalBudget!
                          : 0,
                      backgroundColor: Colors.grey[200]!,
                      textColor: DertamColors.black,
                      // Change to red if over budget
                      progressColor: _totalSpent > _budget!.totalBudget!
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
                              '${_getCurrencySymbol()}${_budget!.totalBudget!.toStringAsFixed(0)}',
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
                              '${((_totalSpent / _budget!.totalBudget!) * 100).toStringAsFixed(1)}%',
                              'Percentage of total budget used',
                            ),
                          ],
                          explanation:
                              'This card shows your overall trip spending. It tracks all expenses from start to finish and helps you stay within your total budget.',
                          tips: _totalSpent > _budget!.totalBudget! * 0.8
                              ? [
                                  '⚠️ You\'ve used ${((_totalSpent / _budget!.totalBudget!) * 100).toStringAsFixed(1)}% of your budget',
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
                          '${_todaySpent.toStringAsFixed(0)}/${_budget!.dailyBudget!.toStringAsFixed(0)}',
                      progress: _budget!.dailyBudget! > 0
                          ? _todaySpent / _budget!.dailyBudget!
                          : 0,
                      backgroundColor: DertamColors.primaryDark,
                      textColor: Colors.white,
                      // Change to red if over daily budget
                      progressColor: _todaySpent > _budget!.dailyBudget!
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
                              '${_getCurrencySymbol()}${_budget!.dailyBudget!.toStringAsFixed(0)}',
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
                              '${((_todaySpent / _budget!.dailyBudget!) * 100).toStringAsFixed(1)}%',
                              'Percentage of daily budget used',
                            ),
                          ],
                          explanation:
                              'This card resets every day and shows only today\'s spending. It helps you pace your spending throughout the trip.',
                          tips: _todaySpent > _budget!.dailyBudget!
                              ? [
                                  '🚨 Over daily budget by ${_getCurrencySymbol()}${(_todaySpent - _budget!.dailyBudget!).toStringAsFixed(0)}',
                                  'Try to spend less tomorrow to balance out',
                                ]
                              : _todaySpent > _budget!.dailyBudget! * 0.8
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
                          onEdit: () => _navigateToEditExpense(expense),
                        );
                      },
                    ),
            ),
          ],
        );
    }
  }

  void _navigateToAddExpense() async {
    final budget = _getBudgetSafe();
    if (budget == null) {
      print('Cannot navigate: budget is null');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Budget data not loaded yet'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }
    final budgetProvider = Provider.of<BudgetProvider>(context, listen: false);
    final remainingBudget =
        budget.remainingBudget ?? (budget.totalBudget ?? 0.0);
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddExpenseScreen(
          selectedCurrency: budget.currency ?? 'USD',
          remainingBudget: remainingBudget,
          dailyBudget: budget.dailyBudget ?? 0.0,
          totalBudget: budget.totalBudget ?? 0.0,
          tripId: widget.tripId,
          budgetId: budget.budgetId?.toString() ?? '',
          tripStartDate: widget.tripStartDate,
          tripEndDate: widget.tripEndDate,
        ),
      ),
    );

    // If an expense was added, refresh the budget
    if (mounted && result == true) {
      await budgetProvider.getBudgetDetail(widget.tripId);
    }
  }

  void _navigateToEditExpense(Expense expense) async {
    final budgetProvider = Provider.of<BudgetProvider>(context, listen: false);
    final remainingBudget =
        budgetProvider.getBudgetDetails.data?.remainingBudget ??
        (budgetProvider.getBudgetDetails.data?.totalBudget ?? 0.0);
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddExpenseScreen(
          selectedCurrency:
              budgetProvider.getBudgetDetails.data?.currency ?? 'USD',
          remainingBudget: remainingBudget,
          dailyBudget: budgetProvider.getBudgetDetails.data?.dailyBudget ?? 0.0,
          totalBudget: budgetProvider.getBudgetDetails.data?.totalBudget ?? 0.0,
          tripId: widget.tripId,
          budgetId:
              budgetProvider.getBudgetDetails.data?.budgetId?.toString() ?? '',
          tripStartDate: widget.tripStartDate,
          tripEndDate: widget.tripEndDate,
          expense: expense,
          isEditing: true,
        ),
      ),
    );
    // If an expense was edited, refresh the budget
    if (mounted && result == true) {
      await budgetProvider.getBudgetDetail(widget.tripId);
    }
  }
}
