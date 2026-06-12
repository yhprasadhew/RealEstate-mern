import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { 
  HiOutlineChatAlt2, 
  HiOutlineTrash, 
  HiChevronLeft,
  HiOutlinePaperAirplane
} from "react-icons/hi";
import io from "socket.io-client";

import { useAuth, api } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import { chatMessagesStyles as s } from "../../assets/dummyStyles";
import API_URL from "../../config";

const ChatMessages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingChatDetails, setLoadingChatDetails] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Establish Socket Connection
  useEffect(() => {
    socketRef.current = io(API_URL);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Fetch all chats for the user
  const fetchChats = useCallback(async (selectId = null) => {
    setLoadingChats(true);
    try {
      const res = await api.get("/api/chat/user");
      if (res.data.success) {
        setChats(res.data.chats);
        
        // If a specific ID was requested to be selected, select it
        if (selectId) {
          setActiveChatId(selectId);
          setSidebarOpen(false);
        } else if (location.state?.chat?._id) {
          setActiveChatId(location.state.chat._id);
          setSidebarOpen(false);
        }
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setLoadingChats(false);
    }
  }, [location.state]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Fetch detailed active chat & messages
  const fetchChatDetails = useCallback(async (chatId) => {
    if (!chatId) return;
    setLoadingChatDetails(true);
    try {
      const res = await api.get(`/api/chat/${chatId}`);
      if (res.data.success) {
        setActiveChat(res.data.chat);
        setMessages(res.data.chat.messages || []);
        
        // Join the socket room for this chat
        if (socketRef.current) {
          socketRef.current.emit("joinChat", chatId);
        }
      }
    } catch (err) {
      console.error("Error fetching chat details:", err);
    } finally {
      setLoadingChatDetails(false);
    }
  }, []);

  useEffect(() => {
    if (activeChatId) {
      fetchChatDetails(activeChatId);
    } else {
      setActiveChat(null);
      setMessages([]);
    }
  }, [activeChatId, fetchChatDetails]);

  // Scroll to bottom of message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Socket Live Updates
  useEffect(() => {
    if (!socketRef.current) return;

    const handleReceiveMessage = (msg) => {
      if (msg.chatId === activeChatId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
      
      // Update preview in chats list
      setChats((prev) => 
        prev.map((c) => {
          if (c._id === msg.chatId) {
            return {
              ...c,
              messages: [...(c.messages || []), msg],
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    };

    socketRef.current.on("receiveMessage", handleReceiveMessage);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receiveMessage", handleReceiveMessage);
      }
    };
  }, [activeChatId]);

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const messageText = inputText;
    setInputText("");

    try {
      const res = await api.post("/api/chat/send", {
        chatId: activeChatId,
        text: messageText
      });

      if (res.data.success) {
        const savedMessage = res.data.newMessage;
        
        // Append locally if socket doesn't echo
        setMessages((prev) => [...prev, savedMessage]);

        // Emit via socket for partner
        if (socketRef.current) {
          socketRef.current.emit("sendMessage", {
            chatId: activeChatId,
            ...savedMessage
          });
        }

        // Update chats list preview
        setChats((prev) => 
          prev.map((c) => {
            if (c._id === activeChatId) {
              return {
                ...c,
                messages: [...(c.messages || []), savedMessage],
                updatedAt: new Date().toISOString()
              };
            }
            return c;
          }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message.");
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      const res = await api.delete(`/api/chat/${activeChatId}/message/${messageId}`);
      if (res.data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete message.");
    }
  };

  // Delete conversation
  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this entire chat conversation?")) return;
    try {
      const res = await api.delete(`/api/chat/${chatId}`);
      if (res.data.success) {
        setChats((prev) => prev.filter((c) => c._id !== chatId));
        if (activeChatId === chatId) {
          setActiveChatId(null);
          setActiveChat(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete chat.");
    }
  };

  // Helper to determine partner user info
  const getPartnerInfo = (chat) => {
    if (!chat || !user) return { name: "User", profilePic: "" };
    const isCurrentUserBuyer = chat.buyer?._id === user.id || chat.buyer === user.id;
    return isCurrentUserBuyer ? chat.seller : chat.buyer;
  };

  const isSeller = user?.role === "seller";

  const renderContent = () => (
    <div className={isSeller ? s.chatContainerSeller : s.chatContainerNonSeller}>
      <div className={s.chatWrapper}>
        
        {/* SIDEBAR: List of conversations */}
        <aside className={`${s.sidebar} ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <div className={s.sidebarHeader}>
            <h2 className={s.sidebarTitle}>Conversations</h2>
          </div>
          
          <div className={s.sidebarContent}>
            {loadingChats ? (
              <div className="flex justify-center p-10">
                <div className="loader"></div>
              </div>
            ) : chats.length === 0 ? (
              <div className={s.emptyConversations}>
                <HiOutlineChatAlt2 size={48} className={s.emptyIcon} />
                <p>No messages yet.</p>
              </div>
            ) : (
              chats.map((chat) => {
                const partner = getPartnerInfo(chat);
                const lastMsg = chat.messages?.[chat.messages.length - 1];
                const isActive = chat._id === activeChatId;

                return (
                  <div
                    key={chat._id}
                    onClick={() => {
                      setActiveChatId(chat._id);
                      setSidebarOpen(false);
                    }}
                    className={`${s.conversationItem} ${isActive ? s.conversationItemActive : ""}`}
                  >
                    {/* Avatar */}
                    <div className={s.avatar}>
                      {partner?.profilePic || partner?.profilePicture ? (
                        <img 
                          src={partner?.profilePic || partner?.profilePicture} 
                          alt={partner?.name} 
                          className={s.avatarImg}
                        />
                      ) : (
                        <span>{partner?.name?.[0]?.toUpperCase() || "U"}</span>
                      )}
                    </div>

                    {/* Meta Info */}
                    <div className={s.conversationInfo}>
                      <h4 className={s.conversationName}>{partner?.name || "User"}</h4>
                      <p className={s.conversationPreview}>
                        {chat.property?.title && (
                          <span className="font-semibold text-primary block text-xs">
                            Prop: {chat.property.title}
                          </span>
                        )}
                        {lastMsg ? lastMsg.text : "No messages yet."}
                      </p>
                    </div>

                    {/* Delete chat button */}
                    <button
                      onClick={(e) => handleDeleteChat(e, chat._id)}
                      className={s.deleteChatButton}
                      title="Delete Conversation"
                    >
                      <HiOutlineTrash size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* CHAT AREA */}
        <section className={`${s.chatArea} ${!sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
          {activeChat ? (
            <>
              {/* Header */}
              <div className={s.chatHeader}>
                <div className={s.chatHeaderLeft}>
                  <button 
                    onClick={() => setSidebarOpen(true)}
                    className={s.backButton}
                  >
                    <HiChevronLeft size={24} />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold overflow-hidden">
                      {getPartnerInfo(activeChat)?.profilePic || getPartnerInfo(activeChat)?.profilePicture ? (
                        <img 
                          src={getPartnerInfo(activeChat)?.profilePic || getPartnerInfo(activeChat)?.profilePicture} 
                          alt={getPartnerInfo(activeChat)?.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{getPartnerInfo(activeChat)?.name?.[0]?.toUpperCase() || "U"}</span>
                      )}
                    </div>
                    <div>
                      <h3 className={s.chatPartnerName}>{getPartnerInfo(activeChat)?.name}</h3>
                      {activeChat.property?.title && (
                        <p className="text-xs text-text-muted m-0">
                          Listing: {activeChat.property.title} - ₹{activeChat.property.price?.toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Space */}
              <div className={s.messagesArea}>
                {loadingChatDetails ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="loader"></div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const msgSenderId = msg.sender?._id || msg.sender;
                    const isOwn = msgSenderId === user.id;

                    return (
                      <div
                        key={msg._id}
                        className={`${s.messageBubble} ${isOwn ? s.messageOwn : s.messageOther}`}
                      >
                        <div className={s.messageContent}>
                          <span className={s.messageText}>{msg.text}</span>
                          
                          {/* Trash button for own messages inside bubble */}
                          {isOwn && (
                            <button
                              onClick={() => handleDeleteMessage(msg._id)}
                              className={s.deleteMessageButton}
                              title="Delete message"
                            >
                              <HiOutlineTrash size={12} />
                            </button>
                          )}
                        </div>
                        <span className={s.messageTime}>
                          {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Composition Form */}
              <form onSubmit={handleSendMessage} className={s.messageForm}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className={s.messageInput}
                />
                <button type="submit" className={s.sendButton}>
                  <HiOutlinePaperAirplane size={18} className={s.sendIcon} />
                </button>
              </form>
            </>
          ) : (
            <div className={s.noChatSelected}>
              <HiOutlineChatAlt2 size={64} className={s.noChatIcon} />
              <h3 className={s.noChatTitle}>Select a Conversation</h3>
              <p>Choose an active chat from the sidebar to view history and chat with buyers.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );

  return (
    <div className={s.chatContainer}>
      {!isSeller && <Navbar />}
      {renderContent()}
    </div>
  );
};

export default ChatMessages;
