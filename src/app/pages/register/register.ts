
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface CFMSUser {
  id: number;
  fullName: string;
  email: string;
  password: string;
  role: 'complainant';
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  loading = false;

  constructor(private router: Router) {}

  onRegister(): void {
    const name = this.fullName.trim();
    const email = this.email.trim().toLowerCase();

    if (!name || !email || !this.password || !this.confirmPassword) {
      alert('Please complete all fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (this.password.length < 8) {
      alert('Password must contain at least 8 characters.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const users: CFMSUser[] = JSON.parse(
      localStorage.getItem('cfms_users') || '[]'
    );

    if (users.some(user => user.email === email)) {
      alert('This email is already registered.');
      return;
    }

    const newUser: CFMSUser = {
      id: Date.now(),
      fullName: name,
      email,
      password: this.password,
      role: 'complainant'
    };

    users.push(newUser);
    localStorage.setItem('cfms_users', JSON.stringify(users));

    alert('Account created successfully! Please sign in.');
    this.router.navigate(['/login']);
  }
}
