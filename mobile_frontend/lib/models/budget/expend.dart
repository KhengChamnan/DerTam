import 'package:mobile_frontend/models/budget/expense_category.dart';

class Expense {
  final String id;
  final double amount;
  final String? currency;
  final DateTime date;
  final String description;
  final ExpenseCategory category;

  Expense({
    required this.id,
    required this.amount,
    this.currency,
    required this.category,
    required this.date,
    required this.description,
  });

  factory Expense.fromJson(Map<String, dynamic> json) {
    return Expense(
      id: json['id']?.toString() ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency']?.toString(),
      category: ExpenseCategory.fromJson(json['category']),
      date: json['date'] != null
          ? DateTime.parse(json['date'].toString())
          : DateTime.now(),
      description: json['description']?.toString() ?? '',
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    if (other is! Expense) return false;
    return id == other.id && amount == other.amount;
  }

  @override
  int get hashCode => id.hashCode ^ amount.hashCode;
}
