
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface Complaint {
  id: string;
  subject: string;
  category: string;
  complainant: string;
  complainantId: string;
  complainantEmail: string;
  date: string;
  dateSubmitted: string;
  location: string;
  description: string;
  priority: string;
  status: string;
  attachmentName: string | null;
  assignedStaffId: string | null;
  assignedStaffName: string | null;
  progressUpdates: any[];
  resolution: string;
  resolvedAt: string | null;
}

interface StaffUser {
  id: string | number;
  fullName: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-manage-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './manage-complaints.html',
  styleUrl: './manage-complaints.css'
})
export class ManageComplaints implements OnInit {
  searchText = '';
  statusFilter = 'All';
  priorityFilter = 'All';
  selectedComplaint: Complaint | null = null;
  notice = '';

  complaints: Complaint[] = [];
  staffUsers: StaffUser[] = [];

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

  private isAdministrator(): boolean {
    const session = this.getSession();

    return session?.role === 'administrator' ||
      session?.role === 'admin';
  }

  refreshData(): void {
    if (!this.isAdministrator()) {
      this.complaints = [];
      this.staffUsers = [];
      return;
    }

    try {
      const records: any[] = JSON.parse(
        localStorage.getItem('cfmsComplaints') || '[]'
      );

      this.complaints = records.map(item => ({
        ...item,
        complainant: item.complainant || 'Unknown complainant',
        complainantId: String(item.complainantId ?? ''),
        complainantEmail: item.complainantEmail || '',
        date: item.dateSubmitted || item.date || '',
        dateSubmitted: item.dateSubmitted || item.date || '',
        assignedStaffId: item.assignedStaffId != null
          ? String(item.assignedStaffId)
          : null,
        assignedStaffName: item.assignedStaffName || null,
        progressUpdates: item.progressUpdates || [],
        resolution: item.resolution || '',
        resolvedAt: item.resolvedAt || null
      }));

      const users: StaffUser[] = JSON.parse(
        localStorage.getItem('cfms_users') || '[]'
      );

      this.staffUsers = users.filter(user => user.role === 'staff');
    } catch {
      this.complaints = [];
      this.staffUsers = [];
    }

    if (this.selectedComplaint) {
      this.selectedComplaint =
        this.complaints.find(c => c.id === this.selectedComplaint?.id) || null;
    }
  }

  private saveComplaints(records: Complaint[]): void {
    localStorage.setItem('cfmsComplaints', JSON.stringify(records));
    this.refreshData();
  }

  get filteredComplaints(): Complaint[] {
    const query = this.searchText.trim().toLowerCase();

    return this.complaints.filter(c => {
      const matchesSearch = [
        c.id,
        c.subject,
        c.category,
        c.complainant,
        c.location
      ].some(value => String(value || '').toLowerCase().includes(query));

      const matchesStatus =
        this.statusFilter === 'All' || c.status === this.statusFilter;

      const matchesPriority =
        this.priorityFilter === 'All' || c.priority === this.priorityFilter;

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

  get urgentCount(): number {
    return this.complaints.filter(
      c => c.priority === 'Urgent' && c.status !== 'Resolved'
    ).length;
  }

  assignStaff(complaint: Complaint, staffId: string): void {
    if (!this.isAdministrator()) {
      this.notice = 'Administrator access required.';
      return;
    }

    const records: Complaint[] = JSON.parse(
      localStorage.getItem('cfmsComplaints') || '[]'
    );

    const target = records.find(c => c.id === complaint.id);

    if (!target) {
      this.notice = 'Complaint not found.';
      return;
    }

    const staff = this.staffUsers.find(
      user => String(user.id) === String(staffId)
    );

    target.assignedStaffId = staff ? String(staff.id) : null;
    target.assignedStaffName = staff?.fullName || null;

    this.saveComplaints(records);

    this.notice = staff
      ? `${complaint.id} assigned to ${staff.fullName}.`
      : `${complaint.id} is now unassigned.`;
  }

  updateStatus(complaint: Complaint, status: string): void {
    if (!this.isAdministrator()) {
      this.notice = 'Administrator access required.';
      return;
    }

    const records: Complaint[] = JSON.parse(
      localStorage.getItem('cfmsComplaints') || '[]'
    );

    const target = records.find(c => c.id === complaint.id);

    if (!target) {
      this.notice = 'Complaint not found.';
      return;
    }

    target.status = status;

    if (status !== 'Resolved') {
      target.resolution = '';
      target.resolvedAt = null;
    }

    this.saveComplaints(records);
    this.notice = `${target.id} status updated to ${status}.`;
  }

  viewDetails(complaint: Complaint): void {
    this.selectedComplaint = complaint;
    this.notice = '';
  }

  closeDetails(): void {
    this.selectedComplaint = null;
  }

  clearFilters(): void {
    this.searchText = '';
    this.statusFilter = 'All';
    this.priorityFilter = 'All';
  }
}
