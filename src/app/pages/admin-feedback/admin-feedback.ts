import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface FeedbackRecord {
  id: number;
  reference: string;
  userName: string;
  email: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Pending' | 'Reviewed' | 'Responded';
  reply: string;
}

@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './admin-feedback.html',
  styleUrl: './admin-feedback.css'
})
export class AdminFeedback {
  searchTerm = '';
  selectedStatus = 'All';
  selectedRating = 'All';

  selectedFeedback: FeedbackRecord | null = null;
  replyText = '';
  showDetails = false;
  showReply = false;

  feedbackRecords: FeedbackRecord[] = [
    {
      id: 1,
      reference: 'FB-2026-001',
      userName: 'Juan Dela Cruz',
      email: 'juan@example.com',
      rating: 5,
      comment: 'The complaint reporting process was easy to use. Thank you for responding to my concern.',
      date: 'Oct 18, 2026',
      status: 'Pending',
      reply: ''
    },
    {
      id: 2,
      reference: 'FB-2026-002',
      userName: 'Maria Santos',
      email: 'maria@example.com',
      rating: 4,
      comment: 'The system is helpful, but I hope the complaint status updates can be more frequent.',
      date: 'Oct 17, 2026',
      status: 'Reviewed',
      reply: ''
    },
    {
      id: 3,
      reference: 'FB-2026-003',
      userName: 'Pedro Garcia',
      email: 'pedro@example.com',
      rating: 5,
      comment: 'Very convenient. I can submit and monitor my complaint without going to the office.',
      date: 'Oct 16, 2026',
      status: 'Responded',
      reply: 'Thank you for sharing your feedback. We appreciate your support.'
    },
    {
      id: 4,
      reference: 'FB-2026-004',
      userName: 'Ana Reyes',
      email: 'ana@example.com',
      rating: 3,
      comment: 'The system works, but the instructions could be clearer for first-time users.',
      date: 'Oct 15, 2026',
      status: 'Pending',
      reply: ''
    },
    {
      id: 5,
      reference: 'FB-2026-005',
      userName: 'Jose Mendoza',
      email: 'jose@example.com',
      rating: 4,
      comment: 'Good system overall. It would be helpful to receive notifications when complaints are updated.',
      date: 'Oct 14, 2026',
      status: 'Reviewed',
      reply: ''
    }
  ];

  get totalFeedback(): number {
    return this.feedbackRecords.length;
  }

  get pendingCount(): number {
    return this.feedbackRecords.filter(
      feedback => feedback.status === 'Pending'
    ).length;
  }

  get reviewedCount(): number {
    return this.feedbackRecords.filter(
      feedback => feedback.status === 'Reviewed'
    ).length;
  }

  get respondedCount(): number {
    return this.feedbackRecords.filter(
      feedback => feedback.status === 'Responded'
    ).length;
  }

  get averageRating(): string {
    if (this.feedbackRecords.length === 0) {
      return '0.0';
    }

    const total = this.feedbackRecords.reduce(
      (sum, feedback) => sum + feedback.rating,
      0
    );

    return (total / this.feedbackRecords.length).toFixed(1);
  }

  get filteredFeedback(): FeedbackRecord[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.feedbackRecords.filter(feedback => {
      const matchesSearch =
        feedback.reference.toLowerCase().includes(search) ||
        feedback.userName.toLowerCase().includes(search) ||
        feedback.email.toLowerCase().includes(search) ||
        feedback.comment.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        feedback.status === this.selectedStatus;

      const matchesRating =
        this.selectedRating === 'All' ||
        feedback.rating === Number(this.selectedRating);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }

  openDetails(feedback: FeedbackRecord): void {
    this.selectedFeedback = feedback;
    this.showDetails = true;
    this.showReply = false;
  }

  openReply(feedback: FeedbackRecord): void {
    this.selectedFeedback = feedback;
    this.replyText = feedback.reply;
    this.showReply = true;
    this.showDetails = false;
  }

  markReviewed(feedback: FeedbackRecord): void {
    if (feedback.status === 'Pending') {
      feedback.status = 'Reviewed';
    }
  }

  sendReply(): void {
    if (!this.selectedFeedback || !this.replyText.trim()) {
      return;
    }

    this.selectedFeedback.reply = this.replyText.trim();
    this.selectedFeedback.status = 'Responded';

    this.showReply = false;
    this.replyText = '';
    this.selectedFeedback = null;
  }

  closeModal(): void {
    this.showDetails = false;
    this.showReply = false;
    this.selectedFeedback = null;
    this.replyText = '';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'All';
    this.selectedRating = 'All';
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}