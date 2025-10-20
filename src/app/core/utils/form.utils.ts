import { FormGroup } from '@angular/forms';

export const markFormGroupTouched = (form: FormGroup): void => {
  Object.keys(form.controls).forEach(key => {
    const control = form.get(key);
    control?.markAsTouched();
  });
};