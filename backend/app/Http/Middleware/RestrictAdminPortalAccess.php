<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RestrictAdminPortalAccess
{
    /**
     * Handle an incoming request.
     * 
     * This middleware prevents users without admin portal access permission from accessing the admin portal.
     * Users must have 'access admin panel' permission OR be a hotel owner to access the admin portal.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // If user is authenticated but doesn't have admin panel access permission AND is not a hotel owner
        if ($user && !$user->can('access admin panel') && !$user->hasRole('hotel owner')) {
            // Log them out from the admin portal
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Redirect to login with error message
            return redirect()->route('login')
                ->withErrors(['error' => 'You do not have permission to access the admin portal. Please use the mobile app or user web interface.']);
        }

        return $next($request);
    }
}
