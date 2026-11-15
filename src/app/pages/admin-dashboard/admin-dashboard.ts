
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface Complaint {
  id: string;
  subject: string;
  category: string;
  complainant: string;
  date: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {
  searchTerm = '';
  statusFilter = 'All';
  priorityFilter = 'All';

  complaints: Complaint[] = [
    {
      id: 'CF-2026-001',
      subject: 'Damaged Road',
      category: 'Infrastructure',
      complainant: 'Juan Dela Cruz',
      date: 'Oct 10, 2026',
      priority: 'High',
      status: 'In Progress'
    },
    {
      id: 'CF-2026-002',
      subject: 'Garbage Collection Delay',
      category: 'Sanitation',
      complainant: 'Maria Santos',
      date: 'Oct 8, 2026',
      priority: 'Normal',
      status: 'Pending'
    },
    {
      id: 'CF-2026-003',
      subject: 'Streetlight Not Working',
      category: 'Public Safety',
      complainant: 'Pedro Reyes',
      date: 'Oct 5, 2026',
      priority: 'Urgent',
      status: 'Resolved'
    }
  ];

  constructor(private router: Router) {}

  get filteredComplaints(): Complaint[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.complaints.filter(complaint => {
      const matchesSearch =
        !term ||
        complaint.id.toLowerCase().includes(term) ||
        complaint.subject.toLowerCase().includes(term) ||
        complaint.category.toLowerCase().includes(term) ||
        complaint.complainant.toLowerCase().includes(term);

      const matchesStatus =
        this.statusFilter === 'All' ||
        complaint.status === this.statusFilter;

      const matchesPriority =
        this.priorityFilter === 'All' ||
        complaint.priority === this.priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  get totalComplaints(): number {
    return this.complaints.length;
  }

  get pendingCount(): number {
    return this.complaints.filter(c => c.status === 'Pending').length;
  }

  get inProgressCount(): number {
    return this.complaints.filter(c => c.status === 'In Progress').length;
  }

  get resolvedCount(): number {
    return this.complaints.filter(c => c.status === 'Resolved').length;
  }

  get urgentCount(): number {
    return this.complaints.filter(
      c => c.priority === 'Urgent' &&
        c.status !== 'Resolved' &&
        c.status !== 'Rejected'
    ).length;
  }

  updateStatus(complaint: Complaint, value: string): void {
    const allowed: Complaint['status'][] = [
      'Pending',
      'In Progress',
      'Resolved',
      'Rejected'
    ];

    if (allowed.includes(value as Complaint['status'])) {
      complaint.status = value as Complaint['status'];
    }
  }

  viewComplaint(complaint: Complaint): void {
    const details = [
      `Reference: ${complaint.id}`,
      `Subject: ${complaint.subject}`,
      `Category: ${complaint.category}`,
      `Complainant: ${complaint.complainant}`,
      `Date submitted: ${complaint.date}`,
      `Priority: ${complaint.priority}`,
      `Status: ${complaint.status}`
    ].join('\n');

    window.alert(details);
  }

  signOut(): void {
    this.router.navigate(['/login']);
  }
}
