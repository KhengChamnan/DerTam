import 'package:flutter/material.dart';
import 'package:mobile_frontend/data/repository/abstract/budget_repository.dart';
import 'package:mobile_frontend/models/budget/budget.dart';

class BudgetProvider extends ChangeNotifier {
  final BudgetRepository repository;
  BudgetProvider({required this.repository});
  Future<void> createBudget(
    String tripId,
    double amount,
    String currency,
  ) async {
    await repository.createBudget(tripId, amount, currency);
  }

  Future<Budget> getBudgetDetail(String tripId) async {
    return await repository.getBudgetDetail(tripId);
  }

  Future<void> updateBudget(String budgetId, double amount) async {
    await repository.updateBudget(budgetId, amount);
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
  }

  Future<void> updateExpense(
    String expenseId,
    String name,
    String amount,
    DateTime date,
    String currency,
    String categoryId,
    String description,
  ) async {
    await repository.updateExpense(
      expenseId,
      name,
      amount,
      date,
      currency,
      categoryId,
      description,
    );
  }

  Future<void> deleteExpense(String expenseId) async {
    await repository.deleteExpense(expenseId);
  }
}
