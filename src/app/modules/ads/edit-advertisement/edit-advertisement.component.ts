import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AdService } from '../../../core/services/ad.service';
import {
  Category,
  CategoryService,
} from '../../../core/services/category.service';
import { Ad } from '../../../core/models/ad.model';

@Component({
  selector: 'app-edit-advertisement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-advertisement.component.html',
  styleUrls: ['./edit-advertisement.component.scss'],
})
export class EditAdvertisementComponent implements OnInit, OnDestroy {
  adForm: FormGroup;
  advertisement: Ad | null = null;
  parentCategories: Category[] = [];
  childCategories: Category[] = [];
  selectedParentCategory: string = '';
  selectedFiles: File[] = [];
  imageUrls: SafeUrl[] = [];
  existingImageUrls: string[] = [];
  imagesToDelete: string[] = [];
  adId: string = '';
  isLoading = false;
  isLoadingAd = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private adService: AdService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    this.adForm = this.createForm();
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

  ngOnInit(): void {
    this.adId = this.route.snapshot.paramMap.get('id') || '';

    if (this.adId) {
      this.loadAdvertisement();
      this.loadParentCategories();
      this.setupCategoryChangeListener();
    } else {
      this.errorMessage = 'ID объявления не указан';
      this.isLoadingAd = false;
    }
  }

  ngOnDestroy(): void {
    this.cleanupImageUrls();
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      description: ['', [Validators.maxLength(1000)]],
      cost: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100000000)],
      ],
      email: ['', [Validators.email]],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.pattern(/^\d{10}$/),
        ],
      ],
      location: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200),
        ],
      ],
      parentCategoryId: ['', Validators.required],
      categoryId: [''],
    });
  }

  loadAdvertisement(): void {
    this.isLoadingAd = true;
    this.errorMessage = '';

    this.adService.getAdById(this.adId).subscribe({
      next: (ad: Ad) => {
        this.isLoadingAd = false;
        this.advertisement = ad;
        this.populateForm(ad);
        this.loadExistingImages(ad);
      },
      error: (error: any) => {
        this.isLoadingAd = false;

        if (error.status === 404) {
          this.errorMessage = 'Объявление не найдено';
        } else if (error.status === 403) {
          this.errorMessage = 'Нет прав для редактирования этого объявления';
        } else {
          this.errorMessage = 'Ошибка загрузки объявления';
        }
      },
    });
  }

  populateForm(ad: Ad): void {
    const parentCategoryId = ad.category?.parentId || ad.category?.id || '';

    this.adForm.patchValue({
      name: ad.name,
      description: ad.description || '',
      cost: ad.cost,
      email: ad.email || '',
      phone: this.cleanPhoneForForm(ad.phone || ''),
      location: ad.location,
      parentCategoryId: parentCategoryId,
      categoryId: ad.category?.id || '',
    });

    if (parentCategoryId) {
      this.selectedParentCategory = parentCategoryId;
      this.loadChildCategories(parentCategoryId);
    }
  }

  cleanPhoneForForm(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('7')) {
      cleaned = cleaned.substring(1);
    }
    return cleaned.substring(0, 10);
  }

  loadExistingImages(ad: Ad): void {
    if (ad.imagesIds && ad.imagesIds.length > 0) {
      this.existingImageUrls = this.adService.getAllImageUrls(ad);
    }
  }

  loadParentCategories(): void {
    this.categoryService.getParentCategories().subscribe({
      next: (categories: Category[]) => {
        this.parentCategories = categories;
      },
      error: (error: any) => {
        this.errorMessage = 'Ошибка загрузки категорий';
      },
    });
  }

  loadChildCategories(parentId: string): void {
    this.categoryService.getChildCategories(parentId).subscribe({
      next: (categories: Category[]) => {
        this.childCategories = categories;
        if (categories.length === 0) {
          this.adForm.patchValue({ categoryId: parentId });
        }
      },
      error: (error: any) => {
        this.childCategories = [];
        this.adForm.patchValue({ categoryId: parentId });
      },
    });
  }

  setupCategoryChangeListener(): void {
    this.adForm.get('parentCategoryId')?.valueChanges.subscribe((parentId) => {
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

  formatPhoneNumber(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    let RussianNumber = cleaned;
    if (RussianNumber.startsWith('7') || RussianNumber.startsWith('8')) {
      RussianNumber = RussianNumber.substring(1);
    }
    const limited = RussianNumber.substring(0, 10);

    if (limited.length === 0) return '';

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

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart;
    const formatted = this.formatPhoneNumber(input.value);
    input.value = formatted;

    const newCursorPosition = this.calculateNewCursorPosition(
      input.value,
      cursorPosition || 0
    );
    input.setSelectionRange(newCursorPosition, newCursorPosition);

    const cleaned = this.cleanPhoneNumber(formatted);
    this.adForm.patchValue({ phone: cleaned });
  }

  onPhoneKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart;

    if (
      [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
      ].includes(event.key)
    ) {
      return;
    }

    if (!/^\d$/.test(event.key) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }

    if (event.key === 'Backspace' && cursorPosition) {
      const value = input.value;
      const isAtSpecialPosition = [1, 2, 6, 7, 11, 12, 15, 16].includes(
        cursorPosition
      );
      if (
        isAtSpecialPosition &&
        value[cursorPosition - 1]?.match(/[\(\)\-\s]/)
      ) {
        setTimeout(() => {
          input.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
        });
      }
    }
  }

  calculateNewCursorPosition(
    newValue: string,
    oldCursorPosition: number
  ): number {
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

  cleanPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned;
  }

  getCleanPhoneForBackend(): string {
    const phoneValue = this.adForm.get('phone')?.value;
    const cleaned = this.cleanPhoneNumber(phoneValue);
    return '+7' + cleaned;
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      const newFiles = Array.from(files);
      newFiles.forEach((file) => {
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

  removeExistingImage(index: number): void {
    const imageId = this.advertisement?.imagesIds?.[index];
    if (imageId) {
      this.imagesToDelete.push(imageId);
      this.existingImageUrls.splice(index, 1);
    }
  }

  onImageError(event: any, index: number): void {
    event.target.style.display = 'none';
    const imagePreview = event.target.closest('.image-preview');
    if (imagePreview) {
      const errorElement = document.createElement('div');
      errorElement.className = 'image-error';
      errorElement.innerHTML = `
        <div style="text-align: center; color: #dc3545; font-size: 12px; padding: 10px;">
          <div>Ошибка загрузки</div>
          <div>Изображение ${index + 1}</div>
        </div>
      `;
      imagePreview.appendChild(errorElement);
    }
  }

  onSubmit(): void {
    if (this.adForm.valid && this.advertisement) {
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

      formData.append('Name', formValue.name);
      formData.append('Description', formValue.description || '');
      formData.append('Cost', formValue.cost.toString());

      if (formValue.email) {
        formData.append('Email', formValue.email);
      }

      formData.append('Phone', this.getCleanPhoneForBackend());
      formData.append('Location', formValue.location);
      formData.append('CategoryId', finalCategoryId);

      this.selectedFiles.forEach((file) => {
        formData.append('Images', file, file.name);
      });

      if (this.imagesToDelete.length > 0) {
        this.imagesToDelete.forEach((imageId) => {
          formData.append('ImagesToDelete', imageId);
        });
      }

      this.adService.updateAdWithFormData(this.adId, formData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = 'Объявление успешно обновлено!';

          setTimeout(() => {
            this.router.navigate(['/ad', this.adId]);
          }, 2000);
        },
        error: (error: any) => {
          this.isLoading = false;

          if (error.status === 401) {
            this.errorMessage = 'Необходимо авторизоваться';
          } else if (error.status === 403) {
            this.errorMessage = 'Нет прав для редактирования этого объявления';
          } else if (error.status === 404) {
            this.errorMessage = 'Объявление не найдено';
          } else if (error.status === 400) {
            this.errorMessage = 'Неверные данные. Проверьте заполнение полей.';
          } else if (error.status === 422) {
            this.errorMessage =
              error.error?.userMessage || 'Произошёл конфликт бизнес-логики';
          } else {
            this.errorMessage =
              error.error?.userMessage || 'Ошибка при обновлении объявления';
          }
        },
      });
    } else {
      this.markFormGroupTouched();
      this.errorMessage = 'Заполните все обязательные поля правильно';
    }
  }

  onCancel(): void {
    this.cleanupImageUrls();
    this.router.navigate(['/ad', this.adId]);
  }

  protected obEditClick(adId: string): void {
    this.router.navigate([adId ], { relativeTo: this.route });
  }

  private cleanupImageUrls(): void {
    this.imageUrls.forEach((url) => {
      if (typeof url === 'string') URL.revokeObjectURL(url);
    });
    this.imageUrls = [];
    this.selectedFiles = [];
  }

  private markFormGroupTouched(): void {
    Object.keys(this.adForm.controls).forEach((key) => {
      this.adForm.get(key)?.markAsTouched();
    });
  }
}
