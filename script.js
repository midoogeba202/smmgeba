// Configuration - Replace with your Google Apps Script Web App URL
const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

// Google Sign-In Configuration
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';

// Initialize Google Sign-In
function initGoogleSignIn() {
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse
  });
}

// Handle Google Sign-In Response
function handleCredentialResponse(response) {
  const responsePayload = parseJwt(response.credential);
  
  const user = {
    email: responsePayload.email,
    name: responsePayload.name,
    picture: responsePayload.picture
  };
  
  // Store user in localStorage
  localStorage.setItem('user', JSON.stringify(user));
  
  // Register user in Google Sheets
  registerUser(user);
  
  // Redirect or update UI
  updateAuthUI();
}

// Parse JWT token
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  
  return JSON.parse(jsonPayload);
}

// Register user in Google Sheets
async function registerUser(user) {
  try {
    const formData = new FormData();
    formData.append('action', 'registerUser');
    formData.append('email', user.email);
    formData.append('name', user.name);
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    console.log('User registered:', data);
  } catch (error) {
    console.error('Error registering user:', error);
  }
}

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('user') !== null;
}

// Get current user
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Logout
function logout() {
  localStorage.removeItem('user');
  google.accounts.id.disableAutoSelect();
  window.location.href = 'index.html';
}

// Update UI based on auth state
function updateAuthUI() {
  const user = getCurrentUser();
  const authButtons = document.querySelectorAll('.auth-buttons');
  const userProfile = document.querySelectorAll('.user-profile');
  
  if (user) {
    authButtons.forEach(el => el.style.display = 'none');
    userProfile.forEach(el => {
      el.style.display = 'flex';
      el.innerHTML = `
        <img src="${user.picture}" alt="${user.name}" class="user-avatar">
        <div class="user-info">
          <h3>${user.name}</h3>
          <p>${user.email}</p>
        </div>
        <button onclick="logout()" class="btn btn-secondary">تسجيل الخروج</button>
      `;
    });
  } else {
    authButtons.forEach(el => el.style.display = 'block');
    userProfile.forEach(el => el.style.display = 'none');
  }
}

// Require authentication for protected pages
function requireAuth() {
  if (!isLoggedIn()) {
    alert('يجب تسجيل الدخول أولاً');
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// Submit Order
async function submitOrder(orderData) {
  try {
    showLoading();
    
    const user = getCurrentUser();
    const formData = new FormData();
    formData.append('action', 'submitOrder');
    formData.append('userEmail', user.email);
    formData.append('userName', user.name);
    formData.append('serviceType', orderData.serviceType);
    formData.append('package', orderData.package);
    formData.append('targetUrl', orderData.targetUrl);
    formData.append('quantity', orderData.quantity);
    formData.append('price', orderData.price);
    formData.append('paymentMethod', orderData.paymentMethod);
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    hideLoading();
    
    if (data.status === 'success') {
      showAlert('success', `تم إرسال الطلب بنجاح! رقم الطلب: ${data.orderId}`);
      
      // Redirect to payment confirmation
      setTimeout(() => {
        window.location.href = `payment-confirm.html?orderId=${data.orderId}`;
      }, 2000);
    } else {
      showAlert('error', 'حدث خطأ في إرسال الطلب');
    }
  } catch (error) {
    hideLoading();
    showAlert('error', 'حدث خطأ في الاتصال');
    console.error('Error submitting order:', error);
  }
}

// Get User Orders
async function getUserOrders() {
  try {
    const user = getCurrentUser();
    const url = `${SCRIPT_URL}?action=getUserOrders&email=${encodeURIComponent(user.email)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.orders;
    } else {
      throw new Error('Failed to fetch orders');
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

// Get All Orders (Admin)
async function getAllOrders() {
  try {
    const url = `${SCRIPT_URL}?action=getAllOrders`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.orders;
    } else {
      throw new Error('Failed to fetch orders');
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

// Update Order Status (Admin)
async function updateOrderStatus(orderId, status) {
  try {
    const formData = new FormData();
    formData.append('action', 'updateOrderStatus');
    formData.append('orderId', orderId);
    formData.append('status', status);
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      showAlert('success', 'تم تحديث حالة الطلب بنجاح');
      return true;
    } else {
      showAlert('error', 'حدث خطأ في تحديث الطلب');
      return false;
    }
  } catch (error) {
    console.error('Error updating order:', error);
    showAlert('error', 'حدث خطأ في الاتصال');
    return false;
  }
}

// Submit Payment Confirmation
async function submitPayment(paymentData) {
  try {
    showLoading();
    
    const formData = new FormData();
    formData.append('action', 'submitPayment');
    formData.append('orderId', paymentData.orderId);
    formData.append('screenshot', paymentData.screenshot || '');
    formData.append('transactionRef', paymentData.transactionRef || '');
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    hideLoading();
    
    if (data.status === 'success') {
      showAlert('success', 'تم تأكيد الدفع بنجاح! سيتم مراجعة طلبك قريباً');
      setTimeout(() => {
        window.location.href = 'account.html';
      }, 2000);
    } else {
      showAlert('error', 'حدث خطأ في تأكيد الدفع');
    }
  } catch (error) {
    hideLoading();
    showAlert('error', 'حدث خطأ في الاتصال');
    console.error('Error submitting payment:', error);
  }
}

// Get Services
async function getServices() {
  try {
    const url = `${SCRIPT_URL}?action=getServices`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.services;
    } else {
      throw new Error('Failed to fetch services');
    }
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

// Submit Contact Form
async function submitContactForm(contactData) {
  try {
    showLoading();
    
    const formData = new FormData();
    formData.append('action', 'contactForm');
    formData.append('name', contactData.name);
    formData.append('email', contactData.email);
    formData.append('subject', contactData.subject);
    formData.append('message', contactData.message);
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    hideLoading();
    
    if (data.status === 'success') {
      showAlert('success', 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً');
      return true;
    } else {
      showAlert('error', 'حدث خطأ في إرسال الرسالة');
      return false;
    }
  } catch (error) {
    hideLoading();
    showAlert('error', 'حدث خطأ في الاتصال');
    console.error('Error submitting contact form:', error);
    return false;
  }
}

// UI Helper Functions
function showLoading() {
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-overlay';
  loadingDiv.innerHTML = '<div class="spinner"></div>';
  loadingDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;
  document.body.appendChild(loadingDiv);
}

function hideLoading() {
  const loadingDiv = document.getElementById('loading-overlay');
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

function showAlert(type, message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'error'}`;
  alertDiv.textContent = message;
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    left: 20px;
    max-width: 500px;
    margin: 0 auto;
    z-index: 10000;
    animation: fadeInUp 0.3s ease;
  `;
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => alertDiv.remove(), 300);
  }, 5000);
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format price
function formatPrice(price) {
  return `${price} جنيه`;
}

// Get status badge HTML
function getStatusBadge(status) {
  const statusMap = {
    'New': { class: 'badge-info', text: 'جديد' },
    'Processing': { class: 'badge-warning', text: 'قيد المعالجة' },
    'Completed': { class: 'badge-success', text: 'مكتمل' },
    'Cancelled': { class: 'badge-danger', text: 'ملغي' },
    'Pending': { class: 'badge-warning', text: 'في الانتظار' },
    'Confirmed': { class: 'badge-success', text: 'مؤكد' }
  };
  
  const badge = statusMap[status] || { class: 'badge-info', text: status };
  return `<span class="badge ${badge.class}">${badge.text}</span>`;
}

// Get service name in Arabic
function getServiceNameAr(serviceType) {
  const serviceMap = {
    'followers': 'متابعين',
    'likes': 'إعجابات',
    'views': 'مشاهدات',
    'management': 'إدارة حسابات'
  };
  
  return serviceMap[serviceType] || serviceType;
}

// Mobile menu toggle
function toggleMobileMenu() {
  const nav = document.querySelector('nav ul');
  nav.classList.toggle('active');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Google Sign-In if available
  if (typeof google !== 'undefined' && google.accounts) {
    initGoogleSignIn();
  }
  
  // Update auth UI
  updateAuthUI();
  
  // Add mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMobileMenu);
  }
});

// Fade out animation for alerts
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
`;
document.head.appendChild(style);
