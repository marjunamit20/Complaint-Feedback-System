import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

export interface FeedbackItem {
  id: string;
  feedbackType: 'General Feedback' | 'Post-Resolution';
  complaintRef?: string;
  subject: string;
  rating: number;
  message: string;
  date: string;
}

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './feedback.html',
  styleUrl: './feedback.css'
})
export class Feedback implements OnInit {
  feedbackType: 'General Feedback' | 'Post-Resolution' = 'General Feedback';
  selectedComplaintRef = '';
  subject = '';
  rating = 0;
  hoverRating = 0;
  message = '';

  successMessage = '';
  errorMessage = '';

  feedbackRecords: FeedbackItem[] = [];

  // Pulls resolved complaints from localStorage if available, otherwise uses sample resolved tickets
  resolvedComplaints: { refNo: string; title: string }[] = [
    { refNo: 'CFMS-2026-001', title: 'Broken streetlight near main gate' },
    { refNo: 'CFMS-2026-002', title: 'Water supply interruption in Building B' }
  ];

  private readonly STORAGE_KEY = 'cfms_user_feedback';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadFeedback();
    this.loadResolvedComplaints();
  }

  private loadFeedback(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.feedbackRecords = JSON.parse(saved);
      }
    } catch {
      this.feedbackRecords = [];
    }
  }

  private loadResolvedComplaints(): void {
    try {
      const savedComplaints = localStorage.getItem('cfms_complaints');
      if (savedComplaints) {
        const parsed = JSON.parse(savedComplaints);
        const resolved = parsed.filter(
          (c: any) => c.status?.toLowerCase() === 'resolved' || c.status?.toLowerCase() === 'closed'
        );
        if (resolved.length > 0) {
          this.resolvedComplaints = resolved.map((c: any) => ({
            refNo: c.referenceNo || c.id,
            title: c.title || c.subject
          }));
        }
      }
    } catch {
      // Keep fallback resolvedComplaints
    }
  }

  setRating(star: number): void {
    this.rating = star;
    this.errorMessage = '';
  }

  onTypeChange(): void {
    if (this.feedbackType === 'Post-Resolution' && this.selectedComplaintRef) {
      const match = this.resolvedComplaints.find((c) => c.refNo === this.selectedComplaintRef);
      if (match && !this.subject.trim()) {
        this.subject = `Resolution Feedback: ${match.title}`;
      }
    }
  }

  submitFeedback(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const cleanSubject = this.subject.trim();
    const cleanMessage = this.message.trim();

    if (this.feedbackType === 'Post-Resolution' && !this.selectedComplaintRef) {
      this.errorMessage = 'Please select a resolved complaint reference number.';
      return;
    }

    if (!cleanSubject) {
      this.errorMessage = 'Please enter a feedback subject.';
      return;
    }

    if (this.rating < 1 || this.rating > 5) {
      this.errorMessage = 'Please select a star rating from 1 to 5.';
      return;
    }

    if (!cleanMessage) {
      this.errorMessage = 'Please write your feedback or suggestion before submitting.';
      return;
    }

    const newFeedback: FeedbackItem = {
      id: `FB-${Date.now().toString().slice(-5)}`,
      feedbackType: this.feedbackType,
      complaintRef: this.feedbackType === 'Post-Resolution' ? this.selectedComplaintRef : undefined,
      subject: cleanSubject,
      rating: this.rating,
      message: cleanMessage,
      date: new Date().toISOString()
    };

    this.feedbackRecords = [newFeedback, ...this.feedbackRecords];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.feedbackRecords));

    // Reset form
    this.subject = '';
    this.rating = 0;
    this.hoverRating = 0;
    this.message = '';
    this.selectedComplaintRef = '';
    this.successMessage = 'Thank you! Your feedback has been submitted successfully.';

    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }

  deleteFeedback(id: string): void {
    this.feedbackRecords = this.feedbackRecords.filter((item) => item.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.feedbackRecords));
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToMyComplaints(): void {
    this.router.navigate(['/my-complaints']);
  }

  logout(): void {
    localStorage.removeItem('cfms_current_user');
    this.router.navigate(['/login']);
  }
}