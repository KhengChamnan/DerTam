import 'package:mobile_frontend/models/budget/expend.dart';
import 'package:mobile_frontend/models/budget/expense_category.dart';

class Budget {
  final int? budgetId;
  final int? tripId;
  final double? totalBudget;
  final String? currency;
  final double? totalSpent;
  final double? remainingBudget;
  final String? description;
  final double? dailyBudget;
  final List<Expense>? expenses;
  final Map<ExpenseCategory, double>? categoryLimits;

  Budget({
    this.budgetId,
    this.totalBudget,
    this.currency,
    this.expenses,
    this.dailyBudget,
    this.categoryLimits,
    this.tripId,
    this.totalSpent,
    this.remainingBudget,
    this.description,
  });
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    if (other is! Budget) return false;
    return budgetId == other.budgetId &&
        totalBudget == other.totalBudget &&
        currency == other.currency;
  }

  @override
  int get hashCode => super.hashCode ^ budgetId.hashCode ^ totalBudget.hashCode;
}
