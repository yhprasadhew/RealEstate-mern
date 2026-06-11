import React, { useEffect, useState, useCallback } from "react";
import { 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineCalendar, 
  HiOutlineInbox, 
  HiOutlineUserCircle 
} from "react-icons/hi";
import { api } from "../../context/AuthContext";
import { adminContactsStyles as s } from "../../assets/dummyStyles";

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/contact");
      if (res.data.success) {
        setContacts(res.data.contacts);
      } else {
        setError("Failed to retrieve contact submissions");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error retrieving contact entries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  if (loading && contacts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="fade-in p-6 max-w-7xl mx-auto">
      {/* Header Container */}
      <div className={s.container}>
        <h1 className={s.heading}>Contact Inbox</h1>
        <p className={s.subheading}>View feedback, questions, and inquiries sent by platform visitors</p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex justify-between">
          <span>{error}</span>
          <button onClick={fetchContacts} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* Main card wrapper */}
      <div className={s.card}>
        <div className={s.cardHeader}>
          <h2 className={s.cardTitle}>Inbox messages</h2>
          <span className="text-sm text-text-muted font-semibold">Total: {contacts.length}</span>
        </div>

        {contacts.length === 0 ? (
          <div className={s.emptyState}>
            <HiOutlineInbox size={48} className={s.emptyIcon} />
            <p>Your inbox is empty. No contact requests have been submitted yet.</p>
          </div>
        ) : (
          <div className={s.contactList}>
            {contacts.map((contact, index) => {
              const displayRole = contact.role || "visitor";
              const dateStr = contact.createdAt 
                ? new Date(contact.createdAt).toLocaleDateString() + " " + new Date(contact.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : "N/A";

              return (
                <div key={contact._id} className={s.contactItem(index, contacts.length)}>
                  <div className={s.contactHeader}>
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className={s.avatarWrapper(displayRole)}>
                        {contact.name?.[0]?.toUpperCase() || "V"}
                      </div>
                      <div>
                        {/* Name and Role Badge */}
                        <div className={s.nameBadgeContainer}>
                          <h3 className={s.name}>{contact.name}</h3>
                          <span className={s.roleBadge(displayRole)}>
                            {displayRole}
                          </span>
                        </div>
                        {/* Contact details */}
                        <div className={s.contactDetails}>
                          <div className={s.detailItem}>
                            <HiOutlineMail size={14} />
                            <span>{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className={s.detailItem}>
                              <HiOutlinePhone size={14} />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs text-text-muted mt-2 sm:mt-0">
                      <HiOutlineCalendar size={14} />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {/* Message box */}
                  <div className={s.messageBox}>
                    <p className="whitespace-pre-wrap">{contact.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContacts;
