import 'package:mobile_frontend/models/budget/expense.dart';

class Budget {
  final String id;
  final double total;
  final String currency;
  final String? totalExpense;
  final String? remainingBudget;
  final double dailyBudget;
  final List<Expense> expenses;
  final Map<ExpenseCategory, double> categoryLimits;
  final String tripId;

  Budget({
    required this.id,
    required this.total,
    required this.currency,
    required this.expenses,
    required this.dailyBudget,
    required this.categoryLimits,
    required this.tripId,
    this.totalExpense,
    this.remainingBudget,
  });

  double get spentTotal => expenses.fold(0, (sum, e) => sum + e.amount);
  double get remaining => total - spentTotal;
  factory Budget.fromJson(Map<String, dynamic> json) {
    return Budget(
      id: json['id'] ?? '',
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] ?? '',
      expenses: List<Expense>.from(
        json['expenses']?.map((item) => Expense.fromJson(item)) ?? [],
      ),
      dailyBudget: (json['daily_budget'] as num?)?.toDouble() ?? 0.0,
      categoryLimits: json['category_limits'] ?? '',
      tripId: json['trip_id'] ?? '',
      totalExpense: json['total_expense']?.toString(),
      remainingBudget: json['remaining_budget']?.toString(),
    );
  }
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    if (other is! Budget) return false;
    return id == other.id && total == other.total && currency == other.currency;
  }

  @override
  int get hashCode => super.hashCode ^ id.hashCode ^ total.hashCode;
}
