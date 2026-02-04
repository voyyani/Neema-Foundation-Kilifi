// Donation Goal Configuration Component
// Configure fundraising goals, currency, deadlines, and quick donation amounts

import { useState } from 'react';
import { DollarSign, Calendar, Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface DonationGoalConfigProps {
  goal?: number;
  current?: number;
  currency?: string;
  deadline?: string;
  onChange: (data: {
    donation_goal?: number;
    donation_current?: number;
    donation_currency?: string;
    donation_deadline?: string;
  }) => void;
}

const CURRENCIES = [
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
];

const PRESET_GOALS = [
  { amount: 10000, label: 'KSh 10K' },
  { amount: 50000, label: 'KSh 50K' },
  { amount: 100000, label: 'KSh 100K' },
  { amount: 500000, label: 'KSh 500K' },
  { amount: 1000000, label: 'KSh 1M' },
];

export default function DonationGoalConfig({
  goal,
  current = 0,
  currency = 'KES',
  deadline,
  onChange,
}: DonationGoalConfigProps) {
  const [isEnabled, setIsEnabled] = useState(!!goal);
  
  const progressPercentage = goal ? Math.min(100, Math.round((current / goal) * 100)) : 0;
  const remaining = goal ? Math.max(0, goal - current) : 0;
  
  // Calculate days until deadline
  const daysUntilDeadline = deadline
    ? Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || currency;

  const handleToggle = () => {
    if (isEnabled) {
      // Disable - clear values
      onChange({
        donation_goal: undefined,
        donation_current: undefined,
        donation_currency: undefined,
        donation_deadline: undefined,
      });
    }
    setIsEnabled(!isEnabled);
  };

  const handlePresetGoal = (amount: number) => {
    onChange({
      donation_goal: amount,
      donation_current: current,
      donation_currency: currency,
      donation_deadline: deadline,
    });
  };

  return (
    <div className="space-y-4">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Fundraising Goal</h4>
            <p className="text-sm text-gray-500">Enable to show donation progress on program page</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isEnabled ? 'bg-green-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {isEnabled && (
        <div className="space-y-6 pl-1">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => onChange({
                    donation_goal: goal,
                    donation_current: current,
                    donation_currency: curr.code,
                    donation_deadline: deadline,
                  })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    currency === curr.code
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {curr.symbol} {curr.code}
                </button>
              ))}
            </div>
          </div>

          {/* Goal Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={goal || ''}
                onChange={(e) => onChange({
                  donation_goal: e.target.value ? parseFloat(e.target.value) : undefined,
                  donation_current: current,
                  donation_currency: currency,
                  donation_deadline: deadline,
                })}
                placeholder="Enter goal amount"
                min="0"
                step="100"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>
            
            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              {PRESET_GOALS.map((preset) => (
                <button
                  key={preset.amount}
                  type="button"
                  onClick={() => handlePresetGoal(preset.amount)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    goal === preset.amount
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Current Amount (for tracking) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Raised So Far
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={current || ''}
                onChange={(e) => onChange({
                  donation_goal: goal,
                  donation_current: e.target.value ? parseFloat(e.target.value) : 0,
                  donation_currency: currency,
                  donation_deadline: deadline,
                })}
                placeholder="0"
                min="0"
                step="100"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Update this as donations come in, or connect to your payment provider
            </p>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={deadline?.split('T')[0] || ''}
                onChange={(e) => onChange({
                  donation_goal: goal,
                  donation_current: current,
                  donation_currency: currency,
                  donation_deadline: e.target.value || undefined,
                })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {daysUntilDeadline} days remaining
              </p>
            )}
            {daysUntilDeadline !== null && daysUntilDeadline <= 0 && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Deadline has passed
              </p>
            )}
          </div>

          {/* Progress Preview */}
          {goal && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Progress Preview</h5>
              
              {/* Progress bar */}
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow">
                    {progressPercentage}%
                  </span>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  <span className="font-semibold text-green-700">
                    {currencySymbol}{current.toLocaleString()}
                  </span>{' '}
                  raised
                </span>
                <span className="text-gray-600">
                  Goal: {currencySymbol}{goal.toLocaleString()}
                </span>
              </div>
              
              {remaining > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {currencySymbol}{remaining.toLocaleString()} more needed to reach the goal
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
