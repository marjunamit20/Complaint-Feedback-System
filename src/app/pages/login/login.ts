
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

type CFMSRole = 'complainant' | 'staff' | 'administrator';

interface CFMSUser {
  id: number | string;
  fullName?: string;
  name?: string;
  email: string;
  password: string;
  role: CFMSRole;
  status?: string;
  accountStatus?: string;
}

interface CFMSSession {
  id: number | string;
  fullName: string;
  email: string;
  role: CFMSRole;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;

  private readonly adminAccount: CFMSUser = {
    id: 1,
    fullName: 'CFMS Administrator',
    email: 'admin@cfms.com',
    password: 'Admin@123',
    role: 'administrator'
  };

  private readonly staffAccount: CFMSUser = {
    id: 2,
    fullName: 'CFMS Staff',
    email: 'staff@cfms.com',
    password: 'Staff@123',
    role: 'staff'
  };

  constructor(private router: Router) {}

  onLogin(): void {
    if (this.isLoading) {
      return;
    }

    const email = this.email.trim().toLowerCase();

    if (!email || !this.password) {
      alert('Please enter your email and password.');
      return;
    }

    let registeredUsers: CFMSUser[] = [];

    try {
      const storedUsers = localStorage.getItem('cfms_users');
      const parsedUsers: unknown = storedUsers
        ? JSON.parse(storedUsers)
        : [];

      if (Array.isArray(parsedUsers)) {
        registeredUsers = parsedUsers;
      }
    } catch {
      alert('Unable to read registered accounts.');
      return;
    }

    const privilegedAccounts = [
      this.adminAccount,
      this.staffAccount
    ];

    const privilegedUser = privilegedAccounts.find(
      user =>
        user.email.toLowerCase() === email &&
        user.password === this.password
    );

    const registeredUser = registeredUsers.find(
      user =>
        user.email?.trim().toLowerCase() === email &&
        user.password === this.password
    );

    // Hardcoded Admin and Staff accounts take precedence.
    const user = privilegedUser || registeredUser;

    if (!user) {
      alert('Invalid email or password. Please try again.');
      return;
    }

    // Do not allow login to a deactivated registered account.
    if (!privilegedUser) {
      const status = String(
        user.status || user.accountStatus || 'Active'
      ).toLowerCase();

      if (status === 'inactive') {
        alert('Your account is inactive. Please contact the administrator.');
        return;
      }
    }

    if (
      user.role !== 'complainant' &&
      user.role !== 'staff' &&
      user.role !== 'administrator'
    ) {
      alert('This account has an invalid role.');
      return;
    }

    const session: CFMSSession = {
      id: user.id,
      fullName: user.fullName || user.name || user.email,
      email: user.email,
      role: user.role
    };

    localStorage.setItem('cfms_session', JSON.stringify(session));

    const routes: Record<CFMSRole, string> = {
      complainant: '/dashboard',
      staff: '/staff-dashboard',
      administrator: '/admin-dashboard'
    };

    this.router.navigateByUrl(routes[user.role]);
  }
}
