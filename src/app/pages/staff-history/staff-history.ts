
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface ComplaintHistoryItem {
  id: string;
  subject: string;
  category: string;
  status: string;
  lastUpdated: string;
  resolution: string;
}

@Component({
  selector: 'app-staff-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './staff-history.html',
  styleUrl: './staff-history.css'
})
export class StaffHistory {
  loading = false;
  errorMessage = '';
  searchText = '';
  statusFilter = 'All';

  // Empty until complaints are handled.
  // This page currently uses frontend-only data.
  history: ComplaintHistoryItem[] = [];

  get filteredHistory(): ComplaintHistoryItem[] {
    const query = this.searchText.trim().toLowerCase();

    return this.history.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      const matchesStatus =
        this.statusFilter === 'All' ||
        item.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.statusFilter = 'All';
  }
}
