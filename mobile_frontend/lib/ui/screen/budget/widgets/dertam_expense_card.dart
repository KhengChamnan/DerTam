import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/budget/expend.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';

class ExpenseItem extends StatelessWidget {
  final Expense expense;
  final int index;
  final String currencySymbol;
  final VoidCallback onDelete;
  final VoidCallback? onTap;
  final VoidCallback? onEdit;

  const ExpenseItem({
    super.key,
    required this.expense,
    required this.index,
    required this.currencySymbol,
    required this.onDelete,
    this.onTap,
    this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Dismissible(
        key: Key(expense.id),
        direction: DismissDirection.endToStart,
        background: Container(
          alignment: Alignment.centerRight,
          padding: const EdgeInsets.only(right: 20),
          decoration: BoxDecoration(
            color: Colors.red,
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Icon(Icons.delete, color: Colors.white, size: 24),
              SizedBox(width: 8),
              Text(
                'Delete',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                ),
              ),
            ],
          ),
        ),
        confirmDismiss: (direction) async {
          // Show confirmation dialog
          return await showDialog<bool>(
            context: context,
            builder: (BuildContext context) {
              return AlertDialog(
                title: const Text('Delete Expense'),
                content: Text(
                  'Are you sure you want to delete "${expense.description}"?',
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(false),
                    child: const Text('Cancel'),
                  ),
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(true),
                    style: TextButton.styleFrom(foregroundColor: Colors.red),
                    child: const Text('Delete'),
                  ),
                ],
              );
            },
          );
        },
        onDismissed: (direction) {
          onDelete();
        },
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                // Category Icon
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: DertamColors.primaryBlue,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(Icons.category, color: Colors.white, size: 20),
                ),
                const SizedBox(width: 12),

                // Expense Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        expense.description,
                        style: TextStyle(
                          fontSize: 18,
                          color: DertamColors.neutralLight,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 2),

                      Text(
                        '$currencySymbol ${expense.amount.toStringAsFixed(0)}',
                        style: TextStyle(
                          fontSize: 16,
                          color: DertamColors.primaryBlue,
                        ),
                      ),
                    ],
                  ),
                ),

                // Date and Time
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      _formatDate(expense.date),
                      style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                    ),
                  ],
                ),
                // Swipe indicator
                const SizedBox(width: 8),
                IconButton(
                  icon: Icon(
                    Icons.edit_outlined,
                    color: DertamColors.primaryDark,
                    size: 24,
                  ),
                  onPressed: onEdit,
                  tooltip: 'Edit expense',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return '${days[date.weekday - 1]} ${date.day}/${date.month}';
  }
}

class BudgetDetailItem extends StatelessWidget {
  final String label;
  final String value;
  final String? description;
  final double labelFlex;
  final double valueFlex;
  final Color? valueColor;
  final FontWeight? valueFontWeight;
  final double? valueFontSize;

  const BudgetDetailItem({
    super.key,
    required this.label,
    required this.value,
    this.description,
    this.labelFlex = 2,
    this.valueFlex = 1,
    this.valueColor,
    this.valueFontWeight = FontWeight.bold,
    this.valueFontSize = 16,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: labelFlex.toInt(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: DertamColors.black,
                    fontSize: 14,
                  ),
                ),
                if (description != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    description!,
                    style: TextStyle(color: Colors.grey[600], fontSize: 12),
                  ),
                ],
              ],
            ),
          ),
          Expanded(
            flex: valueFlex.toInt(),
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: TextStyle(
                fontWeight: valueFontWeight,
                color: valueColor ?? DertamColors.primaryDark,
                fontSize: valueFontSize,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Keep the simple ExpenseDetailItem for basic cases
class ExpenseDetailItem extends StatelessWidget {
  final String label;
  final String value;
  final double labelWidth;

  const ExpenseDetailItem({
    super.key,
    required this.label,
    required this.value,
    this.labelWidth = 80,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: labelWidth,
            child: Text(
              label,
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                color: DertamColors.black,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Add a complete expense details sheet widget
class ExpenseDetailsSheet extends StatelessWidget {
  final Expense expense;
  final String currencySymbol;

  const ExpenseDetailsSheet({
    super.key,
    required this.expense,
    required this.currencySymbol,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Expense Details',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: DertamColors.black,
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: Icon(Icons.close, color: Colors.grey[600]),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Amount
          Text(
            '$currencySymbol ${expense.amount.toStringAsFixed(2)}',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: DertamColors.primaryDark,
            ),
          ),

          const SizedBox(height: 20),

          // Details using the reusable component
          ExpenseDetailItem(label: 'Description', value: expense.description),
          ExpenseDetailItem(label: 'Category', value: expense.category.name),
          ExpenseDetailItem(
            label: 'Date',
            value:
                '${expense.date.day}/${expense.date.month}/${expense.date.year}',
          ),
          ExpenseDetailItem(
            label: 'Time',
            value:
                '${expense.date.hour.toString().padLeft(2, '0')}:${expense.date.minute.toString().padLeft(2, '0')}',
          ),
        ],
      ),
    );
  }
}
