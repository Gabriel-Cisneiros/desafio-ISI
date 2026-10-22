'use client';

import type { ReactNode } from 'react';
import { LoaderCircle, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  confirmLabel: string;
  confirmIcon?: LucideIcon;
  variant?: 'default' | 'destructive';
  pending?: boolean;
  onConfirm: () => void;
  className?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel,
  confirmIcon: ConfirmIcon,
  variant = 'default',
  pending = false,
  onConfirm,
  className,
}: ConfirmDialogProps) {
  const Icon = pending ? LoaderCircle : ConfirmIcon;

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className={className} showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button variant={variant} disabled={pending} onClick={onConfirm}>
            {Icon && (
              <Icon
                data-icon="inline-start"
                className={pending ? 'animate-spin' : undefined}
              />
            )}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
