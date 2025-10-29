import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:mobile_frontend/models/budget/expend.dart';

class ExpenseDto {
  static Expense fromJson(String id, Map<String, dynamic> json) {
    // Handle both Timestamp and DateTime objects
    DateTime expenseDate;
    if (json['date'] is Timestamp) {
      expenseDate = (json['date'] as Timestamp).toDate();
    } else if (json['date'] is DateTime) {
      expenseDate = json['date'];
    } else {
      expenseDate = DateTime.now(); // Fallback
    }
    
    // Handle the expense category
    ExpenseCategory category;
    if (json['category'] is int) {
      // Get the enum by index if it's stored as an integer
      category = ExpenseCategory.values[json['category']];
    } else if (json['category'] is String) {
      // Try to parse from string
      try {
        category = ExpenseCategory.values.firstWhere(
          (e) => e.toString() == 'ExpenseCategory.${json['category']}' || 
                 e.toString().split('.').last == json['category']
        );
      } catch (_) {
        category = ExpenseCategory.values[0]; // Default to first category
      }
    } else {
      category = ExpenseCategory.values[0]; // Default
    }

    return Expense(
      id: id,
      amount: (json['amount'] ?? 0).toDouble(),
      category: category,
      date: expenseDate,
      description: json['description'] ?? '',
      placeId: json['placeId'],
    );
  }

  static Map<String, dynamic> toJson(Expense expense) {
    return {
      'id': expense.id,
      'amount': expense.amount,
      'category': expense.category.index, // Store the enum as its index
      'date': expense.date, // Firestore will convert DateTime to Timestamp
      'description': expense.description,
      'placeId': expense.placeId,
    };
  }
}