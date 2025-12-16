import 'package:mobile_frontend/models/budget/budget.dart';
import 'package:mobile_frontend/models/budget/expend.dart';

class BudgetDto {
  static Budget fromBudget(Map<String, dynamic> json) {
    // Extract data from the response wrapper
    final budgetData = json['data'] ?? json;
    return Budget(
      budgetId: budgetData['budget_id'] as int?,
      tripId: budgetData['trip_id'] as int?,
      totalBudget: (budgetData['total_budget'] as num?)?.toDouble(),
      currency: budgetData['currency']?.toString(),
      totalSpent: (budgetData['total_spent'] as num?)?.toDouble(),
      remainingBudget: (budgetData['remaining_budget'] as num?)?.toDouble(),
      description: budgetData['description']?.toString(),
      dailyBudget: (budgetData['daily_budget'] as num?)?.toDouble(),
      expenses: budgetData['expenses'] != null && budgetData['expenses'] is List
          ? List<Expense>.from(
              (budgetData['expenses'] as List)
                  .whereType<Map<String, dynamic>>()
                  .map((item) => Expense.fromJson(item)),
            )
          : [],
    );
  }
}
