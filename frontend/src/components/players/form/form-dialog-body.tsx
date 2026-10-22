'use client';

import type { ReactNode } from 'react';
import { Form, useFormikContext } from 'formik';
import { LoaderCircle } from 'lucide-react';
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
  pending: boolean;
  onCancel: () => void;
  note?: ReactNode;
  children: ReactNode;
}

export function FormDialogBody({
  title,
  description,
  submitLabel,
  pending,
  onCancel,
  note,
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
          {pending && (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          )}
          {submitLabel}
        </Button>
      </DialogFooter>
    </Form>
  );
}
