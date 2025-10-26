import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  Stack,
  Grid,
  Chip,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Tabs,
  Tab,
  TablePagination,
  InputAdornment,
  Avatar,
} from '@mui/material';
import {
  Delete,
  Add,
  ContentCopy,
  Sms,
  Phone,
  Edit,
  Refresh,
  CloudUpload,
  Download,
  Search,
  Email,
  Person,
  School,
  WhatsApp
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import PageContainer from 'src/components/container/PageContainer';

const UserManagement = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCSVDialog, setOpenCSVDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [sendingSMS, setSendingSMS] = useState({});
  const [error, setError] = useState('');
  const [autoSendSMS, setAutoSendSMS] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [csvFile, setCsvFile] = useState(null);
  const [csvResults, setCsvResults] = useState(null);

  // Table states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: ''
  });

  const [editingUser, setEditingUser] = useState({
    _id: '',
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: ''
  });

  const [userPasswords, setUserPasswords] = useState({});

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);

        const passwords = {};
        data.forEach(user => {
          if (!userPasswords[user._id]) {
            passwords[user._id] = generateSimplePassword();
          }
        });
        setUserPasswords(prev => ({ ...prev, ...passwords }));
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.role === 'teacher') {
      fetchUsers();
    }
  }, [userInfo]);

  // Generate simple User ID
  const generateUserId = (name) => {
    const cleanName = name.replace(/\s+/g, '').toLowerCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${cleanName}${randomNum}`;
  };

  // Generate simple password
  const generateSimplePassword = () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    let password = '';

    for (let i = 0; i < 3; i++) {
      password += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 3; i++) {
      password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return password;
  };

  // Table pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Paginate users
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Get user initials for avatar
  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'teacher': return 'primary';
      case 'student': return 'success';
      default: return 'default';
    }
  };

  // CSV Template Download Function
  const downloadCSVTemplate = () => {
    const template = `Full Name,Email Address,Phone Number (WhatsApp),University/Institution,Department/Program,Academic Year
John Doe,john@example.com,03001234567,Mehran University,Computer Science,2nd Year
Jane Smith,jane@example.com,03009876543,Sindh University,Cyber Security,3rd Year

Your CSV Format is Supported!
The system will automatically detect these columns from your Google Forms export:
• Full Name (Required)
• Email Address (Required) 
• Phone Number (WhatsApp) (Required)
• University / Institution
• Department / Program
• Academic Year / Experience Level

User IDs and passwords will be auto-generated!`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hackathon_user_upload_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // CSV File Handling
  const handleCSVFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setCsvFile(file);
        setError('');
      } else {
        setError('Please select a valid CSV file');
        setCsvFile(null);
      }
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      setError('Please select a CSV file to upload');
      return;
    }

    try {
      setCsvLoading(true);
      const formData = new FormData();
      formData.append('usersFile', csvFile);

      const response = await fetch('/api/users/upload-csv', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setCsvResults(data);

        if (data.successCount > 0) {
          toast.success(
            <Box>
              <Typography variant="body2"><strong>CSV Upload Successful!</strong></Typography>
              <Typography variant="body2">Created {data.successCount} users</Typography>
              {data.errors && data.errors.length > 0 && (
                <Typography variant="body2" color="warning.main">
                  {data.errors.length} errors occurred
                </Typography>
              )}
            </Box>,
            { autoClose: 8000 }
          );
        }

        // Update passwords for newly created users
        if (data.createdUsers) {
          const newPasswords = {};
          data.createdUsers.forEach(user => {
            newPasswords[user._id] = user.generatedPassword;
          });
          setUserPasswords(prev => ({ ...prev, ...newPasswords }));
        }

        fetchUsers(); // Refresh the user list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload CSV');
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error(error.message);
    } finally {
      setCsvLoading(false);
    }
  };

  const downloadUsersWithPasswords = async () => {
    try {
      const response = await fetch('/api/users/with-passwords', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();

        // Convert to CSV
        const csvContent = [
          ['User ID', 'Name', 'Email', 'Role', 'Password', 'Phone', 'University', 'Department', 'Created At'],
          ...data.users.map(user => [
            user.userId,
            user.name,
            user.email,
            user.role,
            user.generatedPassword,
            user.phone,
            user.university,
            user.department,
            new Date(user.createdAt).toLocaleDateString()
          ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `users_with_passwords_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);

        toast.success('Users data downloaded successfully');
      } else {
        throw new Error('Failed to download users data');
      }
    } catch (error) {
      console.error('Error downloading users:', error);
      toast.error('Failed to download users data');
    }
  };

  // Auto-generate credentials
  const handleNameChange = (name) => {
    if (name.trim().length > 0) {
      const userId = generateUserId(name);
      const password = generateSimplePassword();

      setNewUser({
        ...newUser,
        name: name,
        email: `${userId}@cyberarena.com`,
        password: password
      });
    } else {
      setNewUser({
        ...newUser,
        name: name,
        email: '',
        password: ''
      });
    }
  };

  // Send Credentials via WhatsApp
  const sendWhatsApp = (user) => {
    const message = `🎯 *CyberArena Login Credentials* 🎯

👤 *User Details:*
• Name: ${user.name}
• User ID: ${user.email}
• Password: ${userPasswords[user._id] || 'Please generate password first'}
• Role: ${user.role}

🔐 *Login Instructions:*
1. Visit: ${window.location.origin}/auth/login
2. Use your User ID and Password above
3. Change your password after first login

📱 *Need Help?*
Contact your administrator for support.

_Keep your credentials secure and don't share them with anyone._`;

    // Format phone number for WhatsApp
    const formatPhone = (phone) => {
      let cleanPhone = phone.replace(/\s+|[-+]/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '92' + cleanPhone.substring(1);
      } else if (!cleanPhone.startsWith('92')) {
        cleanPhone = '92' + cleanPhone;
      }
      return cleanPhone;
    };

    const formattedPhone = formatPhone(user.phone);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    return { success: true, message: 'WhatsApp opened' };
  };

  // Handle WhatsApp send with loading state
  const handleSendWhatsApp = (user) => {
    if (!user.phone) {
      toast.error('No phone number available for this user');
      return;
    }

    if (!userPasswords[user._id]) {
      toast.error('Please generate a password first');
      return;
    }

    // Set loading state
    setSendingSMS(prev => ({ ...prev, [user._id]: true }));

    // Send via WhatsApp
    const result = sendWhatsApp(user);

    toast.success(
      <Box>
        <Typography variant="body2">✓ WhatsApp opened for {user.phone}</Typography>
        <Typography variant="body2" color="info.main">
          Credentials ready to send
        </Typography>
      </Box>,
      { autoClose: 5000 }
    );

    setTimeout(() => {
      setSendingSMS(prev => ({ ...prev, [user._id]: false }));
    }, 2000);
  };

  // Send SMS via Browser SMS
  const sendBrowserSMS = (user) => {
    const message = `CyberArena Login Credentials:\n\nUser ID: ${user.email}\nPassword: ${user.password}\n\nLogin: ${window.location.origin}/auth/login\n\nKeep your credentials secure.`;

    const formatPhone = (phone) => {
      let cleanPhone = phone.replace(/\s+|[-+]/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '92' + cleanPhone.substring(1);
      } else if (!cleanPhone.startsWith('92')) {
        cleanPhone = '92' + cleanPhone;
      }
      return cleanPhone;
    };

    const formattedPhone = formatPhone(user.phone);
    const smsUrl = `sms:${formattedPhone}?body=${encodeURIComponent(message)}`;

    // Open browser SMS
    window.open(smsUrl, '_blank');
    return { success: true, message: 'Browser SMS opened' };
  };

  // Handle create new user with SMS
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role || !newUser.phone) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const data = await response.json();

        // Store password for display
        setUserPasswords(prev => ({
          ...prev,
          [data._id]: newUser.password
        }));

        
        // Auto-send WhatsApp if enabled
        if (autoSendSMS && newUser.phone) {
          setSendingSMS(prev => ({ ...prev, [data._id]: true }));

          // Create user object with password for WhatsApp
          const userWithPassword = {
            ...newUser,
            _id: data._id,
            password: newUser.password
          };

          setTimeout(() => {
            sendWhatsApp(userWithPassword);
            setSendingSMS(prev => ({ ...prev, [data._id]: false }));
          }, 1000);

          toast.success(
            <Box>
              <Typography variant="body2"><strong>User created successfully!</strong></Typography>
              <Typography variant="body2">✓ WhatsApp opened for {newUser.phone}</Typography>
            </Box>,
            { autoClose: 8000 }
          );

        } else {
          toast.success(
            <Box>
              <Typography variant="body2"><strong>User created successfully!</strong></Typography>
              <Typography variant="body2">User ID: {newUser.email}</Typography>
              <Typography variant="body2">Password: {newUser.password}</Typography>
            </Box>,
            { autoClose: 8000 }
          );
        }

        setOpenDialog(false);
        setNewUser({ name: '', email: '', password: '', role: 'student', phone: '' });
        setError('');
        fetchUsers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // One-click SMS for existing users
  const handleOneClickSMS = (user) => {
    if (!user.phone) {
      toast.error('No phone number available for this user');
      return;
    }

    setSendingSMS(prev => ({ ...prev, [user._id]: true }));

    const tempPassword = generateSimplePassword();
    setUserPasswords(prev => ({
      ...prev,
      [user._id]: tempPassword
    }));

    // Update password in backend
    updateUserPassword(user._id, tempPassword);

    // Send via browser SMS
    const userWithPassword = { ...user, password: tempPassword };
    const result = sendBrowserSMS(userWithPassword);

    toast.success(
      <Box>
        <Typography variant="body2">✓ Browser SMS opened for {user.phone}</Typography>
        <Typography variant="body2"><strong>New Password: {tempPassword}</strong></Typography>
        <Typography variant="body2" color="info.main">
          User must use this new password to login
        </Typography>
      </Box>,
      { autoClose: 8000 }
    );

    setTimeout(() => {
      setSendingSMS(prev => ({ ...prev, [user._id]: false }));
    }, 2000);
  };

  // Update user password in backend
  const updateUserPassword = async (userId, newPassword) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password: newPassword }),
      });
    } catch (error) {
      console.error('Failed to update password:', error);
    }
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || ''
    });
    setOpenEditDialog(true);
  };

  // Handle update user
  const handleUpdateUser = async () => {
    if (!editingUser.name || !editingUser.email || !editingUser.role || !editingUser.phone) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          password: editingUser.password || undefined,
          role: editingUser.role,
          phone: editingUser.phone
        }),
      });

      if (response.ok) {
        toast.success('User updated successfully');
        setOpenEditDialog(false);
        setEditingUser({ _id: '', name: '', email: '', password: '', role: 'student', phone: '' });
        fetchUsers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user: ${userName}?`)) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          setUserPasswords(prev => {
            const newPasswords = { ...prev };
            delete newPasswords[userId];
            return newPasswords;
          });
          toast.success('User deleted successfully');
          fetchUsers();
        } else {
          throw new Error('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    if (!text) {
      toast.error('Nothing to copy');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    });
  };

  // Regenerate password
  const regeneratePassword = (user) => {
    const newPassword = generateSimplePassword();
    setUserPasswords(prev => ({
      ...prev,
      [user._id]: newPassword
    }));
    updateUserPassword(user._id, newPassword);

    toast.success(
      <Box>
        <Typography variant="body2">New password for {user.name}</Typography>
        <Typography variant="body2"><strong>Password: {newPassword}</strong></Typography>
      </Box>,
      { autoClose: 8000 }
    );
  };

  if (userInfo?.role !== 'teacher') {
    return (
      <PageContainer title="Access Denied" description="Access denied page">
        <Box>
          <Alert severity="error">You are not authorized to access this page.</Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="User Management" description="Manage system users">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              {/* Header Section */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h4" gutterBottom fontWeight="600">
                    User Management
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Manage all system users and their credentials
                  </Typography>
                </Box>
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    onClick={() => setOpenCSVDialog(true)}
                  >
                    Upload CSV
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog(true)}
                  >
                    Add New User
                  </Button>
                </Box>
              </Box>

              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Total Users Card */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography variant="h6" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                        Total Users
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {users.length}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          All registered users
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                      }}
                    />
                  </Card>
                </Grid>

                {/* Students Card */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      color: 'white',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography variant="h6" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                        Students
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {users.filter(u => u.role === 'student').length}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <School sx={{ fontSize: 18, opacity: 0.8 }} />
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Learning participants
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                      }}
                    />
                  </Card>
                </Grid>

                {/* Teachers Card */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
                      color: 'white',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography variant="h6" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                        Teachers
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {users.filter(u => u.role === 'teacher').length}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Person sx={{ fontSize: 18, opacity: 0.8 }} />
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Educators & admins
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                      }}
                    />
                  </Card>
                </Grid>

                {/* Users with Phone Card */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)',
                      color: 'white',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography variant="h6" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                        With Phone
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {users.filter(u => u.phone).length}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Phone sx={{ fontSize: 18, opacity: 0.8 }} />
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          SMS enabled users
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                      }}
                    />
                  </Card>
                </Grid>

                {/* WhatsApp Enabled Users Card */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography variant="h6" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                        WhatsApp Ready
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {users.filter(u => u.phone).length}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WhatsApp sx={{ fontSize: 18, opacity: 0.8 }} />
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Can send credentials
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                      }}
                    />
                  </Card>
                </Grid>
              </Grid>
              {/* Filters and Search */}
              <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                <TextField
                  placeholder="Search users..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ minWidth: 250 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  select
                  size="small"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="student">Students</MenuItem>
                  <MenuItem value="teacher">Teachers</MenuItem>
                </TextField>
                <Box flexGrow={1} />
                <Typography variant="body2" color="textSecondary" sx={{ alignSelf: 'center' }}>
                  Showing {filteredUsers.length} of {users.length} users
                </Typography>
              </Box>

              {/* Main Table */}
              <TableContainer
                component={Paper}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', py: 2 }}>USER</TableCell>
                      <TableCell sx={{ fontWeight: '600', py: 2 }}>USER ID</TableCell>
                      <TableCell sx={{ fontWeight: '600', py: 2 }}>CONTACT</TableCell>
                      <TableCell sx={{ fontWeight: '600', py: 2 }}>ROLE</TableCell>
                      <TableCell sx={{ fontWeight: '600', py: 2, textAlign: 'center' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow
                        key={user._id}
                        sx={{
                          '&:hover': { bgcolor: 'action.hover' },
                          transition: 'background-color 0.2s'
                        }}
                      >
                        {/* User Column */}
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              sx={{
                                bgcolor: 'primary.main',
                                width: 40,
                                height: 40,
                                fontSize: '0.875rem'
                              }}
                            >
                              {getUserInitials(user.name)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="500">
                                {user.name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Email sx={{ fontSize: 14 }} />
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* User ID Column */}
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace" color="primary.main">
                            {user.userId}
                          </Typography>
                        </TableCell>

                        {/* Contact Column */}
                        <TableCell>
                          {user.phone ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Phone sx={{ fontSize: 16, color: 'success.main' }} />
                              <Typography variant="body2">
                                {user.phone}
                              </Typography>
                            </Box>
                          ) : (
                            <Chip label="No Phone" size="small" variant="outlined" color="warning" />
                          )}
                        </TableCell>

                        {/* Role Column */}
                        <TableCell>
                          <Chip
                            label={user.role}
                            color={getRoleColor(user.role)}
                            variant="filled"
                            size="small"
                            icon={user.role === 'teacher' ? <Person /> : <School />}
                          />
                        </TableCell>


                        {/* Actions Column */}
                        <TableCell sx={{ minWidth: 180 }}>
                          <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                            {/* Password Actions */}
                            <Box display="flex" gap={0.5} alignItems="center">
                              <Tooltip title="Generate New Password">
                                <IconButton
                                  size="small"
                                  onClick={() => regeneratePassword(user)}
                                  color="primary"
                                >
                                  <Refresh fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Copy Password">
                                <IconButton
                                  size="small"
                                  onClick={() => copyToClipboard(userPasswords[user._id])}
                                  disabled={!userPasswords[user._id]}
                                  color="secondary"
                                >
                                  <ContentCopy fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>

                            {/* Messaging Actions */}
                            <Box display="flex" gap={0.5} alignItems="center">
                              {user.phone && (
                                <>
                                  <Tooltip title="Send via WhatsApp">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleSendWhatsApp(user)}
                                      disabled={!userPasswords[user._id] || sendingSMS[user._id]}
                                      color="success"
                                      sx={{
                                        bgcolor: 'success.light',
                                        '&:hover': { bgcolor: 'success.main' },
                                        '&:disabled': { bgcolor: 'grey.300' }
                                      }}
                                    >
                                      <WhatsApp fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Send via SMS">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOneClickSMS(user)}
                                      disabled={!userPasswords[user._id] || sendingSMS[user._id]}
                                      color="info"
                                    >
                                      <Sms fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>

                            {/* User Management Actions */}
                            <Box display="flex" gap={0.5} alignItems="center">
                              <Tooltip title="Edit User">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditUser(user)}
                                  color="primary"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete User">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteUser(user._id, user.name)}
                                  disabled={user._id === userInfo._id}
                                  color="error"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ borderTop: '1px solid', borderColor: 'divider' }}
              />

              {/* Empty State */}
              {filteredUsers.length === 0 && (
                <Box textAlign="center" py={6}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No users found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {searchTerm || roleFilter !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Get started by adding your first user'
                    }
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>

        {/* Add User Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Typography variant="h5">Create New User</Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} mt={1}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Full Name"
                value={newUser.name}
                onChange={(e) => handleNameChange(e.target.value)}
                fullWidth
                required
                placeholder="Enter full name"
              />

              <Box>
                <Typography variant="subtitle2" color="textSecondary" mb={1}>
                  Auto-generated User ID
                </Typography>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="body1" fontFamily="monospace" component="span">
                    {newUser.email || 'Enter name to generate User ID'}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary" mb={1}>
                  Auto-generated Password
                </Typography>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="body1" fontFamily="monospace" component="span">
                    {newUser.password || 'Enter name to generate password'}
                  </Typography>
                </Box>
              </Box>

              <TextField
                label="Pakistani Phone Number"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                fullWidth
                required
                placeholder="03001234567 or 923001234567"
                helperText="Enter Pakistani number for SMS credentials"
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

              <TextField
                label="Assign Role"
                select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                fullWidth
                required
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
              </TextField>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={autoSendSMS}
                    onChange={(e) => setAutoSendSMS(e.target.checked)}
                    color="primary"
                  />
                }
                label="Automatically open WhatsApp after creating user"
              />
              {newUser.name && newUser.email && newUser.password && (
                <Alert severity="info">
                  <Box>
                    <Typography variant="body2"><strong>Credentials Preview:</strong></Typography>
                    <Typography variant="body2">User ID: {newUser.email}</Typography>
                    <Typography variant="body2">Password: {newUser.password}</Typography>
                    <Typography variant="body2">Phone: {newUser.phone}</Typography>
                    <Box mt={1}>
                      <Typography variant="body2" color="success.main">
                        📱 WhatsApp - Opens with pre-filled credentials message
                      </Typography>
                    </Box>
                  </Box>
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreateUser}
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* CSV Upload Dialog */}
        <Dialog open={openCSVDialog} onClose={() => setOpenCSVDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Typography variant="h5">Upload Users via CSV</Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} mt={1}>
              {error && <Alert severity="error">{error}</Alert>}

              {/* CSV Instructions */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  CSV Upload Instructions for Hackathon Data:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • Your Google Forms CSV format is fully supported<br />
                  • Required columns: Full Name, Email Address, Phone Number (WhatsApp)<br />
                  • System will auto-generate User IDs and passwords<br />
                  • All participants will be created as "student" role<br />
                  • Duplicate emails will be automatically skipped<br />
                  • Phone numbers will be used for SMS credentials
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  CSV File Requirements:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • File must be in CSV format<br />
                  • Required columns: Full Name, Email Address, Phone Number<br />
                  • Maximum file size: 5MB<br />
                  • User IDs and passwords will be auto-generated
                </Typography>
              </Box>

              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ py: 2 }}
              >
                {csvFile ? csvFile.name : 'Select CSV File'}
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={handleCSVFileChange}
                />
              </Button>

              {csvFile && (
                <Alert severity="success">
                  File selected: {csvFile.name}
                </Alert>
              )}

              <Box display="flex" gap={1}>
                <Button
                  variant="text"
                  onClick={downloadCSVTemplate}
                  size="small"
                >
                  Download Template
                </Button>
                <Button
                  variant="text"
                  onClick={downloadUsersWithPasswords}
                  size="small"
                >
                  Download Current Users
                </Button>
              </Box>

              {csvResults && (
                <Alert severity={csvResults.errors?.length > 0 ? "warning" : "success"}>
                  <Box>
                    <Typography variant="body2">
                      <strong>Upload Results:</strong>
                    </Typography>
                    <Typography variant="body2">
                      Successfully created: {csvResults.successCount} users
                    </Typography>
                    {csvResults.errors?.length > 0 && (
                      <Box mt={1}>
                        <Typography variant="body2">
                          <strong>Errors ({csvResults.errors.length}):</strong>
                        </Typography>
                        {csvResults.errors.map((error, index) => (
                          <Typography key={index} variant="body2" fontSize="0.8rem">
                            • {error}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenCSVDialog(false);
              setCsvFile(null);
              setCsvResults(null);
              setError('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleCSVUpload}
              variant="contained"
              disabled={!csvFile || csvLoading}
            >
              {csvLoading ? 'Uploading...' : 'Upload CSV'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Typography variant="h5">Edit User</Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} mt={1}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Full Name"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                fullWidth
                required
              />

              <TextField
                label="User ID (Email)"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                fullWidth
                required
                helperText="User ID cannot be changed for existing users"
                disabled
              />

              <TextField
                label="New Password (Optional)"
                type="password"
                value={editingUser.password}
                onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                fullWidth
                placeholder="Leave empty to keep current password"
                helperText="Enter new password to update, or leave empty to keep current password"
              />

              <TextField
                label="Phone Number"
                value={editingUser.phone}
                onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                fullWidth
                required
                placeholder="+1234567890 or 1234567890"
                helperText="Phone number is required for SMS features"
              />

              <TextField
                label="Role"
                select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                fullWidth
                required
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenEditDialog(false);
              setEditingUser({ _id: '', name: '', email: '', password: '', role: 'student', phone: '' });
              setError('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer >
  );
};

export default UserManagement;