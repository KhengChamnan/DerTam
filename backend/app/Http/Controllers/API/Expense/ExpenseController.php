<?php

namespace App\Http\Controllers\API\Expense;

use App\Http\Controllers\Controller;
use App\Models\Expense\Budget;
use App\Models\Expense\Expense;
use App\Models\Expense\ExpenseCategory;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

const EXCHANGE_RATE_KMR_TO_USD = 0.00024; // 1 KMR = 0.00024 USD
const EXCHANGE_RATE_USD_TO_KMR = 4166.67; // 1 USD = 4166.67 KMR

class ExpenseController extends Controller
{
    /**
     * Convert amount from one currency to another
     *
     * @param float $amount
     * @param string $fromCurrency
     * @param string $toCurrency
     * @return float
     */
    private function convertCurrency($amount, $fromCurrency, $toCurrency)
    {
        if ($fromCurrency === $toCurrency) {
            return $amount;
        }

        // Convert to USD first as base currency
        if ($fromCurrency === 'KMR') {
            $amountInUSD = $amount * EXCHANGE_RATE_KMR_TO_USD;
        } else {
            $amountInUSD = $amount;
        }

        // Convert from USD to target currency
        if ($toCurrency === 'KMR') {
            return $amountInUSD * EXCHANGE_RATE_USD_TO_KMR;
        } else {
            return $amountInUSD;
        }
    }

    /**
     * Get budget details with all its expenses for a specific trip
     *
     * @param int $tripId
     * @return JsonResponse
     */
    public function getBudgetDetails($tripId): JsonResponse
    {
        try {
            // Check if trip exists and belongs to authenticated user
            $trip = Trip::where('trip_id', $tripId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            // Get budget with expenses
            $budget = Budget::where('trip_id', $tripId)
                ->with(['expenses' => function ($query) {
                    $query->with('category')->orderBy('date', 'desc');
                }])
                ->firstOrFail();

            // Calculate totals
            $totalSpent = $budget->expenses()->sum('amount');
            $remainingBudget = $budget->total_budget - $totalSpent;

            return response()->json([
                'success' => true,
                'data' => [
                    'budget_id' => $budget->id,
                    'trip_id' => $budget->trip_id,
                    'total_budget' => (float) $budget->total_budget,
                    'currency' => $budget->currency,
                    'total_spent' => (float) $totalSpent,
                    'remaining_budget' => (float) $remainingBudget,
                    'description' => $budget->description,
                    'expenses' => $budget->expenses->map(function ($expense) {
                        return [
                            'id' => $expense->id,
                            'name' => $expense->name,
                            'amount' => (float) $expense->amount,
                            'date' => $expense->date instanceof \Carbon\Carbon ? $expense->date->format('Y-m-d') : $expense->date,
                            'description' => $expense->description,
                            'category' => [
                                'id' => $expense->category->id,
                                'name' => $expense->category->category_name,
                            ],
                        ];
                    }),
                    'created_at' => $budget->created_at,
                    'updated_at' => $budget->updated_at,
                ],
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Budget not found for this trip',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching budget details: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new budget for a trip and optionally add initial expenses
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function createBudget(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'trip_id' => 'required|integer|exists:trips,trip_id',
                'total_budget' => 'required|numeric|min:0',
                'currency' => 'required|string|in:USD,KMR',
                'description' => 'nullable|string|max:500',
                'expenses' => 'nullable|array',
                'expenses.*.name' => 'required_with:expenses|string|max:255',
                'expenses.*.amount' => 'required_with:expenses|numeric|min:0',
                'expenses.*.date' => 'required_with:expenses|date',
                'expenses.*.description' => 'nullable|string|max:500',
                'expenses.*.category_id' => 'required_with:expenses|integer|exists:expense_categories,id',
            ]);

            // Check if trip belongs to authenticated user
            $trip = Trip::where('trip_id', $validated['trip_id'])
                ->where('user_id', Auth::id())
                ->firstOrFail();

            // Check if budget already exists for this trip
            $existingBudget = Budget::where('trip_id', $validated['trip_id'])->first();
            if ($existingBudget) {
                return response()->json([
                    'success' => false,
                    'message' => 'A budget already exists for this trip. Use update endpoint to modify it.',
                ], 409);
            }

            DB::beginTransaction();

            // Create budget with currency
            $budget = Budget::create([
                'trip_id' => $validated['trip_id'],
                'total_budget' => $validated['total_budget'],
                'currency' => $validated['currency'],
                'description' => $validated['description'] ?? null,
            ]);

            $expenses = [];
            // Add expenses if provided
            if (!empty($validated['expenses'])) {
                foreach ($validated['expenses'] as $expenseData) {
                    // Convert expense amount to budget currency if needed
                    $amount = $expenseData['amount'];
                    
                    $expense = Expense::create([
                        'budget_id' => $budget->id,
                        'name' => $expenseData['name'],
                        'amount' => $amount,
                        'date' => $expenseData['date'],
                        'description' => $expenseData['description'] ?? null,
                        'category_id' => $expenseData['category_id'],
                    ]);
                    $expenses[] = $expense->load('category');
                }
            }

            DB::commit();

            $totalSpent = collect($expenses)->sum('amount');
            $remainingBudget = $budget->total_budget - $totalSpent;

            return response()->json([
                'success' => true,
                'message' => 'Budget created successfully',
                'data' => [
                    'budget_id' => $budget->id,
                    'trip_id' => $budget->trip_id,
                    'total_budget' => (float) $budget->total_budget,
                    'currency' => $budget->currency,
                    'total_spent' => (float) $totalSpent,
                    'remaining_budget' => (float) $remainingBudget,
                    'description' => $budget->description,
                    'expenses' => collect($expenses)->map(function ($expense) {
                        return [
                            'id' => $expense->id,
                            'name' => $expense->name,
                            'amount' => (float) $expense->amount,
                            'date' => $expense->date instanceof \Carbon\Carbon ? $expense->date->format('Y-m-d') : $expense->date,
                            'description' => $expense->description,
                            'category' => [
                                'id' => $expense->category->id,
                                'name' => $expense->category->category_name,
                            ],
                        ];
                    }),
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Trip not found',
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error creating budget: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Add a new expense to an existing budget
     *
     * @param Request $request
     * @param int $budgetId
     * @return JsonResponse
     */
    public function addExpense(Request $request, $budgetId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:0',
                'currency' => 'required|string|in:USD,KMR',
                'date' => 'required|date',
                'description' => 'nullable|string|max:500',
                'category_id' => 'required|integer|exists:expense_categories,id',
            ]);

            // Get budget and verify it belongs to user's trip
            $budget = Budget::with('trip')
                ->where('id', $budgetId)
                ->whereHas('trip', function ($query) {
                    $query->where('user_id', Auth::id());
                })
                ->firstOrFail();

            // Convert expense amount to budget currency if different
            $amountInBudgetCurrency = $validated['currency'] === $budget->currency 
                ? $validated['amount']
                : $this->convertCurrency($validated['amount'], $validated['currency'], $budget->currency);

            // Create expense
            $expense = Expense::create([
                'budget_id' => $budgetId,
                'amount' => $amountInBudgetCurrency,
                'date' => $validated['date'],
                'description' => $validated['description'] ?? null,
                'category_id' => $validated['category_id'],
            ]);

            $expense->load('category');

            return response()->json([
                'success' => true,
                'message' => 'Expense added successfully',
                'data' => [
                    'id' => $expense->id,
                    'amount' => (float) $expense->amount,
                    'currency' => $budget->currency,
                    'date' => $expense->date instanceof \Carbon\Carbon ? $expense->date->format('Y-m-d') : $expense->date,
                    'description' => $expense->description,
                    'category' => [
                        'id' => $expense->category->id,
                        'name' => $expense->category->category_name,
                    ],
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Budget not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error adding expense: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update an existing expense
     *
     * @param Request $request
     * @param int $expenseId
     * @return JsonResponse
     */
    public function updateExpense(Request $request, $expenseId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'amount' => 'sometimes|numeric|min:0',
                'date' => 'sometimes|date',
                'description' => 'nullable|string|max:500',
                'category_id' => 'sometimes|integer|exists:expense_categories,id',
            ]);

            // Get expense and verify it belongs to user's trip
            $expense = Expense::with(['budget.trip'])
                ->where('id', $expenseId)
                ->whereHas('budget.trip', function ($query) {
                    $query->where('user_id', Auth::id());
                })
                ->firstOrFail();

            // Update expense with only provided fields
            $expense->update($validated);
            $expense->load('category');

            return response()->json([
                'success' => true,
                'message' => 'Expense updated successfully',
                'data' => [
                    'id' => $expense->id,
                    'name' => $expense->name,
                    'amount' => (float) $expense->amount,
                    'date' => $expense->date instanceof \Carbon\Carbon ? $expense->date->format('Y-m-d') : $expense->dateformat('Y-m-d'),
                    'description' => $expense->description,
                    'category' => [
                        'id' => $expense->category->id,
                        'name' => $expense->category->category_name,
                    ],
                ],
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Expense not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating expense: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an expense
     *
     * @param int $expenseId
     * @return JsonResponse
     */
    public function deleteExpense($expenseId): JsonResponse
    {
        try {
            // Get expense and verify it belongs to user's trip
            $expense = Expense::with(['budget.trip'])
                ->where('id', $expenseId)
                ->whereHas('budget.trip', function ($query) {
                    $query->where('user_id', Auth::id());
                })
                ->firstOrFail();

            $expense->delete();

            return response()->json([
                'success' => true,
                'message' => 'Expense deleted successfully',
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Expense not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting expense: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update budget details
     *
     * @param Request $request
     * @param int $budgetId
     * @return JsonResponse
     */
    public function updateBudget(Request $request, $budgetId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'total_budget' => 'sometimes|numeric|min:0',
                'description' => 'nullable|string|max:500',
            ]);

            // Get budget and verify it belongs to user's trip
            $budget = Budget::with('trip')
                ->where('id', $budgetId)
                ->whereHas('trip', function ($query) {
                    $query->where('user_id', Auth::id());
                })
                ->firstOrFail();

            // Update budget with only provided fields
            $budget->update($validated);
            $budget->load(['expenses' => function ($query) {
                $query->with('category')->orderBy('date', 'desc');
            }]);

            $totalSpent = $budget->expenses()->sum('amount');
            $remainingBudget = $budget->total_budget - $totalSpent;

            return response()->json([
                'success' => true,
                'message' => 'Budget updated successfully',
                'data' => [
                    'budget_id' => $budget->id,
                    'trip_id' => $budget->trip_id,
                    'total_budget' => (float) $budget->total_budget,
                    'currency' => $budget->currency,
                    'total_spent' => (float) $totalSpent,
                    'remaining_budget' => (float) $remainingBudget,
                    'description' => $budget->description,
                    'expenses' => $budget->expenses->map(function ($expense) {
                        return [
                            'id' => $expense->id,
                            'name' => $expense->name,
                            'amount' => (float) $expense->amount,
                            'date' => $expense->date->format('Y-m-d'),
                            'description' => $expense->description,
                            'category' => [
                                'id' => $expense->category->id,
                                'name' => $expense->category->category_name,
                            ],
                        ];
                    }),
                ],
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Budget not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating budget: ' . $e->getMessage(),
            ], 500);
        }
    }
}
