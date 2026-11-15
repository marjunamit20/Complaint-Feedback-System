
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

interface Complaint {
  id: string;
  title: string;
  category: string;
  date: string;
  status: string;
  userId?: number | string;
  userEmail?: string;
}

interface CFMSSession {
  id: number | string;
  fullName: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  userName = 'User';
  recentComplaints: Complaint[] = [];

  private session: CFMSSession | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    // Get the currently logged-in account.
    try {
      const storedSession = localStorage.getItem('cfms_session');

      this.session = storedSession
        ? JSON.parse(storedSession)
        : null;
    } catch {
      this.session = null;
    }

    // Do not show dashboard data without a session.
    if (!this.session) {
      this.recentComplaints = [];
      this.router.navigate(['/login']);
      return;
    }

    this.userName = this.session.fullName || 'User';

    // Read complaints saved by the application.
    let allComplaints: any[] = [];

    try {
      const storedComplaints =
        localStorage.getItem('cfmsComplaints');

      const parsed = storedComplaints
        ? JSON.parse(storedComplaints)
        : [];

      allComplaints = Array.isArray(parsed) ? parsed : [];
    } catch {
      allComplaints = [];
    }

    // Show only complaints belonging to this account.
    this.recentComplaints = allComplaints
      .filter((complaint: any) => {
        const sameUserId =
          complaint.userId != null &&
          String(complaint.userId) ===
            String(this.session!.id);

        const sameEmail =
          String(complaint.userEmail || '')
            .trim()
            .toLowerCase() ===
          this.session!.email.trim().toLowerCase();

        return sameUserId || sameEmail;
      })
      .map((complaint: any) => ({
        id: String(
          complaint.id ??
          complaint.referenceNo ??
          complaint.complaintId ??
          ''
        ),
        title: String(
          complaint.title ??
          complaint.subject ??
          complaint.description ??
          'Untitled Complaint'
        ),
        category: String(complaint.category ?? 'Uncategorized'),
        date: this.formatDate(
          complaint.dateSubmitted ??
          complaint.date ??
          complaint.createdAt
        ),
        status: String(complaint.status ?? 'Pending'),
        userId: complaint.userId,
        userEmail: complaint.userEmail
      }))
      .sort((a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
      )
      .slice(0, 5);
  }

  private formatDate(value: unknown): string {
    if (!value) {
      return '—';
    }

    const date = new Date(String(value));

    if (isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  get initials(): string {
    return this.userName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  get firstName(): string {
    return this.userName.trim().split(/\s+/)[0] || 'there';
  }

  get totalComplaints(): number {
    return this.recentComplaints.length;
  }

  get pendingComplaints(): number {
    return this.recentComplaints.filter(
      complaint => {
        const status = complaint.status.toLowerCase();
        return status === 'pending' || status === 'under review';
      }
    ).length;
  }

  get inProgressComplaints(): number {
    return this.recentComplaints.filter(
      complaint =>
        complaint.status.toLowerCase() === 'in progress'
    ).length;
  }

  get resolvedComplaints(): number {
    return this.recentComplaints.filter(
      complaint =>
        complaint.status.toLowerCase() === 'resolved'
    ).length;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';

      case 'in progress':
        return 'status-progress';

      case 'resolved':
        return 'status-resolved';

      case 'rejected':
        return 'status-rejected';

      case 'under review':
        return 'status-review';

      default:
        return 'status-pending';
    }
  }

  signOut(): void {
    localStorage.removeItem('cfms_session');
    this.router.navigate(['/login']);
  }
}
