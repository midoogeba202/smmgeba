// Google Apps Script for SMM Services Store
// Deploy this as a Web App with "Anyone" access

// Get the active spreadsheet
var ss = SpreadsheetApp.getActiveSpreadsheet();
var ordersSheet = ss.getSheetByName('Orders') || ss.insertSheet('Orders');
var usersSheet = ss.getSheetByName('Users') || ss.insertSheet('Users');
var servicesSheet = ss.getSheetByName('Services') || ss.insertSheet('Services');

// Initialize sheets with headers if empty
function initializeSheets() {
  // Orders sheet headers
  if (ordersSheet.getLastRow() === 0) {
    ordersSheet.appendRow([
      'Order ID', 'Timestamp', 'User Email', 'User Name', 'Service Type', 
      'Package', 'Target URL', 'Quantity', 'Price', 'Payment Method', 
      'Payment Status', 'Order Status', 'Payment Screenshot', 'Transaction Ref', 'Notes'
    ]);
  }
  
  // Users sheet headers
  if (usersSheet.getLastRow() === 0) {
    usersSheet.appendRow([
      'User Email', 'User Name', 'Registration Date', 'Total Orders', 'Last Login'
    ]);
  }
  
  // Services sheet headers
  if (servicesSheet.getLastRow() === 0) {
    servicesSheet.appendRow([
      'Service ID', 'Service Name', 'Service Type', 'Description', 'Price', 'Active'
    ]);
    
    // Add default services
    servicesSheet.appendRow(['1', 'متابعين إنستغرام', 'followers', '1000 متابع حقيقي', '50', 'Yes']);
    servicesSheet.appendRow(['2', 'إعجابات إنستغرام', 'likes', '1000 إعجاب', '30', 'Yes']);
    servicesSheet.appendRow(['3', 'مشاهدات يوتيوب', 'views', '10000 مشاهدة', '100', 'Yes']);
    servicesSheet.appendRow(['4', 'إدارة حسابات', 'management', 'إدارة شهرية', '200', 'Yes']);
  }
}

// Handle POST requests (form submissions)
function doPost(e) {
  try {
    var action = e.parameter.action;
    
    if (action === 'submitOrder') {
      return submitOrder(e);
    } else if (action === 'submitPayment') {
      return submitPayment(e);
    } else if (action === 'updateOrderStatus') {
      return updateOrderStatus(e);
    } else if (action === 'registerUser') {
      return registerUser(e);
    } else if (action === 'contactForm') {
      return submitContactForm(e);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (data retrieval)
function doGet(e) {
  try {
    var action = e.parameter.action;
    
    if (action === 'getUserOrders') {
      return getUserOrders(e);
    } else if (action === 'getAllOrders') {
      return getAllOrders(e);
    } else if (action === 'getServices') {
      return getServices(e);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Submit new order
function submitOrder(e) {
  var orderId = 'ORD' + new Date().getTime();
  var timestamp = new Date();
  
  ordersSheet.appendRow([
    orderId,
    timestamp,
    e.parameter.userEmail,
    e.parameter.userName,
    e.parameter.serviceType,
    e.parameter.package,
    e.parameter.targetUrl,
    e.parameter.quantity,
    e.parameter.price,
    e.parameter.paymentMethod,
    'Pending',
    'New',
    '',
    '',
    ''
  ]);
  
  // Update user's total orders
  updateUserOrders(e.parameter.userEmail);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    orderId: orderId,
    message: 'تم إرسال الطلب بنجاح'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Submit payment confirmation
function submitPayment(e) {
  var orderId = e.parameter.orderId;
  var data = ordersSheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === orderId) {
      ordersSheet.getRange(i + 1, 11).setValue('Confirmed'); // Payment Status
      ordersSheet.getRange(i + 1, 13).setValue(e.parameter.screenshot || ''); // Screenshot
      ordersSheet.getRange(i + 1, 14).setValue(e.parameter.transactionRef || ''); // Transaction Ref
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'تم تأكيد الدفع بنجاح'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: 'Order ID not found'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Update order status (admin only)
function updateOrderStatus(e) {
  var orderId = e.parameter.orderId;
  var newStatus = e.parameter.status;
  var data = ordersSheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === orderId) {
      ordersSheet.getRange(i + 1, 12).setValue(newStatus); // Order Status
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'تم تحديث حالة الطلب'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: 'Order not found'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Register or update user
function registerUser(e) {
  var email = e.parameter.email;
  var name = e.parameter.name;
  var data = usersSheet.getDataRange().getValues();
  
  // Check if user exists
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      // Update last login
      usersSheet.getRange(i + 1, 5).setValue(new Date());
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'User updated'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Add new user
  usersSheet.appendRow([email, name, new Date(), 0, new Date()]);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'User registered'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Get user orders
function getUserOrders(e) {
  var email = e.parameter.email;
  var data = ordersSheet.getDataRange().getValues();
  var orders = [];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] === email) {
      orders.push({
        orderId: data[i][0],
        timestamp: data[i][1],
        serviceType: data[i][4],
        package: data[i][5],
        price: data[i][8],
        paymentMethod: data[i][9],
        paymentStatus: data[i][10],
        orderStatus: data[i][11]
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    orders: orders
  })).setMimeType(ContentService.MimeType.JSON);
}

// Get all orders (admin only)
function getAllOrders(e) {
  var data = ordersSheet.getDataRange().getValues();
  var orders = [];
  
  for (var i = 1; i < data.length; i++) {
    orders.push({
      orderId: data[i][0],
      timestamp: data[i][1],
      userEmail: data[i][2],
      userName: data[i][3],
      serviceType: data[i][4],
      package: data[i][5],
      targetUrl: data[i][6],
      quantity: data[i][7],
      price: data[i][8],
      paymentMethod: data[i][9],
      paymentStatus: data[i][10],
      orderStatus: data[i][11],
      screenshot: data[i][12],
      transactionRef: data[i][13]
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    orders: orders
  })).setMimeType(ContentService.MimeType.JSON);
}

// Get services
function getServices(e) {
  var data = servicesSheet.getDataRange().getValues();
  var services = [];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][5] === 'Yes') {
      services.push({
        id: data[i][0],
        name: data[i][1],
        type: data[i][2],
        description: data[i][3],
        price: data[i][4]
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    services: services
  })).setMimeType(ContentService.MimeType.JSON);
}

// Submit contact form
function submitContactForm(e) {
  var contactSheet = ss.getSheetByName('Contact') || ss.insertSheet('Contact');
  
  if (contactSheet.getLastRow() === 0) {
    contactSheet.appendRow(['Timestamp', 'Name', 'Email', 'Subject', 'Message']);
  }
  
  contactSheet.appendRow([
    new Date(),
    e.parameter.name,
    e.parameter.email,
    e.parameter.subject,
    e.parameter.message
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'تم إرسال رسالتك بنجاح'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Helper: Update user's total orders
function updateUserOrders(email) {
  var data = usersSheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      var currentTotal = data[i][3] || 0;
      usersSheet.getRange(i + 1, 4).setValue(currentTotal + 1);
      return;
    }
  }
}
