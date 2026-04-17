const Contact = require('../models/Contact');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Mock data for support and jobs
const supportContent = {
  'order-tracking': {
    title: 'Order Tracking',
    sections: [
      { id: 1, title: 'How to track?', content: 'You can track your order using the tracking ID sent to your email.' },
      { id: 2, title: 'Delivery Status', content: 'Our delivery partners update the status every 24 hours.' }
    ]
  },
  'shipping-policy': {
    title: 'Shipping Policy',
    sections: [
      { id: 1, title: 'Shipping Time', content: 'We deliver within 3-5 business days.' },
      { id: 2, title: 'Shipping Charges', content: 'Free shipping on orders above ₹500.' }
    ]
  },
  'return-policy': {
    title: 'Return Policy',
    sections: [
      { id: 1, title: 'Easy Returns', content: 'You can return products within 15 days of delivery.' },
      { id: 2, title: 'Refund Process', content: 'Refunds are processed within 7-10 business days.' }
    ]
  },
  'faqs': {
    title: 'Frequently Asked Questions',
    sections: [
      { id: 1, title: 'Is Nykaa Clone safe?', content: 'Yes, we use industry-standard encryption for all transactions.' },
      { id: 2, title: 'Do you sell authentic products?', content: 'All our products are 100% authentic and sourced directly from brands.' }
    ]
  }
};

const jobListings = [
  { id: 1, title: 'Frontend Developer', department: 'Engineering', location: 'Remote / Mumbai' },
  { id: 2, title: 'Product Manager', department: 'Product', location: 'Bangalore' },
  { id: 3, title: 'Customer Support Lead', department: 'Operations', location: 'Mumbai' }
];

// @desc    Newsletter subscription
// @route   POST /api/newsletter
const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  
  // In a real app, save to DB
  console.log(`Newsletter subscription: ${email}`);
  res.status(200).json({ success: true, message: 'Successfully subscribed to newsletter!' });
};

// @desc    Get support content
// @route   GET /api/support/:type
const getSupportContent = async (req, res) => {
  const { type } = req.params;
  const content = supportContent[type];
  if (!content) return res.status(404).json({ message: 'Content not found' });
  res.status(200).json(content);
};

// @desc    Get job listings
// @route   GET /api/jobs
const getJobs = async (req, res) => {
  res.status(200).json(jobListings);
};

// @desc    Contact form submission
// @route   POST /api/contact
const submitContactForm = async (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    // 1. Save to Database
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // 2. Setup Email Notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Sending to admin email
      subject: `New Contact Form Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #db2777;">New Contact Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`Contact stored and email sent: ${name}`);
    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully! Redirecting to WhatsApp...' 
    });
  } catch (error) {
    console.error('Contact Form Error:', error);
    res.status(500).json({ message: 'Failed to process request, but please try WhatsApp.' });
  }
};

// @desc    Get Admin Contact for WhatsApp
// @route   GET /api/main/admin-contact
const getAdminContact = async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
    if (!admin) {
      return res.status(200).json({ 
        phone: "917857873455", // Fallback
        email: "support@nykaaclone.com" 
      });
    }
    res.status(200).json({ 
      phone: admin.phone || "917857873455",
      email: admin.email 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching admin info' });
  }
};

module.exports = {
  subscribeNewsletter,
  getSupportContent,
  getJobs,
  submitContactForm,
  getAdminContact
};
