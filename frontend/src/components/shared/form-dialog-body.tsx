'use client';

import type { ReactNode } from 'react';
import { Form, useFormikContext } from 'formik';
import { LoaderCircle, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FormDialogBodyProps {
  title: string;
  description: string;
  submitLabel: string;
  submitIcon?: LucideIcon;
  pending: boolean;
  onCancel: () => void;
  note?: ReactNode;
  alert?: ReactNode;
  children: ReactNode;
}

export function FormDialogBody({
  title,
  description,
  submitLabel,
  submitIcon: SubmitIcon,
  pending,
  onCancel,
  note,
  alert,
  children,
}: FormDialogBodyProps) {
  const { submitCount, errors } = useFormikContext();
  const invalid = submitCount > 0 && Object.keys(errors).length > 0;

  return (
    <Form noValidate className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          {invalid ? 'Corrija os campos destacados para salvar.' : description}
        </DialogDescription>
      </DialogHeader>
      {alert}
      {children}
      <DialogFooter className="items-center">
        {note && <div className="mr-auto">{note}</div>}
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            SubmitIcon && <SubmitIcon data-icon="inline-start" />
          )}
          {submitLabel}
        </Button>
      </DialogFooter>
    </Form>
  );
}
