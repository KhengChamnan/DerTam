export interface Budget {
  id: number;
  tripId: number;
  totalBudget: number;
  currency: string;
  expenses: Expense[];
  remaining: number;
}

export interface Expense {
  id: number;
  budgetId: number;
  category: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface CreateBudgetData {
  tripId: number;
  totalBudget: number;
  currency: string;
}

export interface AddExpenseData {
  budgetId: number;
  category: string;
  amount: number;
  description: string;
  date: string;
}

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Get budget by trip ID
export async function getBudgetByTripId(tripId: string): Promise<Budget> {
  const response = await fetch(`${API_BASE_URL}/budgets/trip/${tripId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch budget');
  return response.json();
}

// Create budget
export async function createBudget(data: CreateBudgetData): Promise<Budget> {
  const response = await fetch(`${API_BASE_URL}/budgets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create budget');
  return response.json();
}

// Add expense
export async function addExpense(data: AddExpenseData): Promise<Expense> {
  const response = await fetch(`${API_BASE_URL}/budgets/${data.budgetId}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add expense');
  return response.json();
}

// Delete expense
export async function deleteExpense(budgetId: number, expenseId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/budgets/${budgetId}/expenses/${expenseId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) throw new Error('Failed to delete expense');
}