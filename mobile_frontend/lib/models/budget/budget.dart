// Budget Models
// ignore_for_file: avoid_types_as_parameter_names
import 'package:mobile_frontend/models/budget/expense.dart';

class Budget {
  final String id;
  final double total;
  final String currency;
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
  });

  double get spentTotal => expenses.fold(0, (sum, e) => sum + e.amount);
  double get remaining => total - spentTotal;

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    if (other is! Budget) return false;
    return id == other.id && total == other.total && currency == other.currency;
  }

  @override
  int get hashCode => super.hashCode ^ id.hashCode ^ total.hashCode;
}
