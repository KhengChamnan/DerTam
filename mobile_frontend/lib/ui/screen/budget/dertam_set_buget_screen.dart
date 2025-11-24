import 'package:flutter/material.dart';
import 'package:mobile_frontend/ui/providers/budget_provider.dart';
import 'package:mobile_frontend/ui/screen/budget/dertam_budget_detail_screen.dart';
import 'package:mobile_frontend/ui/theme/dertam_apptheme.dart';
import 'package:mobile_frontend/ui/widgets/actions/dertam_button.dart';
import 'package:provider/provider.dart';

class SetBudgetScreen extends StatefulWidget {
  final String tripId;
  final String tripName;
  final DateTime startDate;
  final DateTime endDate;

  const SetBudgetScreen({
    super.key,
    required this.tripId,
    required this.tripName,
    required this.startDate,
    required this.endDate,
  });

  @override
  State<SetBudgetScreen> createState() => _SetBudgetScreenState();
}

class _SetBudgetScreenState extends State<SetBudgetScreen> {
  final TextEditingController _totalBudgetController = TextEditingController();
  final TextEditingController _dailyBudgetController = TextEditingController();
  bool _dailyBudgetManuallyEdited = false;

  String _selectedCurrency = 'USD';

  // List of available currencies
  final List<Map<String, String>> _currencies = [
    {'code': 'USD', 'name': 'US Dollar', 'symbol': '\$'},
    {'code': 'KHR', 'name': 'Cambodian Riel', 'symbol': '៛'},
  ];

  @override
  void initState() {
    super.initState();
    _updateDailyBudget();
  }

  @override
  void dispose() {
    _totalBudgetController.dispose();
    _dailyBudgetController.dispose();
    super.dispose();
  }

  String get _currencySymbol {
    return _currencies.firstWhere(
      (currency) => currency['code'] == _selectedCurrency,
      orElse: () => {'symbol': '\$'},
    )['symbol']!;
  }

  void _updateDailyBudget() {
    if (_totalBudgetController.text.isNotEmpty && !_dailyBudgetManuallyEdited) {
      try {
        final totalBudget = double.parse(_totalBudgetController.text);
        final tripDays = widget.endDate.difference(widget.startDate).inDays + 1;
        final dailyBudget = totalBudget / tripDays;

        setState(() {
          _dailyBudgetController.text = dailyBudget.toStringAsFixed(0);
        });
      } catch (e) {
        setState(() {
          _dailyBudgetController.text = '';
        });
      }
    }
  }

  void _saveBudget() async {
    if (_totalBudgetController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a total budget'),
          backgroundColor: Colors.red,
        ),
      );
    } else {
      final budgetProvider = Provider.of<BudgetProvider>(
        context,
        listen: false,
      );
      await budgetProvider.createBudget(
        widget.tripId,
        double.parse(_totalBudgetController.text),
        _selectedCurrency,
      );
    }

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => BudgetScreen(
          tripId: widget.tripId,
          tripStartDate: widget.startDate,
          tripEndDate: widget.endDate,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DertamColors.white,
      appBar: AppBar(
        backgroundColor: DertamColors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: DertamColors.black),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: TextStyle(
                color: DertamColors.black,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight:
                  MediaQuery.of(context).size.height -
                  AppBar().preferredSize.height -
                  MediaQuery.of(context).padding.top -
                  40,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 20),

                // Title
                Text(
                  'Set Your Budget',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: DertamColors.black,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 16),

                // Subtitle
                Text(
                  'How much you planning to spend on this trip?',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w400,
                  ),
                  textAlign: TextAlign.center,
                ),
                Text(
                  'Trip Duration: ${widget.endDate.difference(widget.startDate).inDays + 1} days',
                  style: TextStyle(
                    fontSize: 16,
                    color: DertamColors.primaryBlue,
                    fontWeight: FontWeight.w500,
                  ),
                ),

                const SizedBox(height: 40),

                // Budget input with currency toggle - NEW STYLE
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _totalBudgetController,
                        keyboardType: TextInputType.number,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: DertamColors.black,
                        ),
                        decoration: InputDecoration(
                          labelText:
                              "Total Budget ${_currencySymbol != '' ? '($_currencySymbol)' : ''}",
                          labelStyle: TextStyle(
                            color: Colors.grey[500],
                            fontSize: 14,
                            fontWeight: FontWeight.w400,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide(
                              color: Colors.grey[200]!,
                              width: 2,
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide(
                              color: Colors.grey[200]!,
                              width: 2,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide(
                              color: DertamColors.primaryDark,
                              width: 2,
                            ),
                          ),
                          fillColor: Colors.grey[50],
                          filled: true,
                          contentPadding: EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 16,
                          ),
                          suffixIcon: Padding(
                            padding: const EdgeInsets.only(
                              left: 8.0,
                              right: 4.0,
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                itemHeight: 60,
                                value: _selectedCurrency,
                                icon: Icon(
                                  Icons.arrow_drop_down,
                                  color: Colors.grey[600],
                                ),
                                items: _currencies.map((currency) {
                                  return DropdownMenuItem<String>(
                                    value: currency['code'],
                                    child: Text(
                                      ('${currency['code']} (${currency['symbol']})'),
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: DertamColors.black,
                                      ),
                                    ),
                                  );
                                }).toList(),
                                onChanged: (value) {
                                  if (value != null) {
                                    setState(() {
                                      _selectedCurrency = value;
                                      _updateDailyBudget();
                                    });
                                  }
                                },
                              ),
                            ),
                          ),
                        ),
                        onChanged: (value) => _updateDailyBudget(),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Daily Budget Field
                TextField(
                  controller: _dailyBudgetController,
                  keyboardType: TextInputType.number,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: DertamColors.black,
                  ),
                  decoration: InputDecoration(
                    labelText:
                        "Daily Budget ${_currencySymbol != '' ? '($_currencySymbol)' : ''}",
                    labelStyle: TextStyle(
                      color: Colors.grey[500],
                      fontSize: 14,
                      fontWeight: FontWeight.w400,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(
                        color: Colors.grey[200]!,
                        width: 2,
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(
                        color: Colors.grey[200]!,
                        width: 2,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(
                        color: DertamColors.primaryDark,
                        width: 2,
                      ),
                    ),
                    fillColor: Colors.grey[50],
                    filled: true,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 16,
                    ),
                  ),
                  onChanged: (value) {
                    setState(() {
                      _dailyBudgetManuallyEdited = true;
                    });
                  },
                ),

                // Reset button
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton.icon(
                    icon: Icon(
                      Icons.refresh,
                      color: Colors.grey[600],
                      size: 18,
                    ),
                    label: Text(
                      "Reset to auto-calculated",
                      style: TextStyle(color: Colors.grey[600], fontSize: 12),
                    ),
                    onPressed: () {
                      setState(() {
                        _dailyBudgetManuallyEdited = false;
                        _updateDailyBudget();
                      });
                    },
                  ),
                ),

                const SizedBox(height: 8),

                // Note
                Text(
                  "Note: Daily budget is automatically calculated but you can adjust it manually if needed.",
                  style: TextStyle(
                    color: Colors.grey[500],
                    fontSize: 12,
                    fontStyle: FontStyle.italic,
                  ),
                  textAlign: TextAlign.left,
                ),

                const SizedBox(height: 40),

                // Confirm Button
                DertamButton(
                  text: 'Confirm',
                  onPressed: _saveBudget,
                  backgroundColor: DertamColors.primaryDark,
                  width: double.infinity,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
