
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  dateJoined: string;
  status: string;
  password?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.css'
})
export class ManageUsers implements OnInit {
  users: ManagedUser[] = [];

  searchText = '';
  roleFilter = 'All';
  statusFilter = 'All';
  notice = '';

  private readonly userKeys = ['cfms_users', 'users'];

  ngOnInit(): void {
    this.loadUsers();
  }

  // Refresh when another tab changes localStorage.
  @HostListener('window:storage')
  onStorageChange(): void {
    this.loadUsers();
  }

  private readArray(key: string): any[] {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  private normalizeRole(role: unknown): string {
    const value = String(role || 'Complainant')
      .trim()
      .toLowerCase();

    if (value === 'admin' || value === 'administrator') {
      return 'Administrator';
    }

    if (value === 'staff') {
      return 'Staff';
    }

    return 'Complainant';
  }

  private normalizeStatus(status: unknown): string {
    const value = String(status || 'Active').trim().toLowerCase();
    return value === 'inactive' ? 'Inactive' : 'Active';
  }

  loadUsers(): void {
    const combined: ManagedUser[] = [];
    const seenEmails = new Set<string>();
    const seenIds = new Set<string>();

    for (const key of this.userKeys) {
      const records = this.readArray(key);

      for (const record of records) {
        if (!record || typeof record !== 'object') {
          continue;
        }

        const email = String(record.email || '').trim();
        if (!email) {
          continue;
        }

        const normalizedEmail = email.toLowerCase();

        // Avoid displaying the same account twice if it exists in both keys.
        if (seenEmails.has(normalizedEmail)) {
          const existing = combined.find(
            user => user.email.toLowerCase() === normalizedEmail
          );

          if (existing && String(record.status || '').toLowerCase() === 'inactive') {
            existing.status = 'Inactive';
          }

          continue;
        }

        seenEmails.add(normalizedEmail);

        const id = String(
          record.id ??
          record.userId ??
          `user-${normalizedEmail}`
        );

        seenIds.add(id);

        combined.push({
          ...record,
          id,
          name: String(
            record.fullName ||
            record.name ||
            record.username ||
            email.split('@')[0]
          ),
          email,
          role: this.normalizeRole(record.role),
          dateJoined: String(
            record.dateJoined ||
            record.createdAt ||
            record.registeredAt ||
            '—'
          ),
          status: this.normalizeStatus(
            record.status || record.accountStatus
          )
        });
      }
    }

    this.users = combined;
  }

  get filteredUsers(): ManagedUser[] {
    const search = this.searchText.trim().toLowerCase();

    return this.users.filter(user => {
      const matchesSearch =
        !search ||
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.role.toLowerCase().includes(search) ||
        user.id.toLowerCase().includes(search);

      const matchesRole =
        this.roleFilter === 'All' ||
        user.role === this.roleFilter;

      const matchesStatus =
        this.statusFilter === 'All' ||
        user.status === this.statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  get activeCount(): number {
    return this.users.filter(user => user.status === 'Active').length;
  }

  get inactiveCount(): number {
    return this.users.filter(user => user.status === 'Inactive').length;
  }

  get complainantCount(): number {
    return this.users.filter(user => user.role === 'Complainant').length;
  }

  clearFilters(): void {
    this.searchText = '';
    this.roleFilter = 'All';
    this.statusFilter = 'All';
  }

  updateStatus(user: ManagedUser, status: 'Active' | 'Inactive'): void {
    if (user.role === 'Administrator') {
      this.notice = 'Administrator accounts cannot be changed here.';
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${status === 'Active' ? 'activate' : 'deactivate'} ${user.name}'s account?`
    );

    if (!confirmed) {
      return;
    }

    this.updateStoredAccount(user, record => ({
      ...record,
      status,
      accountStatus: status
    }));

    this.loadUsers();
    this.notice = `${user.name}'s account is now ${status.toLowerCase()}.`;
  }

  deleteUser(user: ManagedUser): void {
    if (user.role === 'Administrator') {
      this.notice = 'Administrator accounts cannot be deleted here.';
      return;
    }

    const confirmed = window.confirm(
      `Delete the account for ${user.name} (${user.email})? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    for (const key of this.userKeys) {
      const records = this.readArray(key);
      const remaining = records.filter(record => {
        const email = String(record?.email || '').toLowerCase();
        const id = String(record?.id ?? record?.userId ?? '');

        return email !== user.email.toLowerCase() && id !== user.id;
      });

      localStorage.setItem(key, JSON.stringify(remaining));
    }

    this.loadUsers();
    this.notice = `The account for ${user.name} was deleted from this browser's stored user lists.`;
  }

  private updateStoredAccount(
    user: ManagedUser,
    update: (record: any) => any
  ): void {
    for (const key of this.userKeys) {
      const records = this.readArray(key);

      const updated = records.map(record => {
        const email = String(record?.email || '').toLowerCase();
        const id = String(record?.id ?? record?.userId ?? '');

        if (email === user.email.toLowerCase() || id === user.id) {
          return update(record);
        }

        return record;
      });

      localStorage.setItem(key, JSON.stringify(updated));
    }
  }
}
