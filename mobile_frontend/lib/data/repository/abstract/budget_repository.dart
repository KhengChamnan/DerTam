import 'package:mobile_frontend/models/budget/budget.dart';
import 'package:mobile_frontend/models/budget/expense_category.dart';

abstract class BudgetRepository {
  // Define abstract methods related to budget management
  Future<void> createBudget(String tripId, double amount, String currency,);
  Future<Budget> getBudgetDetail(String tripId);
  Future<void> updateBudget(String budgetId, double amount);
  Future<void> addExpense(
    String amount,
    String currency,
    DateTime date,
    String description,
    String categoryId,
    String budgetId,
  );
  Future<void> updateExpense(
    String expenseId,
    String amount,
    DateTime date,
    String currency,
    String categoryId,
    String description,
  );
  Future<void> deleteExpense(String expenseId);
  Future<List<ExpenseCategory>> getExpenseCategory();
}
