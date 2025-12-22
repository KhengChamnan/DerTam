import 'package:flutter/material.dart';
import 'package:mobile_frontend/models/budget/expend.dart';
import 'package:mobile_frontend/models/budget/expense_category.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:mobile_frontend/ui/providers/budget_provider.dart';
import 'package:provider/provider.dart';

class AddExpenseScreen extends StatefulWidget {
  final String selectedCurrency;
  final double remainingBudget;
  final double dailyBudget;
  final double totalBudget;
  final String tripId;
  final String budgetId;
  final DateTime tripStartDate;
  final DateTime tripEndDate;
  final Expense? expense;
  final bool isEditing;

  const AddExpenseScreen({
    super.key,
    required this.selectedCurrency,
    required this.remainingBudget,
    required this.dailyBudget,
    required this.totalBudget,
    required this.tripId,
    required this.budgetId,
    required this.tripStartDate,
    required this.tripEndDate,
    this.expense,
    this.isEditing = false,
  });

  @override
  State<AddExpenseScreen> createState() => _AddExpenseScreenState();
}

class _AddExpenseScreenState extends State<AddExpenseScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _peopleController = TextEditingController(text: '1');

  DateTime _selectedDate = DateTime.now();
  ExpenseCategory? _selectedCategory;
  List<ExpenseCategory> _categories = [];
  bool _isLoadingCategories = true;

  @override
  void initState() {
    super.initState();

    // Set default date to appropriate trip day
    final now = DateTime.now();
    final tripStart = DateTime(
      widget.tripStartDate.year,
      widget.tripStartDate.month,
      widget.tripStartDate.day,
    );
    final tripEnd = DateTime(
      widget.tripEndDate.year,
      widget.tripEndDate.month,
      widget.tripEndDate.day,
    );
    final today = DateTime(now.year, now.month, now.day);

    if (today.isAfter(tripEnd)) {
      // Trip has ended, default to last day
      _selectedDate = widget.tripEndDate;
    } else if (today.isBefore(tripStart)) {
      // Trip hasn't started, default to first day
      _selectedDate = widget.tripStartDate;
    } else {
      // Trip is ongoing, default to today
      _selectedDate = now;
    }

    // If editing, populate fields
    if (widget.isEditing && widget.expense != null) {
      _amountController.text = widget.expense!.amount.toString();
      _descriptionController.text = widget.expense!.description;
      _selectedDate = widget.expense!.date;
      _selectedCategory = widget.expense!.category;
    }

    // Fetch categories from backend
    _fetchCategories();
  }

  Future<void> _fetchCategories() async {
    try {
      final provider = Provider.of<BudgetProvider>(context, listen: false);
      final categories = await provider.getExpenseCategory();
      setState(() {
        _categories = categories;
        _isLoadingCategories = false;
        // Set first category as default if not editing
        if (!widget.isEditing && categories.isNotEmpty) {
          _selectedCategory = categories.first;
        }
      });
    } catch (e) {
      setState(() {
        _isLoadingCategories = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load categories: $e')),
        );
      }
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    _descriptionController.dispose();
    _peopleController.dispose();
    super.dispose();
  }

  String _getCurrencySymbol() {
    switch (widget.selectedCurrency) {
      case 'USD':
        return '\$';
      case 'KHR':
        return '៛';
      default:
        return '\$';
    }
  }

  double get _totalAmount {
    final amount = double.tryParse(_amountController.text) ?? 0.0;
    final people = int.tryParse(_peopleController.text) ?? 1;
    return amount * people;
  }

  double get _availableForToday {
    final today = DateTime.now();
    final selectedDay = DateTime(
      _selectedDate.year,
      _selectedDate.month,
      _selectedDate.day,
    );
    final todayDay = DateTime(today.year, today.month, today.day);

    if (selectedDay.isAtSameMomentAs(todayDay)) {
      return widget.dailyBudget; // Available for today
    } else {
      return widget
          .remainingBudget; // Available from total budget for other days
    }
  }

  // Replace _selectDate with _selectTripDay
  void _selectTripDay() {
    final tripStartDay = DateTime(
      widget.tripStartDate.year,
      widget.tripStartDate.month,
      widget.tripStartDate.day,
    );
    final tripEndDay = DateTime(
      widget.tripEndDate.year,
      widget.tripEndDate.month,
      widget.tripEndDate.day,
    );
    final totalDays = tripEndDay.difference(tripStartDay).inDays + 1;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(20),
          height: MediaQuery.of(context).size.height * 0.6,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Select Trip Day',
                    style: TextStyle(
                      fontSize: 18,
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
              Expanded(
                child: ListView.builder(
                  itemCount: totalDays,
                  itemBuilder: (context, index) {
                    final dayNumber = index + 1;
                    final dayDate = tripStartDay.add(Duration(days: index));
                    final isSelected =
                        DateTime(
                          dayDate.year,
                          dayDate.month,
                          dayDate.day,
                        ).isAtSameMomentAs(
                          DateTime(
                            _selectedDate.year,
                            _selectedDate.month,
                            _selectedDate.day,
                          ),
                        );

                    final today = DateTime.now();
                    final todayDay = DateTime(
                      today.year,
                      today.month,
                      today.day,
                    );
                    final isToday = DateTime(
                      dayDate.year,
                      dayDate.month,
                      dayDate.day,
                    ).isAtSameMomentAs(todayDay);
                    final isPast = dayDate.isBefore(todayDay);
                    final isFuture = dayDate.isAfter(todayDay);

                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: Container(
                          width: 50,
                          height: 40,
                          decoration: BoxDecoration(
                            color: isSelected
                                ? DertamColors.primaryDark
                                : isToday
                                ? Colors.blue[100]
                                : Colors.grey[200],
                            borderRadius: BorderRadius.circular(8),
                            border: isToday && !isSelected
                                ? Border.all(color: Colors.blue, width: 2)
                                : null,
                          ),
                          child: Center(
                            child: Text(
                              '$dayNumber',
                              style: TextStyle(
                                color: isSelected
                                    ? Colors.white
                                    : isToday
                                    ? Colors.blue[700]
                                    : Colors.grey[600],
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        ),
                        title: Row(
                          children: [
                            Text(
                              'Day $dayNumber',
                              style: TextStyle(
                                fontWeight: isSelected
                                    ? FontWeight.bold
                                    : FontWeight.w500,
                                color: isSelected
                                    ? DertamColors.primaryDark
                                    : DertamColors.black,
                              ),
                            ),
                            if (isToday) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.blue,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Text(
                                  'Today',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        subtitle: Text(
                          _formatFullDate(dayDate),
                          style: TextStyle(
                            color: isPast
                                ? Colors.grey[500]
                                : isFuture
                                ? Colors.orange[600]
                                : Colors.blue[600],
                            fontSize: 13,
                          ),
                        ),
                        trailing: isPast
                            ? Icon(
                                Icons.history,
                                color: Colors.grey[400],
                                size: 20,
                              )
                            : isFuture
                            ? Icon(
                                Icons.schedule,
                                color: Colors.orange[400],
                                size: 20,
                              )
                            : Icon(
                                Icons.today,
                                color: Colors.blue[400],
                                size: 20,
                              ),
                        onTap: () {
                          setState(() {
                            _selectedDate = dayDate;
                          });
                          Navigator.pop(context);
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // First, add this helper method to get the appropriate icon for each category
  IconData _getCategoryIcon(String categoryName) {
    switch (categoryName.toLowerCase()) {
      case 'transportation':
        return Icons.directions_car;
      case 'accommodation':
        return Icons.hotel;
      case 'food & drinks':
        return Icons.restaurant;
      case 'activities':
        return Icons.local_activity;
      case 'souvenirs':
        return Icons.card_giftcard;
      case 'emergency':
        return Icons.emergency;
      case 'miscellaneous':
        return Icons.more_horiz;
      default:
        return Icons.category;
    }
  }
  
  void _selectCategory() {
    if (_isLoadingCategories) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Loading categories...')));
      return;
    }
    
    if (_categories.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('No categories available')));
      return;
    }

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SingleChildScrollView(
          child: Container(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Select Category',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: DertamColors.black,
                  ),
                ),
                const SizedBox(height: 20),

                ..._categories.map((category) {
                  final isSelected = _selectedCategory?.id == category.id;
                  return ListTile(
                    leading: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: isSelected
                            ? DertamColors.primaryDark
                            : Colors.grey[200],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        _getCategoryIcon(
                          category.name,
                        ), // Changed from Icons.category
                        color: isSelected ? Colors.white : Colors.grey[600],
                      ),
                    ),
                    title: Text(
                      category.name,
                      style: TextStyle(
                        fontWeight: isSelected
                            ? FontWeight.w600
                            : FontWeight.normal,
                        color: isSelected
                            ? DertamColors.primaryDark
                            : DertamColors.black,
                      ),
                    ),
                    trailing: isSelected
                        ? Icon(Icons.check, color: DertamColors.primaryDark)
                        : null,
                    onTap: () {
                      setState(() {
                        _selectedCategory = category;
                      });
                      Navigator.pop(context);
                    },
                  );
                }),
              ],
            ),
          ),
        );
      },
    );
  }

  void _saveExpense() async {
    if (!_formKey.currentState!.validate()) return;
    if (_totalAmount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a valid amount'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    if (_selectedCategory == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a category'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    if (_descriptionController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a description'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    // Check if expense exceeds budget
    final currentTotalSpent = widget.remainingBudget < widget.totalBudget
        ? widget.totalBudget - widget.remainingBudget
        : 0.0;
    final newTotalSpent = currentTotalSpent + _totalAmount;
    // Show warning if exceeds total budget
    if (newTotalSpent > widget.totalBudget) {
      final shouldContinue = await _showBudgetExceededDialog();
      if (!shouldContinue) return;
    }
    // Save the expense using the provider
    try {
      final provider = Provider.of<BudgetProvider>(context, listen: false);

      await provider.addExpense(
        _totalAmount.toString(),
        widget.selectedCurrency,
        _selectedDate,
        _descriptionController.text.trim(),
        _selectedCategory!.id,
        widget.budgetId,
      );

      if (mounted) {
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to add expense: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _editExpense() async {
    if (!_formKey.currentState!.validate()) return;
    if (_totalAmount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a valid amount'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    if (_selectedCategory == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a category'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    if (_descriptionController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a description'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    // Check if expense exceeds budget (when editing, exclude the original amount)
    final currentTotalSpent = widget.remainingBudget < widget.totalBudget
        ? widget.totalBudget - widget.remainingBudget
        : 0.0;
    // When editing, subtract the original expense amount before adding the new amount
    final originalAmount = widget.expense?.amount ?? 0.0;
    final newTotalSpent = (currentTotalSpent - originalAmount) + _totalAmount;
    // Show warning if exceeds total budget
    if (newTotalSpent > widget.totalBudget) {
      final shouldContinue = await _showBudgetExceededDialog();
      if (!shouldContinue) return;
    }
    // Update the expense using the provider
    try {
      final provider = Provider.of<BudgetProvider>(context, listen: false);

      await provider.updateExpense(
        widget.expense!.id,
        _totalAmount.toString(),
        _selectedDate, // name parameter
        widget.selectedCurrency,
        _selectedCategory!.id,
        _descriptionController.text.trim(),
      );
      if (mounted) {
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update expense: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  // Add this method to show the budget exceeded dialog
  Future<bool> _showBudgetExceededDialog() async {
    return await showDialog<bool>(
          context: context,
          barrierDismissible: false,
          builder: (BuildContext context) {
            return Dialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              backgroundColor: Colors.white,
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  color: Colors.white,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Warning Icon
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: Colors.red[50],
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.warning_rounded,
                        color: Colors.red[600],
                        size: 30,
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Title
                    Text(
                      'Budget Exceeded',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: DertamColors.black,
                      ),
                      textAlign: TextAlign.center,
                    ),

                    const SizedBox(height: 16),

                    // Message
                    RichText(
                      textAlign: TextAlign.center,
                      text: TextSpan(
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey[700],
                          height: 1.4,
                        ),
                        children: [
                          const TextSpan(
                            text: 'This expense exceeds your total budget of ',
                          ),
                          TextSpan(
                            text:
                                '${_getCurrencySymbol()} ${widget.totalBudget.toStringAsFixed(2)}',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.red[600],
                            ),
                          ),
                          const TextSpan(
                            text: '\n\nAre you sure you want to continue?',
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Note
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Note: You won\'t be asked again for this session.',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[600],
                          fontStyle: FontStyle.italic,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Buttons
                    Row(
                      children: [
                        // Cancel Button
                        Expanded(
                          child: TextButton(
                            onPressed: () => Navigator.of(context).pop(false),
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side: BorderSide(color: Colors.grey[300]!),
                              ),
                            ),
                            child: Text(
                              'Cancel',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: Colors.grey[700],
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(width: 12),

                        // Continue Button
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () => Navigator.of(context).pop(true),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red[600],
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 0,
                            ),
                            child: const Text(
                              'Continue Anyway',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ) ??
        false;
  }

  // Update the _formatDate method to show trip day
  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final selectedDay = DateTime(date.year, date.month, date.day);

    // Calculate which day of the trip this is
    final tripStartDay = DateTime(
      widget.tripStartDate.year,
      widget.tripStartDate.month,
      widget.tripStartDate.day,
    );
    final dayOfTrip = selectedDay.difference(tripStartDay).inDays + 1;

    if (selectedDay.isAtSameMomentAs(today)) {
      return 'Day $dayOfTrip (Today)';
    } else if (selectedDay.isAtSameMomentAs(
      today.add(const Duration(days: 1)),
    )) {
      return 'Day $dayOfTrip (Tomorrow)';
    } else if (selectedDay.isAtSameMomentAs(
      today.subtract(const Duration(days: 1)),
    )) {
      return 'Day $dayOfTrip (Yesterday)';
    } else {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return 'Day $dayOfTrip (${days[date.weekday - 1]})';
    }
  }

  // Add helper method for full date formatting
  String _formatFullDate(DateTime date) {
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${days[date.weekday - 1]}, ${months[date.month - 1]} ${date.day}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new_outlined,
            color: DertamColors.primaryBlue,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.isEditing ? 'Edit Expense' : 'Add Expense',
          style: TextStyle(
            color: DertamColors.primaryBlue,
            fontSize: 24,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Total Amount Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Total',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w500,
                        color: DertamColors.black,
                      ),
                    ),
                    Text(
                      '${_getCurrencySymbol()} ${_totalAmount.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: DertamColors.primaryDark,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Select Day - UPDATED TO USE TRIP DAYS
              Text(
                'Select Day',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 8),
              GestureDetector(
                onTap:
                    _selectTripDay, // Changed from _selectDate to _selectTripDay
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey[300]!),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.calendar_today,
                        color: DertamColors.primaryDark,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          '${_formatDate(_selectedDate)} (${_selectedDate.day}/${_selectedDate.month})',
                          style: const TextStyle(fontSize: 16),
                        ),
                      ),
                      Icon(Icons.keyboard_arrow_down, color: Colors.grey[600]),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Budget Info
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _formatDate(_selectedDate).contains('Today')
                        ? 'Daily budget:'
                        : 'Available budget:',
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                  Text(
                    '${_getCurrencySymbol()} ${_availableForToday.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Available for ${_formatDate(_selectedDate).toLowerCase()}:',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Colors.green[600],
                    ),
                  ),
                  Text(
                    '${_getCurrencySymbol()} ${_availableForToday.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.green[600],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Category Selection
              GestureDetector(
                onTap: _selectCategory,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey[300]!),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: _selectedCategory != null
                              ? DertamColors.primaryDark
                              : Colors.grey[300],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          _selectedCategory != null
                              ? _getCategoryIcon(
                                  _selectedCategory!.name,
                                ) // Changed
                              : Icons.category,
                          color: _selectedCategory != null
                              ? Colors.white
                              : Colors.grey[600],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _selectedCategory?.name ?? 'Select Category',
                          style: TextStyle(
                            fontSize: 16,
                            color: _selectedCategory != null
                                ? DertamColors.black
                                : Colors.grey[600],
                          ),
                        ),
                      ),
                      Icon(Icons.keyboard_arrow_down, color: Colors.grey[600]),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Expense Amount
              TextFormField(
                controller: _amountController,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                decoration: InputDecoration(
                  labelText: 'Expense Amount (${_getCurrencySymbol()})',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: DertamColors.primaryDark),
                  ),
                ),
                onChanged: (value) {
                  setState(() {}); // Update total amount
                },
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter an amount';
                  }
                  if (double.tryParse(value) == null ||
                      double.parse(value) <= 0) {
                    return 'Please enter a valid amount';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // // Number of People
              // Text(
              //   'Number of People',
              //   style: TextStyle(
              //     fontSize: 16,
              //     fontWeight: FontWeight.w500,
              //     color: Colors.grey[600],
              //   ),
              // ),
              // const SizedBox(height: 8),
              // TextFormField(
              //   controller: _peopleController,
              //   keyboardType: TextInputType.number,
              //   decoration: InputDecoration(
              //     border: OutlineInputBorder(
              //       borderRadius: BorderRadius.circular(12),
              //     ),
              //     focusedBorder: OutlineInputBorder(
              //       borderRadius: BorderRadius.circular(12),
              //       borderSide: BorderSide(color: DertamColors.primaryDark),
              //     ),
              //   ),
              //   onChanged: (value) {
              //     setState(() {}); // Update total amount
              //   },
              //   validator: (value) {
              //     if (value == null || value.isEmpty) {
              //       return 'Please enter number of people';
              //     }
              //     if (int.tryParse(value) == null || int.parse(value) <= 0) {
              //       return 'Please enter a valid number';
              //     }
              //     return null;
              //   },
              // ),
              const SizedBox(height: 24),

              // Description
              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                decoration: InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: DertamColors.primaryDark),
                  ),
                  alignLabelWithHint: true,
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter a description';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 32),

              // Save Button
              SizedBox(
                width: double.infinity,
                child: DertamButton(
                  text: widget.isEditing ? 'Update Expense' : 'Add Expense',
                  onPressed: widget.isEditing ? _editExpense : _saveExpense,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
