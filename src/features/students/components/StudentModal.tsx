import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/shared/components/Modal';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import type { Student, StudentStatus } from '@/shared/types/models';

const studentSchema = z.object({
  id: z.string().min(1, 'El ID es obligatorio'),
  lastName: z.string().min(1, 'Los apellidos son obligatorios'),
  firstName: z.string().min(1, 'Los nombres son obligatorios'),
  status: z.enum(['Activo', 'Inactivo', 'Retirado']),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
  onSave: (data: Student) => void;
}

export function StudentModal({ isOpen, onClose, student, onSave }: StudentModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      id: '', lastName: '', firstName: '', status: 'Activo'
    }
  });

  useEffect(() => {
    if (student) {
      reset({
        id: student.id,
        lastName: student.lastName,
        firstName: student.firstName,
        status: student.status
      });
    } else {
      reset({ id: '', lastName: '', firstName: '', status: 'Activo' });
    }
  }, [student, isOpen, reset]);

  const onSubmit = (data: StudentFormValues) => {
    onSave({
      ...data,
      fullName: `${data.lastName} ${data.firstName}`.toUpperCase()
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={student ? 'Editar Estudiante' : 'Nuevo Estudiante'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input 
          label="ID (Senati)" 
          placeholder="Ej: 1537058" 
          {...register('id')} 
          error={errors.id?.message}
          disabled={!!student} // No se puede editar el ID si ya existe
        />
        <Input 
          label="Apellidos" 
          placeholder="Ej: AGÜERO BOTIQUIN" 
          {...register('lastName')} 
          error={errors.lastName?.message}
        />
        <Input 
          label="Nombres" 
          placeholder="Ej: PATRICK ANDERSSON" 
          {...register('firstName')} 
          error={errors.firstName?.message}
        />
        
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-medium text-gray-700">Estado</label>
          <select 
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('status')}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Retirado">Retirado</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Modal>
  );
}
