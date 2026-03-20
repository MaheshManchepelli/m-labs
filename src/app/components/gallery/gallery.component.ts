import { AfterViewInit, Component, ElementRef, inject, Inject, OnInit, PLATFORM_ID, signal, ViewChild, effect } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { LoaderComponent } from "../loader/loader.component";
import { fadeAnimation } from '../../services/route-animations';
import { isPlatformBrowser } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [LoaderComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
  animations: [fadeAnimation]
})
export class GalleryComponent implements OnInit, AfterViewInit {
  private breakpointObserver = inject(BreakpointObserver);
  private searchSubject = new Subject<string>();
  private searchService = inject(SearchService);
  isBrowser: boolean;

  // Signals for state management
  allPhotos = signal<any[]>([]);
  searchQuery = signal('');
  columns = signal<any[][]>([]);
  pageNo = signal(1);
  pageSize = signal(20);
  isLoading = signal(false);
  pageLoaded = signal(false);

  // Suggested categories
  categories = ['Nature', 'Architecture', 'Business', 'Technology', 'People', 'Travel', 'Food'];

  @ViewChild('infiniteScrollTrigger') infiniteScrollTrigger?: ElementRef;
  private intersectionObserver: IntersectionObserver | null = null;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Search debouncing
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(val => {
      this.searchQuery.set(val);
      this.resetAndFetch();
    });

    // Effect to react to changes in allPhotos and distribute into columns
    effect(() => {
      this.distributePhotosIntoColumns();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.getImages();
  }

  getImages() {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.searchService.fetchPhotos(this.pageNo(), this.pageSize(), this.searchQuery()).subscribe({
      next: (data: any) => {
        this.allPhotos.update(current => [...current, ...data]);
        this.isLoading.set(false);
        this.pageLoaded.set(true);
        this.infiniteScrollTrigger?.nativeElement.classList.remove('loading');
        this.createInfiniteScrollObserver();
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        this.pageLoaded.set(true);
      }
    });
  }

  resetAndFetch() {
    this.allPhotos.set([]);
    this.pageNo.set(1);
    this.columns.set([]);
    this.getImages();
  }

  onSearchChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchSubject.next(val);
  }

  setCategory(category: string) {
    this.searchQuery.set(category);
    // Update input value manually if not using [(ngModel)]
    const input = document.querySelector('.form-control-custom') as HTMLInputElement;
    if (input) input.value = category;
    this.resetAndFetch();
  }

  loadMoreData() {
    this.pageNo.update(current => current + 1);
    this.getImages();
  }

  distributePhotosIntoColumns() {
    const photos = this.allPhotos();
    const numColumns = this.getNumberOfColumns();
    const columns: any[][] = Array.from({ length: numColumns }, () => []);

    photos.forEach((photo, index) => {
      const columnIndex = index % numColumns;
      columns[columnIndex].push({
        ...photo,
        aspectRatio: this.calculateAspectRatio(photo.height, photo.width)
      });
    });

    this.columns.set(columns);
  }

  calculateAspectRatio(height: number, width: number): string {
    return (width / height).toFixed(2);
  }

  getNumberOfColumns(): number {
    if (this.breakpointObserver.isMatched(Breakpoints.XSmall)) {
      return 1;
    } else if (this.breakpointObserver.isMatched(Breakpoints.Small)) {
      return 2;
    } else if (this.breakpointObserver.isMatched(Breakpoints.Medium)) {
      return 3;
    } else {
      return 4;
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.breakpointObserver.observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge
      ]).subscribe(() => {
        this.distributePhotosIntoColumns();
      });
    }
  }

  private disconnectInfiniteScrollObserver() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }

  private createInfiniteScrollObserver() {
    if (!this.intersectionObserver && this.infiniteScrollTrigger && !this.isLoading()) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio <= 0) return;
        this.disconnectInfiniteScrollObserver();
        if (this.infiniteScrollTrigger) {
          this.infiniteScrollTrigger.nativeElement.classList.add('loading');
        }
        setTimeout(() => {
          this.loadMoreData();
        }, 1000);
      });
      this.intersectionObserver.observe(this.infiniteScrollTrigger.nativeElement);
    }
  }
}
