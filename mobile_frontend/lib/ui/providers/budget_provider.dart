import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repository/abstract/budget_repository.dart';
import 'package:mobile_frontend/models/budget/budget.dart';
import 'package:mobile_frontend/models/budget/expense_category.dart';
import 'package:mobile_frontend/ui/providers/asyncvalue.dart';

class BudgetProvider extends ChangeNotifier {
  final BudgetRepository repository;
  BudgetProvider({required this.repository});
  AsyncValue<Budget> _budgetDetail = AsyncValue.empty();
  AsyncValue<List<ExpenseCategory>> _expenseCategory = AsyncValue.empty();

  /// Getter
  AsyncValue<Budget> get getBudgetDetails => _budgetDetail;
  AsyncValue<List<ExpenseCategory>> get expenseCategory => _expenseCategory;

  Future<void> createBudget(
    String tripId,
    double amount,
    String currency,
  ) async {
    await repository.createBudget(tripId, amount, currency);
    notifyListeners();
  }

  Future<Budget> getBudgetDetail(String tripId) async {
    _budgetDetail = AsyncValue.loading();
    notifyListeners();
    try {
      final budgetDetail = await repository.getBudgetDetail(tripId);
      _budgetDetail = AsyncValue.success(budgetDetail);
      notifyListeners();
    } catch (e) {
      _budgetDetail = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
    return await repository.getBudgetDetail(tripId);
  }

  Future<void> updateBudget(String budgetId, double amount) async {
    await repository.updateBudget(budgetId, amount);
    notifyListeners();
  }

  Future<void> addExpense(
    String amount,
    String currency,
    DateTime date,
    String description,
    String categoryId,
    String budgetId,
  ) async {
    await repository.addExpense(
      amount,
      currency,
      date,
      description,
      categoryId,
      budgetId,
    );
    notifyListeners();
  }

  Future<void> updateExpense(
    String expenseId,
    String amount,
    DateTime date,
    String currency,
    String categoryId,
    String description,
  ) async {
    await repository.updateExpense(
      expenseId,
      amount,
      date,
      currency,
      categoryId,
      description,
    );
    notifyListeners();
  }

  Future<void> deleteExpense(String expenseId) async {
    await repository.deleteExpense(expenseId);
    notifyListeners();
  }

  Future<List<ExpenseCategory>> getExpenseCategory() async {
    _expenseCategory = AsyncValue.loading();
    notifyListeners();
    try {
      final category = await repository.getExpenseCategory();
      _expenseCategory = AsyncValue.success(category);
      notifyListeners();
      return category;
    } catch (e) {
      _expenseCategory = AsyncValue.error(e);
      notifyListeners();
      rethrow;
    }
  }

  /// Update budget details locally without fetching from server
  /// Useful for optimistic UI updates after operations like delete
  void updateBudgetDetailsLocally(Budget updatedBudget) {
    _budgetDetail = AsyncValue.success(updatedBudget);
    notifyListeners();
  }

  /// Clear all cached budget data - call this on logout
  void clearAll() {
    _budgetDetail = AsyncValue.empty();
    _expenseCategory = AsyncValue.empty();
    notifyListeners();
  }
}
