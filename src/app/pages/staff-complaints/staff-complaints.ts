
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

interface StaffComplaint {
  id: string;
  subject: string;
  category: string;
  complainant: string;
  complainantId: string;
  date: string;
  dateSubmitted: string;
  assignedAt?: string;
  assignedStaffId: string | null;
  assignedStaffName: string | null;
  location: string;
  description: string;
  priority: string;
  status: string;
  progressUpdates: {
    id: string;
    staffName: string;
    message: string;
    status: string;
    date: string;
  }[];
  resolution: string;
  resolvedAt: string | null;
  attachmentName: string | null;
}

@Component({
  selector: 'app-staff-complaints',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './staff-complaints.html',
  styleUrl: './staff-complaints.css'
})
export class StaffComplaints implements OnInit {
  loading = false;
  errorMessage = '';
  searchText = '';
  statusFilter = 'All';
  priorityFilter = 'All';
  selectedComplaint: StaffComplaint | null = null;

  progressMessage = '';
  resolution = '';
  newStatus: 'In Progress' | 'Resolved' = 'In Progress';

  complaints: StaffComplaint[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.refreshData();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id) {
        const complaint = this.complaints.find(c => c.id === id);

        if (complaint) {
          this.viewDetails(complaint);
        }
      }
    });
  }

  @HostListener('window:storage')
  onStorageChange(): void {
    this.refreshData();
  }

  private getSession(): any {
    try {
      return JSON.parse(localStorage.getItem('cfms_session') || 'null');
    } catch {
      return null;
    }
  }

  refreshData(): void {
    const session = this.getSession();

    if (session?.role !== 'staff') {
      this.complaints = [];
      this.errorMessage = 'Please log in using your staff account.';
      return;
    }

    try {
      const records: any[] = JSON.parse(
        localStorage.getItem('cfmsComplaints') || '[]'
      );

      this.complaints = records
        .filter(c => String(c.assignedStaffId) === String(session.id))
        .map(c => ({
          ...c,
          complainant: c.complainant || 'Unknown complainant',
          date: c.dateSubmitted || c.date || '',
          progressUpdates: c.progressUpdates || [],
          resolution: c.resolution || '',
          resolvedAt: c.resolvedAt || null,
          assignedStaffId: String(c.assignedStaffId),
          assignedStaffName: c.assignedStaffName || null
        }));

      this.errorMessage = '';

      if (this.selectedComplaint) {
        this.selectedComplaint =
          this.complaints.find(c => c.id === this.selectedComplaint?.id) || null;
      }
    } catch {
      this.complaints = [];
      this.errorMessage = 'Unable to load complaints.';
    }
  }

  get filteredComplaints(): StaffComplaint[] {
    const query = this.searchText.trim().toLowerCase();

    return this.complaints.filter(complaint => {
      const matchesSearch = [
        complaint.id,
        complaint.subject,
        complaint.category,
        complaint.complainant,
        complaint.location
      ].some(value => String(value || '').toLowerCase().includes(query));

      const matchesStatus =
        this.statusFilter === 'All' ||
        complaint.status === this.statusFilter;

      const matchesPriority =
        this.priorityFilter === 'All' ||
        complaint.priority === this.priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  get pendingCount(): number {
    return this.complaints.filter(c => c.status === 'Pending').length;
  }

  get progressCount(): number {
    return this.complaints.filter(c => c.status === 'In Progress').length;
  }

  get resolvedCount(): number {
    return this.complaints.filter(c => c.status === 'Resolved').length;
  }

  get totalCount(): number {
    return this.complaints.length;
  }

  clearFilters(): void {
    this.searchText = '';
    this.statusFilter = 'All';
    this.priorityFilter = 'All';
  }

  viewDetails(complaint: StaffComplaint): void {
    this.selectedComplaint = complaint;
    this.newStatus =
      complaint.status === 'Resolved' ? 'Resolved' : 'In Progress';
    this.progressMessage = '';
    this.resolution = complaint.resolution || '';
    this.errorMessage = '';
  }

  closeDetails(): void {
    this.selectedComplaint = null;
  }

  updateStatus(
    complaint: StaffComplaint,
    status: 'In Progress' | 'Resolved'
  ): void {
    const session = this.getSession();

    if (session?.role !== 'staff') {
      this.errorMessage = 'Please log in using your staff account.';
      return;
    }

    const records: any[] = JSON.parse(
      localStorage.getItem('cfmsComplaints') || '[]'
    );

    const target = records.find(
      c =>
        c.id === complaint.id &&
        String(c.assignedStaffId) === String(session.id)
    );

    if (!target) {
      this.errorMessage = 'This complaint is not assigned to your account.';
      return;
    }

    if (status === 'Resolved' && !this.resolution.trim()) {
      this.errorMessage = 'Please enter the resolution details.';
      return;
    }

    target.status = status;

    if (status === 'Resolved') {
      target.resolution = this.resolution.trim();
      target.resolvedAt = new Date().toISOString();
    } else {
      target.resolution = '';
      target.resolvedAt = null;
    }

    target.progressUpdates = target.progressUpdates || [];

    target.progressUpdates.push({
      id: `${Date.now()}`,
      staffName: session.fullName,
      message: this.progressMessage.trim() ||
        `Status changed to ${status}.`,
      status,
      date: new Date().toISOString()
    });

    localStorage.setItem('cfmsComplaints', JSON.stringify(records));

    this.refreshData();
    this.selectedComplaint = null;
    this.progressMessage = '';
    this.resolution = '';
    this.errorMessage = '';
  }
}
