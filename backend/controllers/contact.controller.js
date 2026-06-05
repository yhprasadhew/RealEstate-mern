import Contact from "../models/contact.model.js";
import sendEmail from "../utils/sendEmail.js";

// Create Contact
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, role, message } = req.body;

    // Basic field validation guardrail
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill out all required fields (Name, Email, Message)",
      });
    }

    // Creating document directly via .create()
    const contact = await Contact.create({
      name,
      email,
      phone,
      role,
      message,
    });

    // Notify Admin via Email
    const adminEmail = process.env.EMAIL_USER;

    const adminMessage = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
  <h2 style="color: #0d9488;">New Contact Request</h2>
  <p>You have received a new message from the platform.</p>
  <div style="background:#f8fafc;padding:20px;border-radius:10px;border:1px solid #e2e8f0;">
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone || "N/A"}</p>
    <p><strong>Role:</strong> ${role || "N/A"}</p>
    <p style="margin-top:15px;"><strong>Message:</strong></p>
    <p style="font-style:italic;color:#475569;">"${message}"</p>
  </div>
</div>
    `;

    try {
      await sendEmail({
        email: adminEmail,
        subject: `New Contact Message from ${name}`,
        message: adminMessage,
      });
    } catch (emailErr) {
      console.error("Admin notification email failed:", emailErr.message);
      // Fail silently for user: Do not crash response if email delivery breaks
    }

    res.status(201).json({
      success: true,
      message: "Contact message submitted successfully",
      contact,
    });
  } catch (error) {
    console.error("CREATE_CONTACT_ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Contacts (Admin)
export const getAllContacts = async (req, res) => {
  try {
    // Fixed: Using MongoDB database-level sorting instead of JS .toSorted()
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (err) {
    console.error("GET_ALL_CONTACTS_ERROR:", err);
    res.status(500).json({
      success: false,
      message: "failed to fetch contacts",
      error: err.message, // Appended to assist with backend API debugging
    });
  }
};