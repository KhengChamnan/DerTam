<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectHotelOwners
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        
        // If user is a hotel owner and trying to access admin-only routes, redirect them
        if ($user && $user->hasRole('hotel owner')) {
            $currentPath = $request->path();
            
            // List of admin-only paths that hotel owners shouldn't access
            $adminOnlyPaths = ['places', 'users', 'roles', 'hotels', 'dashboard'];
            
            foreach ($adminOnlyPaths as $adminPath) {
                if (str_starts_with($currentPath, $adminPath)) {
                    return redirect()->route('hotel-owner.dashboard');
                }
            }
        }
        
        return $next($request);
    }
}