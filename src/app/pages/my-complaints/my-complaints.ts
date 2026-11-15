
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Complaint {
  id: string;
  title: string;
  category: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  description: string;
  subject: string;
  location: string;
  priority: string;
  complainantId: string;
  complainant: string;
  assignedStaffName: string | null;
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
  selector: 'app-my-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe],
  templateUrl: './my-complaints.html',
  styleUrl: './my-complaints.css'
})
export class MyComplaints implements OnInit {
  searchText = '';
  selectedStatus = 'All';
  complaints: Complaint[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.refreshData();
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

    if (!session || session.role !== 'complainant') {
      this.complaints = [];
      return;
    }

    try {
      const records: any[] = JSON.parse(
        localStorage.getItem('cfmsComplaints') || '[]'
      );

      this.complaints = records
        .filter(c => String(c.complainantId) === String(session.id))
        .map(c => ({
          ...c,
          title: c.subject,
          date: c.dateSubmitted || c.date || '',
          status: c.status || 'Pending',
          assignedStaffName: c.assignedStaffName || null,
          progressUpdates: c.progressUpdates || [],
          resolution: c.resolution || '',
          resolvedAt: c.resolvedAt || null
        }));
    } catch {
      this.complaints = [];
    }
  }

  get filteredComplaints(): Complaint[] {
    const query = this.searchText.trim().toLowerCase();

    return this.complaints.filter(complaint => {
      const matchesSearch =
        complaint.id.toLowerCase().includes(query) ||
        complaint.title.toLowerCase().includes(query) ||
        complaint.category.toLowerCase().includes(query);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        complaint.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  get totalComplaints(): number {
    return this.complaints.length;
  }

  get activeComplaints(): number {
    return this.complaints.filter(c =>
      ['Pending', 'In Progress'].includes(c.status)
    ).length;
  }

  get resolvedComplaints(): number {
    return this.complaints.filter(c => c.status === 'Resolved').length;
  }

  getStatusClass(status: Complaint['status']): string {
    return status.toLowerCase().replaceAll(' ', '-');
  }

  viewComplaint(complaint: Complaint): void {
    this.router.navigate(['/complaints'], {
      queryParams: { id: complaint.id }
    });
  }

  submitComplaint(): void {
    this.router.navigate(['/complaints']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    localStorage.removeItem('cfms_session');
    this.router.navigate(['/login']);
  }
}
