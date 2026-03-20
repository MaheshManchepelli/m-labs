import { Component, computed, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs';
import { SearchService } from '../../services/search.service';
import { fadeAnimation } from '../../services/route-animations';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-users-listing',
  standalone: true,
  imports: [ReactiveFormsModule, LoaderComponent],
  templateUrl: './users-listing.component.html',
  styleUrl: './users-listing.component.css',
    animations: [ fadeAnimation ]
})
export class UsersListingComponent implements OnInit {

  pageLoaded = signal(false);
  matchUsers = signal<any[]>([]);
  pageNo = signal(0);
  pageSize = signal(20);
  isLoading = signal(false);
  departments = computed(() => {
  const users = this.allUsers();
  const uniqueDepts = [...new Set(users.map(u => u.company.department))].sort();
  return ['all', ...uniqueDepts];
});

  @ViewChild('infiniteScrollTrigger') infiniteScrollTrigger?: ElementRef;
  private intersectionObserver: IntersectionObserver | null = null;

  // State Signals
  searchQuery = signal('');
  selectedGender = signal('all');
  selectedRole = signal('all');
  selectedDept = signal('all');

  // Helper to check if any filter is active
  hasActiveFilters = computed(() => {
    return this.searchQuery() !== '' || 
           this.selectedGender() !== 'all' || 
           this.selectedRole() !== 'all' || 
           this.selectedDept() !== 'all';
  });

  // Reset function
  resetFilters() {
    this.searchQuery.set('');
    this.selectedGender.set('all');
    this.selectedRole.set('all');
    this.selectedDept.set('all');
    
    // Manually reset HTML input/select values if not using [(ngModel)]
    const inputs = document.querySelectorAll('.filter-bar input, .filter-bar select');
    inputs.forEach((el: any) => {
      if (el.tagName === 'SELECT') el.value = 'all';
      if (el.tagName === 'INPUT') el.value = '';
    });
  }

  // Computed filtered list (same as before)
  filteredUsers = computed(() => {
    return this.allUsers().filter(u => {
      const matchesSearch = !this.searchQuery() || 
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(this.searchQuery().toLowerCase());
      const matchesGender = this.selectedGender() === 'all' || u.gender === this.selectedGender();
      const matchesRole = this.selectedRole() === 'all' || u.role === this.selectedRole();
      const matchesDept = this.selectedDept() === 'all' || u.company.department === this.selectedDept();
      
      return matchesSearch && matchesGender && matchesRole && matchesDept;
    });
  });

  constructor(private searchService: SearchService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    const skip = this.pageNo() * this.pageSize();
      this.searchService.fetchUsers(skip, this.pageSize(), '').subscribe({
        next: (res:any) => {          
          this.allUsers.update(current => [...current, ...res.users]); 
          this.isLoading.set(false);
          this.pageLoaded.set(true);
          this.infiniteScrollTrigger?.nativeElement.classList.remove('loading');
          this.createInfiniteScrollObserver();
        },
        error: (err) => {
          console.error(err);
          this.allUsers.set([]);
          this.isLoading.set(false);
          this.pageLoaded.set(true);
          this.infiniteScrollTrigger?.nativeElement.classList.remove('loading');
          this.createInfiniteScrollObserver();
        }
      });
  }

    loadMoreData() {
      if (this.isLoading()) return;
      this.pageNo.update(current => current + 1);
      this.loadUsers();
    }

  allUsers = signal<any[]>([]); // Populated from your API service
  selectedUser = signal<any | null>(null);

  openProfile(user: any) {
    this.selectedUser.set(user);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.selectedUser.set(null);
    document.body.style.overflow = 'auto';
  }
  
  // Helper to get initials (e.g., "Leanne Graham" -> "LG")
  getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
