import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AdService } from '../../services/ad.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { AdSharingService } from '../../services/ad-sharing.service'; 

@Component({
  selector: 'app-add-advertisement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-advertisement.component.html',
  styleUrls: ['./add-advertisement.component.scss']
})
export class AddAdvertisementComponent implements OnInit, OnDestroy {
  adForm: FormGroup;
  parentCategories: Category[] = [];
  childCategories: Category[] = [];
  selectedParentCategory: string = '';
  selectedFiles: File[] = [];
  imageUrls: SafeUrl[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private adService: AdService,
    private categoryService: CategoryService,
    private authService: AuthService,
    public router: Router,
    private sanitizer: DomSanitizer,
    private adSharingService: AdSharingService 
  ) {
    this.adForm = this.createForm();
    console.log('🔐 Проверка авторизации при создании компонента:');
    console.log(' - Токен:', this.authService.getToken() ? '***' + this.authService.getToken()!.slice(-10) : 'отсутствует');
    console.log(' - UserId:', this.authService.getUserId() || 'отсутствует');
    console.log(' - UserLogin:', this.authService.getUserLogin() || 'отсутствует');
  }

  ngOnInit(): void {
    this.loadParentCategories();
    this.setupCategoryChangeListener();
  }

  ngOnDestroy(): void {
    this.cleanupImageUrls();
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(1000)]],
      cost: [0, [Validators.required, Validators.min(0), Validators.max(100000000)]],
      email: ['', [Validators.email]],
      phone: ['', [
        Validators.required, 
        Validators.minLength(10), // 10 цифр без +7
        Validators.pattern(/^\d{10}$/) 
      ]],
      location: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      parentCategoryId: ['', Validators.required],
      categoryId: ['', Validators.required]
    });
  }


  // Форматирование телефонного номера
  formatPhoneNumber(value: string): string {
    // Удаляем все нецифровые символы, кроме плюса в начале
    const cleaned = value.replace(/\D/g, '');
    
    // Если номер начинается с 7 или 8, убираем первую цифру (префикс +7 фиксированный)
    let RussianNumber = cleaned;
    if (RussianNumber.startsWith('7') || RussianNumber.startsWith('8')) {
      RussianNumber = RussianNumber.substring(1);
    }
    
    // Ограничиваем длину (10 цифр после +7)
    const limited = RussianNumber.substring(0, 10);
    
    if (limited.length === 0) {
      return '';
    }
    
    // Форматируем в вид: (999) 123-45-67
    const match = limited.match(/^(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    if (match) {
      let formatted = '';
      if (match[1]) formatted += `(${match[1]}`;
      if (match[2]) formatted += `) ${match[2]}`;
      if (match[3]) formatted += `-${match[3]}`;
      if (match[4]) formatted += `-${match[4]}`;
      
      return formatted;
    }
    
    return limited;
  }

  // Обработчик ввода
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart;
    
    const formatted = this.formatPhoneNumber(input.value);
    
    input.value = formatted;
    
    const newCursorPosition = this.calculateNewCursorPosition(input.value, cursorPosition || 0);
    input.setSelectionRange(newCursorPosition, newCursorPosition);
    
    const cleaned = this.cleanPhoneNumber(formatted);
    this.adForm.patchValue({ phone: cleaned });
  }

  onPhoneKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart;
    
    if ([
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ].includes(event.key)) {
      return;
    }
    
    if (!/^\d$/.test(event.key) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }
    
    if (event.key === 'Backspace' && cursorPosition) {
      const value = input.value;
      const isAtSpecialPosition = [
        1, 2, 6, 7, 11, 12, 15, 16
      ].includes(cursorPosition);
      
      if (isAtSpecialPosition && value[cursorPosition - 1]?.match(/[\(\)\-\s]/)) {
        setTimeout(() => {
          input.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
        });
      }
    }
  }

  calculateNewCursorPosition(newValue: string, oldCursorPosition: number): number {
    if (oldCursorPosition === 0) return 0;
    
    const specialChars = ['(', ')', ' ', '-'];
    let newPosition = oldCursorPosition;
    
    for (let i = 0; i < Math.min(oldCursorPosition, newValue.length); i++) {
      if (specialChars.includes(newValue[i])) {
        newPosition++;
      }
    }
    
    return Math.min(newPosition, newValue.length);
  }

  // Очистка номера для отправки на бэкенд
  cleanPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned; 
  }

  // Получение очищенного номера телефона для отправки
  getCleanPhoneForBackend(): string {
    const phoneValue = this.adForm.get('phone')?.value;
    const cleaned = this.cleanPhoneNumber(phoneValue);
    return '+7' + cleaned; 
  }


  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      const newFiles = Array.from(files);
      newFiles.forEach(file => {
        const blobUrl = URL.createObjectURL(file);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(blobUrl);
        this.imageUrls.push(safeUrl);
      });
      this.selectedFiles = [...this.selectedFiles, ...newFiles];
      event.target.value = '';
    }
  }

  removeImage(index: number): void {
    const url = this.imageUrls[index];
    if (typeof url === 'string') {
      URL.revokeObjectURL(url);
    }
    this.selectedFiles.splice(index, 1);
    this.imageUrls.splice(index, 1);
  }

  onImageError(event: any, index: number): void {
    console.error(' Ошибка загрузки изображения:', event);
    event.target.style.display = 'none';
    const imagePreview = event.target.closest('.image-preview');
    if (imagePreview) {
      const errorElement = document.createElement('div');
      errorElement.className = 'image-error';
      errorElement.innerHTML = `
        <div style="text-align: center; color: #dc3545; font-size: 12px; padding: 10px;">
          <div> Ошибка загрузки</div>
          <div>${this.selectedFiles[index]?.name || 'Изображение'}</div>
        </div>
      `;
      imagePreview.appendChild(errorElement);
    }
  }

  private cleanupImageUrls(): void {
    this.imageUrls.forEach(url => {
      if (typeof url === 'string') URL.revokeObjectURL(url);
    });
    this.imageUrls = [];
    this.selectedFiles = [];
  }

  loadParentCategories(): void {
    this.categoryService.getParentCategories().subscribe({
      next: (categories: Category[]) => {
        this.parentCategories = categories;
      },
      error: (error: any) => {
        console.error('Ошибка загрузки категорий:', error);
        this.errorMessage = 'Ошибка загрузки категорий';
      }
    });
  }

  loadChildCategories(parentId: string): void {
    this.categoryService.getChildCategories(parentId).subscribe({
      next: (categories: Category[]) => {
        this.childCategories = categories;
        if (categories.length === 0) {
          this.adForm.patchValue({ categoryId: parentId });
        } else {
          this.adForm.patchValue({ categoryId: '' });
        }
      },
      error: (error: any) => {
        console.error(' Ошибка загрузки дочерних категорий:', error);
        this.childCategories = [];
        this.adForm.patchValue({ categoryId: this.selectedParentCategory });
      }
    });
  }

  setupCategoryChangeListener(): void {
    this.adForm.get('parentCategoryId')?.valueChanges.subscribe(parentId => {
      if (parentId) {
        this.selectedParentCategory = parentId;
        this.loadChildCategories(parentId);
      } else {
        this.childCategories = [];
        this.selectedParentCategory = '';
        this.adForm.patchValue({ categoryId: '' });
      }
    });
  }

  getFinalCategoryId(): string {
    const parentId = this.adForm.get('parentCategoryId')?.value;
    const categoryId = this.adForm.get('categoryId')?.value;
    return categoryId || parentId;
  }

  onSubmit(): void {
    console.log('🔐 Проверка авторизации перед отправкой:');
    console.log(' - Токен:', this.authService.getToken() ? '***' + this.authService.getToken()!.slice(-10) : 'отсутствует');
    console.log(' - UserId:', this.authService.getUserId() || 'отсутствует');
    console.log(' - UserLogin:', this.authService.getUserLogin() || 'отсутствует');

    if (this.adForm.valid) {
      const finalCategoryId = this.getFinalCategoryId();
      if (!finalCategoryId) {
        this.errorMessage = 'Выберите категорию';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = new FormData();
      const formValue = this.adForm.value;
      
      console.log('📤 Отправка объявления:', {
        name: formValue.name,
        cost: formValue.cost,
        phone: formValue.phone,
        location: formValue.location,
        categoryId: finalCategoryId
      });

      formData.append('Name', formValue.name);
      formData.append('Description', formValue.description || '');
      formData.append('Cost', formValue.cost.toString());
      
      if (formValue.email) {
        formData.append('Email', formValue.email);
      }
      
      // ИСПОЛЬЗУЕМ ОЧИЩЕННЫЙ НОМЕР ТЕЛЕФОНА
      formData.append('Phone', this.getCleanPhoneForBackend());
      formData.append('Location', formValue.location);
      formData.append('CategoryId', finalCategoryId);

      this.selectedFiles.forEach(file => {
        console.log('Добавление файла:', file.name, file.type, file.size);
        formData.append('Images', file, file.name);
      });

      console.log('FormData содержимое:');
      for (let [key, value] of (formData as any).entries()) {
        if (value instanceof File) {
          console.log(`   ${key}:`, value.name, value.type, value.size);
        } else {
          console.log(`   ${key}:`, value);
        }
      }

      this.adService.createAd(formData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          console.log('Объявление создано:', response);
          this.successMessage = 'Объявление успешно создано!';
          
          this.adSharingService.notifyNewAd(response);
          
          this.adForm.reset();
          this.cleanupImageUrls();
          this.childCategories = [];
          this.selectedParentCategory = '';
          setTimeout(() => {
            this.router.navigate(['/ads']);
          }, 2000);
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Ошибка создания объявления:', error);
          
          if (error.status === 401) {
            this.errorMessage = 'Необходимо авторизоваться. Переходим на страницу входа...';
            setTimeout(() => this.router.navigate(['/login']), 2000);
          } else if (error.status === 400) {
            this.errorMessage = 'Неверные данные. Проверьте заполнение полей.';
            console.error('Детали ошибки 400:', error.error);
          } else if (error.status === 404) {
            this.errorMessage = 'Endpoint не найден. Проверьте подключение к серверу.';
            console.error('Детали ошибки 404:', error.url);
          } else if (error.status === 422) {
            this.errorMessage = error.error?.userMessage || 'Произошёл конфликт бизнес-логики';
            console.error('Детали ошибки 422:', error.error);
          } else {
            this.errorMessage = error.error?.userMessage || 'Ошибка при создании объявления';
          }
        }
      });
    } else {
      this.markFormGroupTouched();
      this.errorMessage = 'Заполните все обязательные поля правильно';
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.adForm.controls).forEach(key => {
      this.adForm.get(key)?.markAsTouched();
    });
  }

  onCancel(): void {
    this.cleanupImageUrls();
    this.router.navigate(['/ads']);
  }

  get name() {
    return this.adForm.get('name');
  }

  get description() {
    return this.adForm.get('description');
  }

  get cost() {
    return this.adForm.get('cost');
  }

  get email() {
    return this.adForm.get('email');
  }

  get phone() {
    return this.adForm.get('phone');
  }

  get location() {
    return this.adForm.get('location');
  }

  get parentCategoryId() {
    return this.adForm.get('parentCategoryId');
  }

  get categoryId() {
    return this.adForm.get('categoryId');
  }
}