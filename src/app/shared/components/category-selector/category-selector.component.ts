import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../services/category.service';

@Component({
  selector: 'app-category-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.scss']
})
export class CategorySelectorComponent implements OnInit {
  parentCategories: Category[] = [];
  childCategories: Category[] = [];
  selectedParentCategory: string = '';
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  hoverTimeout: any;

  @Output() categorySelected = new EventEmitter<string>();

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    console.log('CategorySelectorComponent инициализирован');
    this.loadParentCategories();
  }

  loadParentCategories(): void {
    this.isLoading = true;
    console.log('Загрузка родительских категорий...');
    this.categoryService.getParentCategories().subscribe({
      next: (categories: Category[]) => {
        this.isLoading = false;
        this.parentCategories = categories;
        console.log('Родительские категории загружены:', categories);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Ошибка загрузки категорий:', error);
        this.errorMessage = 'Ошибка загрузки категорий';
      }
    });
  }

  loadChildCategories(parentId: string): void {
    console.log('Загрузка дочерних категорий для:', parentId);
    this.categoryService.getChildCategories(parentId).subscribe({
      next: (categories: Category[]) => {
        this.childCategories = categories;
        console.log('Дочерние категории загружены:', categories);
      },
      error: (error: any) => {
        console.error('Error loading child categories:', error);
        this.childCategories = [];
      }
    });
  }

  onButtonMouseEnter(): void {
    // Очищаем предыдущий таймер
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }

    console.log('Наведение на кнопку "Все категории"');
    if (!this.isOpen) {
      this.isOpen = true;
      if (this.parentCategories.length === 0) {
        this.loadParentCategories();
      }
    }
  }

  onParentCategoryHover(parentId: string): void {
    // Очищаем предыдущий таймер
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }

    console.log('Наведение на родительскую категорию:', parentId);
    this.selectedParentCategory = parentId;
    this.loadChildCategories(parentId);
  }

  onDropdownMouseEnter(): void {
    // Отменяем закрытие при наведении на выпадающее меню
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
  }

  onDropdownMouseLeave(): void {
    // Закрываем меню при отведении курсора с задержкой
    this.hoverTimeout = setTimeout(() => {
      this.closeDropdown();
    }, 300);
  }

  onButtonMouseLeave(): void {
    // Закрываем меню при отведении от кнопки с задержкой
    this.hoverTimeout = setTimeout(() => {
      this.closeDropdown();
    }, 300);
  }

  onCategorySelect(categoryId: string): void {
    console.log('Выбрана категория для навигации:', categoryId);
    this.categorySelected.emit(categoryId);
    this.closeDropdown();
  }

  toggleDropdown(): void {
    console.log('Переключение dropdown, текущее состояние:', this.isOpen);
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.parentCategories.length === 0) {
      console.log('Dropdown открыт, но категории не загружены - перезагружаем');
      this.loadParentCategories();
    }
    if (!this.isOpen) {
      this.closeDropdown();
    }
  }

  private closeDropdown(): void {
    this.isOpen = false;
    this.selectedParentCategory = '';
    this.childCategories = [];
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
  }
}