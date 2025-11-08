import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

enum ExpenseCategory {
  food,
  transportation,
  accommodation,
  tickets,
  shopping,
  other,
}

extension ExpenseCategoryExtension on ExpenseCategory {
  IconData get icon {
    switch (this) {
      case ExpenseCategory.food:
        return Icons.fastfood;
      case ExpenseCategory.transportation:
        return Icons.directions_car;
      case ExpenseCategory.shopping:
        return Icons.shopping_cart;
      case ExpenseCategory.other:
        return Icons.more_horiz;
      case ExpenseCategory.accommodation:
        return Icons.hotel;
      case ExpenseCategory.tickets:
        return Icons.airplanemode_active;
    }
  }

  String get label {
    switch (this) {
      case ExpenseCategory.food:
        return "Food";
      case ExpenseCategory.transportation:
        return "Transport";
      case ExpenseCategory.shopping:
        return "Shopping";
      case ExpenseCategory.other:
        return "Other";
      case ExpenseCategory.accommodation:
        return "Accommodation";
      case ExpenseCategory.tickets:
        return "Tickets";
    }
  }
}

class Expense {
  final String id;
  final double amount;
  final ExpenseCategory category;
  final DateTime date;
  final String description;
  final String? placeId;

  Expense({
    required this.id,
    required this.amount,
    required this.category,
    required this.date,
    required this.description,
    this.placeId,
  });

  // Factory constructor to create a new Expense with a unique ID
  factory Expense.create({
    required double amount,
    required ExpenseCategory category,
    required DateTime date,
    required String description,
    String? placeId,
  }) {
    return Expense(
      id: const Uuid().v4(),
      amount: amount,
      category: category,
      date: date,
      description: description,
      placeId: placeId,
    );
  }

  factory Expense.fromMap(Map<String, dynamic> data) {
    // Handle both Timestamp and DateTime objects
    DateTime expenseDate;
    if (data['date'] is Timestamp) {
      expenseDate = (data['date'] as Timestamp).toDate();
    } else if (data['date'] is DateTime) {
      expenseDate = data['date'];
    } else {
      expenseDate = DateTime.now(); // Fallback
    }

    return Expense(
      id: data['id'] ?? const Uuid().v4(),
      amount: (data['amount'] ?? 0).toDouble(),
      category: ExpenseCategory.values[data['category'] ?? 0],
      date: expenseDate,
      description: data['description'] ?? '',
      placeId: data['placeId'],
    );
  }

  // Create a copy of this expense with updated fields
  Expense copyWith({
    String? id,
    double? amount,
    ExpenseCategory? category,
    DateTime? date,
    String? description,
    String? placeId,
  }) {
    return Expense(
      id: id ?? this.id,
      amount: amount ?? this.amount,
      category: category ?? this.category,
      date: date ?? this.date,
      description: description ?? this.description,
      placeId: placeId ?? this.placeId,
    );
  }

  factory Expense.fromJson(Map<String, dynamic> json) {
    return Expense(
      id: json['id'] ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      category: json['category'] ?? 'other',
      date: DateTime.parse(json['date'] ?? DateTime.now().toIso8601String()),
      description: json['description'] ?? '',
      placeId: json['place_id'],
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    if (other is! Expense) return false;
    return id == other.id && amount == other.amount;
  }

  @override
  int get hashCode => super.hashCode ^ amount.hashCode;
}
