import 'dart:convert';

import 'package:mobile_frontend/data/dto/budget_dto.dart';
import 'package:mobile_frontend/data/network/api_constant.dart';
import 'package:mobile_frontend/data/network/fetching_data.dart';
import 'package:mobile_frontend/data/repository/abstract/budget_repository.dart';
import 'package:mobile_frontend/data/repository/laravel/laravel_auth_api_repository.dart';
import 'package:mobile_frontend/models/budget/budget.dart';
import 'package:mobile_frontend/models/budget/expense_category.dart';

class LaravelBudgetApiRepository implements BudgetRepository {
  final LaravelAuthApiRepository repository;
  LaravelBudgetApiRepository(this.repository);
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
      final body = {
        'trip_id': tripId,
        'total_budget': amount,
        'currency': currency,
      };
      final response = await FetchingData.postHeader(
        ApiEndpoint.createBudget,
        headers,
        body,
      );
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
      final responseBudgetDetail = await FetchingData.getData(
        '/api/trips/$tripId/budget',
        headers,
      );
      print('Response Budget Detail: ${responseBudgetDetail.body}');
      print('Response Status Code: ${responseBudgetDetail.statusCode}');
      if (responseBudgetDetail.statusCode == 200) {
        final jsonResponse = responseBudgetDetail.body;
        final budgetDetail = BudgetDto.fromBudget(json.decode(jsonResponse));
        return budgetDetail;
      } else {
        throw Exception(
          'Failed to get budget detail: ${responseBudgetDetail.statusCode}',
        );
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
      print('Delete Expense: ${response.body}');
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
          'amount': amount,
          'date': date.toIso8601String(),
          'currency': currency,
          'category_id': categoryId,
          'description': description,
        },
      );
      final responseData = json.decode(response.body);
      print('Update budget $responseData');
      if (response.statusCode == 200) {
        print('Expense updated successfully: $responseData');
      } else {
        throw Exception('Failed to update expense: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<ExpenseCategory>> getExpenseCategory() async {
    try {
      final expenseCategory = await FetchingData.getData(
        ApiEndpoint.expenseCategory,
        _baseHeaders,
      );
      if (expenseCategory.statusCode == 200) {
        final jsonResponse = expenseCategory.body;
        print('📄 [DEBUG] Response body: ${expenseCategory.body}');
        final Map<String, dynamic> responseData = json.decode(jsonResponse);
        final List<dynamic> categoryList =
            responseData['data'] as List<dynamic>;
        return categoryList
            .map(
              (categoryJson) => ExpenseCategory.fromJson(
                categoryJson as Map<String, dynamic>,
              ),
            )
            .toList();
      } else {
        throw Exception('Failed to get expenseCategory');
      }
    } catch (e) {
      rethrow;
    }
  }
}
