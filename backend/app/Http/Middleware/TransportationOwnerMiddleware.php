<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Transportation;

class TransportationOwnerMiddleware
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
        
        // Super admin and admin can access everything
        if ($user->hasRole(['superadmin', 'admin'])) {
            return $next($request);
        }
        
        // Transportation owners can only access their own companies
        if ($user->hasRole('transportation owner')) {
            $companyId = $request->route('company_id') 
                      ?? $request->route('id') 
                      ?? $request->route('transportation');
            
            if ($companyId) {
                $company = Transportation::find($companyId);
                
                if (!$company || $company->owner_user_id !== $user->id) {
                    abort(403, 'You can only access your own transportation companies.');
                }
            }
            
            // For bus routes, verify through bus -> transportation relationship
            $busId = $request->route('bus_id');
            if ($busId) {
                $bus = \App\Models\Bus\Bus::with('transportation')->find($busId);
                
                if (!$bus || !$bus->transportation || $bus->transportation->owner_user_id !== $user->id) {
                    abort(403, 'You can only access buses from your own transportation companies.');
                }
            }
            
            // For schedule routes, verify through schedule -> bus -> transportation relationship
            $scheduleId = $request->route('schedule_id');
            if ($scheduleId) {
                $schedule = \App\Models\Bus\BusSchedule::with('bus.transportation')->find($scheduleId);
                
                if (!$schedule || !$schedule->bus || !$schedule->bus->transportation || 
                    $schedule->bus->transportation->owner_user_id !== $user->id) {
                    abort(403, 'You can only access schedules from your own transportation companies.');
                }
            }
        }
        
        return $next($request);
    }
}
