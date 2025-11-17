import 'dart:convert';

import 'package:mobile_frontend/data/network/api_constant.dart';
import 'package:mobile_frontend/data/network/fetching_data.dart';
import 'package:mobile_frontend/data/repository/abstract/budget_repository.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_auth_api_repository.dart';
import 'package:mobile_frontend/models/budget/budget.dart';

class LaravelBudgetApiRepository implements BudgetRepository {
  late LaravelAuthApiRepository repository;
  final _baseHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  Map<String, String> _getAuthHeaders(String token) => {
    ..._baseHeaders,
    'Authorization': 'Bearer $token',
  };
  @override
  Future<void> createBudget(
    String tripId,
    double amount,
    String currency,
  ) async {
    try {
      final token = await repository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final headers = _getAuthHeaders(token);
      final response = await FetchingData.postData(ApiEndpoint.createBudget, {
        'trip_id': tripId,
        'amount': amount,
        'currency': currency,
      }, headers);
      if (response.statusCode == 201) {
        print('Budget created successfully');
      } else {
        throw Exception('Failed to create budget: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Budget> getBudgetDetail(String tripId) async {
    try {
      final token = await repository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final headers = _getAuthHeaders(token);
      final response = await FetchingData.getData(
        '/api/trips/$tripId/budget',
        headers,
      );
      if (response.statusCode == 200) {
        return Budget.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to get budget detail: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> updateBudget(String budgetId, double amount) async {
    try {
      final token = await repository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final headers = _getAuthHeaders(token);
      final response = await FetchingData.updateDate(
        '${ApiEndpoint.updateBudget}/$budgetId',
        headers,
        {'total_budget': amount},
      );
      final responseData = json.decode(response.body);
      if (response.statusCode == 200) {
        print('Update budget has been successfully: $responseData');
      } else {
        throw Exception('Failed to update budget: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> addExpense(
    String amount,
    String currency,
    DateTime date,
    String description,
    String categoryId,
    String budgetId,
  ) async {
    try {
      final token = await repository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final body = {
        'amount': amount,
        'currency': currency,
        'date': date.toIso8601String(),
        'description': description,
        'category_id': categoryId,
      };
      final headers = _getAuthHeaders(token);
      final response = await FetchingData.postData(
        '/api/budgets/$budgetId/expenses',
        body,
        headers,
      );
      if (response.statusCode == 201) {
        print('Expense added successfully');
      } else {
        throw Exception('Failed to add expense: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> deleteExpense(String expenseId) async {
    try {
      final token = await repository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final headers = _getAuthHeaders(token);
      final response = await FetchingData.deleteData(
        '${ApiEndpoint.deleteExpense}/$expenseId',
        headers,
      );
      if (response.statusCode == 200) {
        print('Expense deleted successfully');
      } else {
        throw Exception('Failed to delete expense: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> updateExpense(
    String expenseId,
    String name,
    String amount,
    DateTime date,
    String currency,
    String categoryId,
    String description,
  ) async {
    try {
      final token = await repository.getToken();
      if (token == null) {
        throw Exception('User is not authenticated');
      }
      final headers = _getAuthHeaders(token);
      final response = await FetchingData.updateData(
        '${ApiEndpoint.updateExpense}/$expenseId',
        headers,
        {
          'name': name,
          'amount': amount,
          'date': date.toIso8601String(),
          'currency': currency,
          'category_id': categoryId,
          'description': description,
        },
      );
      final responseData = json.decode(response.body);
      if (response.statusCode == 200) {
        print('Expense updated successfully: $responseData');
      } else {
        throw Exception('Failed to update expense: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }
}
