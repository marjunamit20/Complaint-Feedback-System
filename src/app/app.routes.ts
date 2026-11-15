import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Complaints } from './pages/complaints/complaints';
import { MyComplaints } from './pages/my-complaints/my-complaints';
import { Feedback } from './pages/feedback/feedback';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { ManageComplaints } from './pages/manage-complaints/manage-complaints';
import { ManageUsers } from './pages/manage-users/manage-users';
import { AdminFeedback } from './pages/admin-feedback/admin-feedback';
import { StaffDashboard } from './pages/staff-dashboard/staff-dashboard';
import { StaffComplaints } from './pages/staff-complaints/staff-complaints';
import { StaffHistory } from './pages/staff-history/staff-history';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // AUTHENTICATION
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },

  // USER PAGES
  {
    path: 'dashboard',
    component: Dashboard
  },
  {
    path: 'complaints',
    component: Complaints
  },
  {
    path: 'my-complaints',
    component: MyComplaints
  },
  {
    path: 'feedback',
    component: Feedback
  },

  // ADMIN PAGES
  {
    path: 'admin-dashboard',
    component: AdminDashboard
  },
  {
    path: 'manage-complaints',
    component: ManageComplaints
  },
  {
    path: 'manage-users',
    component: ManageUsers
  },
  {
    path: 'admin-feedback',
    component: AdminFeedback
  },
  {
  path: 'staff-dashboard',
  component: StaffDashboard
},
{
  path: 'staff-complaints',
  component: StaffComplaints
},
{
  path: 'staff-complaints/:id',
  component: StaffComplaints
},
{
  path: 'staff-history',
  component: StaffHistory
},

  // UNKNOWN ROUTES
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
