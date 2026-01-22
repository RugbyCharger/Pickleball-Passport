'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface NotificationToggleProps {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
  onChange: (enabled: boolean) => void;
}

export function NotificationToggle({
  id,
  label,
  description,
  enabled,
  disabled = false,
  onChange,
}: NotificationToggleProps) {
  return (
    <div className="flex items-start justify-between py-4 border-b last:border-b-0">
      <div className="flex-1 pr-4">
        <Label
          htmlFor={id}
          className={`font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}
        >
          {label}
        </Label>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <Switch
        id={id}
        checked={enabled}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
