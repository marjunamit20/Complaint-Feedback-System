
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface StaffComplaint {
  id: string;
  subject: string;
  category: string;
  complainant: string;
  date: string;
  assignedAt: string;
  location: string;
  description: string;
  priority: string;
  status: string;
}

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './staff-dashboard.html',
  styleUrl: './staff-dashboard.css'
})
export class StaffDashboard {
  loading = false;
  errorMessage = '';

  // Temporary frontend-only data.
  // Replace this with the backend API when it is available.
  complaints: StaffComplaint[] = [];

  get totalAssigned(): number {
    return this.complaints.length;
  }

  get pendingCount(): number {
    return this.complaints.filter(c =>
      ['Pending', 'Assigned'].includes(c.status)
    ).length;
  }

  get inProgressCount(): number {
    return this.complaints.filter(c =>
      c.status === 'In Progress'
    ).length;
  }

  get resolvedCount(): number {
    return this.complaints.filter(c =>
      ['Resolved', 'Closed'].includes(c.status)
    ).length;
  }

  get recentComplaints(): StaffComplaint[] {
    return this.complaints.slice(0, 5);
  }

  refreshDashboard(): void {
    // No backend yet. The page can render without an API request.
    this.errorMessage = '';
  }
}
