# 🚀 SMM Services Store - Blogger Platform

A complete social media services marketplace built entirely on Blogger platform with Google Sheets integration, Arabic interface, and no external server requirements.

## 📋 Features

### User Features
- ✅ **Arabic RTL Interface** - Beautiful, modern, and fully responsive
- ✅ **Google Sign-In** - Secure authentication
- ✅ **Service Catalog** - Followers, Likes, Views, Account Management
- ✅ **Order Management** - Track orders and status
- ✅ **Multiple Payment Methods** - Bank Transfer, Vodafone Cash, PayPal
- ✅ **Payment Confirmation** - Upload payment proof
- ✅ **Contact Form** - Direct communication

### Admin Features
- ✅ **Admin Dashboard** - Complete order management
- ✅ **Order Filtering** - By status, payment, service type
- ✅ **Status Updates** - Manually update order status
- ✅ **Statistics** - Real-time order statistics
- ✅ **Export Orders** - Download orders as CSV
- ✅ **Password Protected** - Secure admin access

### Technical Features
- ✅ **100% Free** - No hosting costs
- ✅ **No Server Required** - Runs entirely on Blogger + Google Sheets
- ✅ **Google Sheets Database** - Free, reliable data storage
- ✅ **Google Apps Script** - Backend API
- ✅ **Responsive Design** - Works on all devices
- ✅ **Dark Theme** - Modern, elegant design

## 📁 Project Structure

```
smm-store/
├── index.html              # Homepage
├── services.html           # Service request page
├── account.html            # User dashboard
├── payment-confirm.html    # Payment confirmation
├── contact.html            # Contact page
├── admin.html              # Admin panel
├── styles.css              # Stylesheet
├── script.js               # JavaScript functionality
├── apps-script.gs          # Google Apps Script backend
├── IMPLEMENTATION_GUIDE.md # Step-by-step setup guide (Arabic)
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Google Account
- Blogger blog
- Google Sheet
- Basic understanding of HTML/CSS/JS

### Installation

1. **Set up Google Sheets**
   - Create a new Google Sheet
   - Create 4 sheets: Orders, Users, Services, Contact
   - Add column headers as specified in the guide

2. **Deploy Google Apps Script**
   - Open Apps Script editor in Google Sheets
   - Copy content from `apps-script.gs`
   - Deploy as Web App
   - Copy the Web App URL

3. **Configure Google Sign-In**
   - Create Google Cloud Project
   - Enable Google Sign-In API
   - Create OAuth 2.0 Client ID
   - Copy the Client ID

4. **Update Configuration**
   - In `script.js`: Update `SCRIPT_URL` and `GOOGLE_CLIENT_ID`
   - In all HTML files: Update `data-client_id`
   - In `admin.html`: Change `ADMIN_PASSWORD`

5. **Create Blogger Pages**
   - Create a new Blogger blog
   - Create pages for each HTML file
   - Paste the HTML content
   - Publish the pages

6. **Customize**
   - Update contact information
   - Update payment details
   - Customize colors (optional)

For detailed instructions, see **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** (in Arabic)

## 🎨 Customization

### Colors
Edit CSS variables in `styles.css`:

```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #ec4899;
  /* ... */
}
```

### Services
Edit the Services sheet in Google Sheets to add/modify services.

### Payment Methods
Update payment information in:
- `services.html` (payment instructions)
- `payment-confirm.html` (payment info cards)

## 📊 Google Sheets Structure

### Orders Sheet
```
Order ID | Timestamp | User Email | User Name | Service Type | Package | 
Target URL | Quantity | Price | Payment Method | Payment Status | 
Order Status | Payment Screenshot | Transaction Ref | Notes
```

### Users Sheet
```
User Email | User Name | Registration Date | Total Orders | Last Login
```

### Services Sheet
```
Service ID | Service Name | Service Type | Description | Price | Active
```

### Contact Sheet
```
Timestamp | Name | Email | Subject | Message
```

## 🔐 Security

- Admin panel is password-protected
- Change the default password in `admin.html`
- Keep the admin page URL private
- Use HTTPS (Blogger provides this automatically)

## 🛠️ Troubleshooting

### Google Sign-In not working
- Verify Client ID is correct
- Check Authorized JavaScript origins in Google Cloud Console
- Ensure Google+ API is enabled

### Orders not saving to Google Sheets
- Verify Web App URL is correct in `script.js`
- Check Apps Script deployment permissions (set to "Anyone")
- Check browser console for errors (F12)

### Styling issues
- Ensure `styles.css` is loaded correctly
- Check CSS file path in HTML files
- Consider embedding CSS directly in HTML

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🌐 Demo

Replace with your actual blog URL after deployment:
```
https://yourstore.blogspot.com
```

## 📝 License

This project is free to use and modify for personal or commercial purposes.

## 🤝 Contributing

Feel free to fork this project and make improvements!

## 📧 Support

For issues and questions, please refer to the implementation guide or check the troubleshooting section.

## 🎯 Roadmap

Future enhancements:
- [ ] Automated payment verification
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] API integration with SMM panels

## ⭐ Credits

Built with:
- Blogger (Google)
- Google Sheets
- Google Apps Script
- Google Sign-In
- Cairo Font (Google Fonts)

---

**Made with ❤️ for the Arabic SMM community**

🌟 If you find this useful, please star the repository!
