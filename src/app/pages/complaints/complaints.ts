
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface ComplaintRecord {
  id: string;
  subject: string;
  category: string;
  priority: string;
  location: string;
  description: string;
  status: string;
  dateSubmitted: string;
  attachmentName: string | null;
  attachmentImages?: {
    name: string;
    type: string;
    dataUrl: string;
  }[];
  complainant: string;
  complainantId: string;
  complainantEmail: string;
  assignedStaffId: string | null;
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
}

interface ImagePreview {
  file: File;
  name: string;
  size: number;
  preview: string;
}

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './complaints.html',
  styleUrl: './complaints.css'
})
export class Complaints {
  selectedImages: ImagePreview[] = [];
  isSubmitting = false;

  readonly maxImages = 5;
  readonly maxImageSize = 500 * 1024;

  complaint = {
    subject: '',
    category: '',
    priority: 'Normal',
    location: '',
    description: ''
  };

  categories = [
    'Public Service',
    'Infrastructure',
    'Sanitation',
    'Public Safety',
    'Customer Service',
    'Other'
  ];

  priorities = ['Low', 'Normal', 'High', 'Urgent'];

  constructor(private router: Router) {}

  private getSession(): any {
    try {
      return JSON.parse(localStorage.getItem('cfms_session') || 'null');
    } catch {
      return null;
    }
  }

  get userName(): string {
    const session = this.getSession();

    return session?.fullName ||
      localStorage.getItem('cfmsUserName') ||
      'Juan Dela Cruz';
  }

  get initials(): string {
    return this.userName
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  get totalComplaints(): number {
    const session = this.getSession();

    return this.getComplaints().filter(item =>
      item.complainantId === String(session?.id) ||
      (
        !session?.id &&
        item.complainant === this.userName
      )
    ).length;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    if (!files.length) return;

    const availableSlots = this.maxImages - this.selectedImages.length;

    if (availableSlots <= 0) {
      alert(`You can upload up to ${this.maxImages} images.`);
      input.value = '';
      return;
    }

    if (files.length > availableSlots) {
      alert(`Only ${this.maxImages} images are allowed per complaint.`);
    }

    for (const file of files.slice(0, availableSlots)) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert(`${file.name}: Only JPG, PNG, and WEBP images are allowed.`);
        continue;
      }

      if (file.size > this.maxImageSize) {
        alert(`${file.name}: Each image must be 500 KB or smaller.`);
        continue;
      }

      if (this.selectedImages.some(
        image => image.name === file.name && image.size === file.size
      )) {
        continue;
      }

      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result !== 'string') return;

        this.selectedImages = [
          ...this.selectedImages,
          {
            file,
            name: file.name,
            size: file.size,
            preview: reader.result
          }
        ];
      };

      reader.onerror = () => {
        alert(`Unable to preview ${file.name}. Please try again.`);
      };

      reader.readAsDataURL(file);
    }

    input.value = '';
  }

  removeImage(index: number): void {
    this.selectedImages = this.selectedImages.filter(
      (_, imageIndex) => imageIndex !== index
    );
  }

  getComplaints(): ComplaintRecord[] {
    try {
      const records = JSON.parse(
        localStorage.getItem('cfmsComplaints') || '[]'
      );

      return Array.isArray(records) ? records : [];
    } catch {
      return [];
    }
  }

  async submitComplaint(): Promise<void> {
    if (this.isSubmitting) return;

    if (
      !this.complaint.subject.trim() ||
      !this.complaint.category ||
      !this.complaint.location.trim() ||
      !this.complaint.description.trim()
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    const session = this.getSession();

    if (!session) {
      alert('Please log in before submitting a complaint.');
      this.router.navigate(['/login']);
      return;
    }

    this.isSubmitting = true;

    try {
      const attachmentImages = this.selectedImages.map(image => ({
        name: image.name,
        type: image.file.type,
        dataUrl: image.preview
      }));

      const newComplaint: ComplaintRecord = {
        id: `CF-${Date.now()}`,
        subject: this.complaint.subject.trim(),
        category: this.complaint.category,
        priority: this.complaint.priority,
        location: this.complaint.location.trim(),
        description: this.complaint.description.trim(),
        status: 'Pending',
        dateSubmitted: new Date().toISOString(),
        attachmentName: attachmentImages[0]?.name || null,
        attachmentImages,
        complainant: session.fullName || this.userName,
        complainantId: String(session.id ?? ''),
        complainantEmail: String(session.email ?? ''),
        assignedStaffId: null,
        assignedStaffName: null,
        progressUpdates: [],
        resolution: '',
        resolvedAt: null
      };

      const records = this.getComplaints();
      records.unshift(newComplaint);

      localStorage.setItem('cfmsComplaints', JSON.stringify(records));

      alert('Your complaint has been submitted successfully!');

      this.complaint = {
        subject: '',
        category: '',
        priority: 'Normal',
        location: '',
        description: ''
      };

      this.selectedImages = [];

      this.router.navigate(['/my-complaints']);
    } catch {
      alert(
        'Unable to save the complaint. Storage may be full. Try fewer or smaller images.'
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  signOut(): void {
    if (confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('cfms_session');
      this.router.navigate(['/login']);
    }
  }
}
