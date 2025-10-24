
import 'package:mobile_frontend/models/budget/budget.dart';
import 'package:mobile_frontend/models/budget/expend.dart';

class BudgetDto {
  static Budget fromJson(String id, Map<String, dynamic> json) {
    return Budget(
      id: id,
      total: (json['total'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'USD',
      dailyBudget: (json['dailyBudget'] ?? 0).toDouble(),
      expenses: json['expenses'] != null
          ? (json['expenses'] as List).map((e) => Expense.fromMap(e)).toList()
          : [],
      categoryLimits: json['categoryLimits'] != null
          ? (json['categoryLimits'] as Map).map(
              (k, v) => MapEntry(
                ExpenseCategory.values[int.parse(k.toString())],
                v.toDouble(),
              ),
            )
          : {},
      tripId: json['tripId'] ?? '',
    );
  }

  static Map<String, dynamic> toJson(Budget budget) {
    return {
      'total': budget.total,
      'currency': budget.currency,
      'dailyBudget': budget.dailyBudget,
      'expenses': budget.expenses,
      'categoryLimits': budget.categoryLimits,
      'tripId': budget.tripId,
    };
  }
}
