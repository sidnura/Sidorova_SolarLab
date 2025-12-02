import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdService } from '../../../core/services/ad.service';

@Component({
  selector: 'app-hexagon-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hexagon-image.component.html',
  styleUrls: ['./hexagon-image.component.scss']
})
export class HexagonImageComponent implements OnChanges {
  @Input() imageId: string = '';

  imageUrl: string = '';
  hasError: boolean = false;

  constructor(private adService: AdService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageId'] && this.imageId) {
      this.loadImage();
    }
  }

  ngOnInit() {
    if (this.imageId) {
      this.loadImage();
    }
  }

  private loadImage(): void {
    this.imageUrl = this.adService.getImageUrl(this.imageId);
    this.hasError = false;
  }

  onImageError() {
    this.hasError = true;
  }
}
