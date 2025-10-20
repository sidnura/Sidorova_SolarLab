import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/services/category.service';

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
    this.loadParentCategories();
  }

  loadParentCategories(): void {
    this.isLoading = true;
    this.categoryService.getParentCategories().subscribe({
      next: (categories: Category[]) => {
        this.isLoading = false;
        this.parentCategories = categories;
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Ошибка загрузки категорий';
      }
    });
  }

  loadChildCategories(parentId: string): void {
    this.categoryService.getChildCategories(parentId).subscribe({
      next: (categories: Category[]) => {
        this.childCategories = categories;
      },
      error: (error: any) => {
        this.childCategories = [];
      }
    });
  }

  onButtonMouseEnter(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }

    if (!this.isOpen) {
      this.isOpen = true;
      if (this.parentCategories.length === 0) {
        this.loadParentCategories();
      }
    }
  }

  onParentCategoryHover(parentId: string): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }

    this.selectedParentCategory = parentId;
    this.loadChildCategories(parentId);
  }

  onDropdownMouseEnter(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
  }

  onDropdownMouseLeave(): void {
    this.hoverTimeout = setTimeout(() => {
      this.closeDropdown();
    }, 300);
  }

  onButtonMouseLeave(): void {
    this.hoverTimeout = setTimeout(() => {
      this.closeDropdown();
    }, 300);
  }

  onCategorySelect(categoryId: string): void {
    this.categorySelected.emit(categoryId);
    this.closeDropdown();
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.parentCategories.length === 0) {
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