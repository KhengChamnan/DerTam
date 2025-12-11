import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, DollarSign, TrendingUp, Edit2, Trash2, Calendar,Hotel,UtensilsCrossed,Car,Ticket,ShoppingBag,Wallet } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Expense {
  id: string;
  budgetId: string;
  categoryId: number;
  categoryName: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

interface Budget {
  id: string;
  tripId: string;
  userId: string;
  totalBudget: number;
  currency: string;
  expenses: Expense[];
  createdAt: string;
  updatedAt: string;
}

interface ExpenseCategory {
  id: number;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

interface BudgetPageProps {
  tripId: string;
}

const expenseCategories: ExpenseCategory[] = [
  { id: 1, name: 'Accommodation', icon: Hotel, color: '#3B82F6' },
  { id: 2, name: 'Food', icon: UtensilsCrossed, color: '#EF4444' },
  { id: 3, name: 'Transportation', icon: Car, color: '#10B981' },
  { id: 4, name: 'Activities', icon: Ticket, color: '#F59E0B' },
  { id: 5, name: 'Shopping', icon: ShoppingBag, color: '#8B5CF6' },
  { id: 6, name: 'Other', icon: Wallet, color: '#6B7280' },
];

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
];

export default function BudgetPage({ tripId }: BudgetPageProps) {
  const navigate = useNavigate();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSetBudget, setShowSetBudget] = useState(false);

  // Form states
  const [totalBudget, setTotalBudget] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState(1);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadBudget();
  }, [tripId]);

  const loadBudget = () => {
    try {
      const savedBudgets = localStorage.getItem('budgets');
      if (savedBudgets) {
        const budgets: Budget[] = JSON.parse(savedBudgets);
        const foundBudget = budgets.find((b) => b.tripId === tripId);
        if (foundBudget) {
          setBudget(foundBudget);
          setTotalBudget(foundBudget.totalBudget.toString());
          setSelectedCurrency(foundBudget.currency);
        } else {
          setShowSetBudget(true);
        }
      } else {
        setShowSetBudget(true);
      }
    } catch (error) {
      console.error('Error loading budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = () => {
    if (!totalBudget || parseFloat(totalBudget) <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    const newBudget: Budget = {
      id: `budget_${Date.now()}`,
      tripId,
      userId: 'current_user',
      totalBudget: parseFloat(totalBudget),
      currency: selectedCurrency,
      expenses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const savedBudgets = localStorage.getItem('budgets');
      const budgets = savedBudgets ? JSON.parse(savedBudgets) : [];
      budgets.push(newBudget);
      localStorage.setItem('budgets', JSON.stringify(budgets));
      setBudget(newBudget);
      setShowSetBudget(false);
    } catch (error) {
      console.error('Error creating budget:', error);
      alert('Failed to create budget. Please try again.');
    }
  };

  const handleAddExpense = () => {
    if (!budget) return;
    if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!expenseDescription.trim()) {
      alert('Please enter a description');
      return;
    }

    const category = expenseCategories.find((c) => c.id === expenseCategory);
    const newExpense: Expense = {
      id: `expense_${Date.now()}`,
      budgetId: budget.id,
      categoryId: expenseCategory,
      categoryName: category?.name || 'Other',
      amount: parseFloat(expenseAmount),
      description: expenseDescription,
      date: expenseDate,
      createdAt: new Date().toISOString(),
    };

    const updatedBudget = {
      ...budget,
      expenses: [...budget.expenses, newExpense],
      updatedAt: new Date().toISOString(),
    };

    try {
      const savedBudgets = localStorage.getItem('budgets');
      const budgets: Budget[] = savedBudgets ? JSON.parse(savedBudgets) : [];
      const budgetIndex = budgets.findIndex((b) => b.id === budget.id);
      if (budgetIndex !== -1) {
        budgets[budgetIndex] = updatedBudget;
        localStorage.setItem('budgets', JSON.stringify(budgets));
        setBudget(updatedBudget);
        setShowAddExpense(false);
        setExpenseAmount('');
        setExpenseDescription('');
        setExpenseCategory(1);
        setExpenseDate(new Date().toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (!budget) return;
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    const updatedBudget = {
      ...budget,
      expenses: budget.expenses.filter((e) => e.id !== expenseId),
      updatedAt: new Date().toISOString(),
    };

    try {
      const savedBudgets = localStorage.getItem('budgets');
      const budgets: Budget[] = savedBudgets ? JSON.parse(savedBudgets) : [];
      const budgetIndex = budgets.findIndex((b) => b.id === budget.id);
      if (budgetIndex !== -1) {
        budgets[budgetIndex] = updatedBudget;
        localStorage.setItem('budgets', JSON.stringify(budgets));
        setBudget(updatedBudget);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const getTotalExpenses = () => {
    return budget?.expenses.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  };

  const getRemainingBudget = () => {
    return (budget?.totalBudget || 0) - getTotalExpenses();
  };

  const getBudgetPercentage = () => {
    if (!budget?.totalBudget) return 0;
    return (getTotalExpenses() / budget.totalBudget) * 100;
  };

  const getCategoryExpenses = (categoryId: number) => {
    return (
      budget?.expenses
        .filter((e) => e.categoryId === categoryId)
        .reduce((sum, e) => sum + e.amount, 0) || 0
    );
  };

  const formatCurrency = (amount: number) => {
    const currency = currencies.find((c) => c.code === (budget?.currency || 'USD'));
    return `${currency?.symbol}${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Add this helper function to get the currency symbol component
  const getCurrencyDisplay = (currencyCode: string) => {
    const currency = currencies.find((c) => c.code === currencyCode);
    return currency?.symbol || '$';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
       
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#01005B] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading budget...</p>
          </div>
        </div>
      </div>
    );
  }

  // Set Budget Modal
  if (showSetBudget) {
    return (
      <div className="min-h-screen bg-gray-50">
     
      <div className="max-w-2xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Set Your Budget</h2>

          {/* Currency Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B]/20 focus:border-[#01005B]"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>

          {/* Budget Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium text-lg">
                {getCurrencyDisplay(selectedCurrency)}
              </span>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B]/20 focus:border-[#01005B]"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBudget}
              className="flex-1 py-3 rounded-lg text-white font-medium transition-all shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#01005B' }}
            >
              Create Budget
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  }

  const remaining = getRemainingBudget();
  const percentage = getBudgetPercentage();

  return (
    <div className="min-h-screen bg-gray-50">
  

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back to Trip
          </button>
          <button
            onClick={() => setShowSetBudget(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
          >
            <Edit2 size={16} />
            Edit Budget
          </button>
        </div>

        {/* Budget Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Budget */}
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Total Budget</p>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(budget?.totalBudget || 0)}</p>
            </div>

            {/* Spent */}
            <div className="text-center p-6 bg-red-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Spent</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(getTotalExpenses())}</p>
            </div>

            {/* Remaining */}
            <div className={`text-center p-6 rounded-xl ${remaining >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-sm text-gray-600 mb-2">Remaining</p>
              <p className={`text-3xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Budget Usage</span>
              <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>

          {percentage > 100 && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <TrendingUp size={16} />
              <span>You've exceeded your budget by {formatCurrency(Math.abs(remaining))}</span>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold mb-6">Expenses by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {expenseCategories.map((category) => {
              const amount = getCategoryExpenses(category.id);
              const IconComponent = category.icon;
              return (
                <div
                  key={category.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <IconComponent size={24} style={{ color: category.color }} />
                  </div>
                  <p className="text-xs text-gray-600 text-center mb-1">{category.name}</p>
                  <p className="text-sm font-bold text-center" style={{ color: category.color }}>
                    {formatCurrency(amount)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Expense History</h3>
            <button
              onClick={() => setShowAddExpense(true)}
              className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-all"
              style={{ backgroundColor: '#01005B' }}
            >
              <Plus size={20} />
              Add Expense
            </button>
          </div>

          {budget?.expenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <DollarSign size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">No expenses recorded yet</p>
              <button
                onClick={() => setShowAddExpense(true)}
                className="px-6 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-all"
                style={{ backgroundColor: '#01005B' }}
              >
                Add Your First Expense
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {budget.expenses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((expense) => {
                  const category = expenseCategories.find((c) => c.id === expense.categoryId);
                  const IconComponent = category?.icon || Wallet;
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${category?.color}20` }}
                        >
                          <IconComponent size={24} style={{ color: category?.color }} />
                        </div>
                        <div>
                          <h4 className="font-medium">{expense.description}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span>{expense.categoryName}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(expense.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold" style={{ color: category?.color }}>
                          {formatCurrency(expense.amount)}
                        </p>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Add Expense</h3>
                <button
                  onClick={() => setShowAddExpense(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Category Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {expenseCategories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setExpenseCategory(category.id)}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          expenseCategory === category.id
                            ? 'border-[#01005B] bg-[#01005B]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <IconComponent size={20} style={{ color: category.color }} />
                        </div>
                        <p className="text-xs">{category.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium text-lg">
                    {getCurrencyDisplay(budget?.currency || 'USD')}
                  </span>
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B]/20 focus:border-[#01005B]"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="What did you spend on?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B]/20 focus:border-[#01005B]"
                />
              </div>

              {/* Date */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01005B]/20 focus:border-[#01005B]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddExpense(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExpense}
                  className="flex-1 py-3 rounded-lg text-white font-medium transition-all shadow-md hover:shadow-lg"
                  style={{ backgroundColor: '#01005B' }}
                >
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}