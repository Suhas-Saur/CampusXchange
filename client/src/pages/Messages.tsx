import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Send,
  User,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  Lock,
  ChevronLeft,
  Flag,
  CheckCircle2,
  Trash2,
  X,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Search parameters for prefilled chats
  const partnerParam = searchParams.get('partnerId');
  const productParam = searchParams.get('productId');

  // Chats states
  const [chats, setChats] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [loadingChats, setLoadingChats] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  
  // Inputs
  const [newMessage, setNewMessage] = useState<string>('');
  const [contextProduct, setContextProduct] = useState<any>(null);

  // Mobile navigation visibility
  const [viewChatMobile, setViewChatMobile] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat partners list
  useEffect(() => {
    loadChatsList();
  }, [user]);

  const loadChatsList = async (selectPartnerId?: string) => {
    try {
      setLoadingChats(true);
      const res = await api.get('/api/messages/chats');
      setChats(res.data);
      
      // If we have selectPartnerId, find and set active
      if (selectPartnerId) {
        const foundChat = res.data.find((c: any) => c.user._id === selectPartnerId);
        if (foundChat) {
          setSelectedPartner(foundChat.user);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChats(false);
    }
  };

  // Prefill flow when query parameters are supplied
  useEffect(() => {
    if (partnerParam && chats.length >= 0) {
      const initPrefilledChat = async () => {
        // If partner not in chat partner list, retrieve details
        const existingPartner = chats.find(c => c.user._id === partnerParam)?.user;
        if (existingPartner) {
          setSelectedPartner(existingPartner);
          setViewChatMobile(true);
        } else {
          try {
            const partnerRes = await api.get(`/api/auth/me`); // placeholder lookup
            // For safety, load messages, if empty, it'll start new chat
            const userRes = await api.get('/api/messages/chats'); // refresh
            const targetUser = userRes.data.find((c: any) => c.user._id === partnerParam)?.user;
            
            if (targetUser) {
              setSelectedPartner(targetUser);
            } else {
              // Fetch user profile specifically (mock/admin retrieve fallback since privacy locks search)
              const res = await api.get(`/api/products`); // find product to extract seller details
              const matchingProd = res.data.find((p: any) => p.sellerId?._id === partnerParam);
              if (matchingProd) {
                setSelectedPartner(matchingProd.sellerId);
              }
            }
            setViewChatMobile(true);
          } catch (e) {
            console.error(e);
          }
        }

        // Load context product if parameter present
        if (productParam) {
          try {
            const prodRes = await api.get(`/api/products/${productParam}`);
            setContextProduct(prodRes.data);
            setNewMessage(`Hi, I'm interested in buying your product: "${prodRes.data.title}". Is it still available?`);
          } catch (e) {
            console.error(e);
          }
        }
      };
      initPrefilledChat();
    }
  }, [partnerParam, productParam, chats.length]);

  // Load chat messages when partner selected
  useEffect(() => {
    if (selectedPartner) {
      fetchMessages();
    }
  }, [selectedPartner]);

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const res = await api.get(`/api/messages/${selectedPartner._id}`);
      setMessages(res.data);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Real-time socket message handler
  useEffect(() => {
    if (socket) {
      socket.on('new_message', (chatData: any) => {
        // If message is from currently active chat partner, append
        if (selectedPartner && chatData.message.senderId === selectedPartner._id) {
          setMessages((prev) => [...prev, chatData.message]);
          // Mark as read
          api.get(`/api/messages/${selectedPartner._id}`); // silent mark read
          scrollToBottom();
        } else {
          // Refresh list to show unread count
          loadChatsList();
        }
      });

      return () => {
        socket.off('new_message');
      };
    }
  }, [socket, selectedPartner]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartner) return;

    try {
      const messageContent = newMessage;
      setNewMessage(''); // clear input
      
      const payload: any = {
        receiverId: selectedPartner._id,
        message: messageContent
      };
      
      if (contextProduct) {
        payload.productId = contextProduct._id;
        setContextProduct(null); // clear context product once messaged
      }

      const res = await api.post('/api/messages', payload);
      setMessages((prev) => [...prev, res.data]);
      
      // Refresh list to update last message preview
      loadChatsList(selectedPartner._id);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to dispatch text', err);
    }
  };

  return (
    <div className="bg-white border border-slate-100/80 rounded-3xl overflow-hidden shadow-sm h-[75vh] grid grid-cols-1 md:grid-cols-12 text-left">
      
      {/* Chats sidebar (Shown on desktop, hidden on mobile if viewChatMobile active) */}
      <div className={`md:col-span-4 border-r border-slate-100 flex flex-col h-full bg-slate-50/30 ${
        viewChatMobile ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-extrabold text-slate-900 text-base">Direct Messages</h2>
        </div>

        <div className="flex-grow overflow-y-auto p-2 space-y-1">
          {loadingChats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : chats.length === 0 ? (
            <p className="text-slate-400 text-xs py-12 text-center">No active chats. Start one from the Marketplace!</p>
          ) : (
            chats.map((c) => (
              <button
                key={c.user._id}
                onClick={() => {
                  setSelectedPartner(c.user);
                  setViewChatMobile(true);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left border transition-all ${
                  selectedPartner?._id === c.user._id
                    ? 'bg-brand-50/50 border-brand-100 text-brand-900 font-semibold'
                    : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={c.user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.user.name)}`}
                    alt={c.user.name}
                    className="h-10 w-10 rounded-full border border-slate-200"
                  />
                  {c.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold h-4 w-4 rounded-full flex items-center justify-center text-[9px]">
                      {c.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-grow text-xs truncate">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-slate-950 truncate">{c.user.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {new Date(c.lastMessageTime).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-slate-500 line-clamp-1">{c.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Chat Pane */}
      <div className={`md:col-span-8 flex flex-col h-full bg-white ${
        viewChatMobile ? 'flex' : 'hidden md:flex'
      }`}>
        {selectedPartner ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewChatMobile(false)}
                  className="md:hidden p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <img
                  src={selectedPartner.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedPartner.name)}`}
                  alt={selectedPartner.name}
                  className="h-9 w-9 rounded-full border border-slate-100"
                />

                <div className="text-left">
                  <h3 className="font-bold text-slate-900 text-sm leading-none">{selectedPartner.name}</h3>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wide font-medium">
                    {selectedPartner.department} • Year {selectedPartner.year}
                  </p>
                </div>
              </div>
            </div>

            {/* Context Product Card */}
            {contextProduct && (
              <div className="px-4 py-2 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4.5 w-4.5 text-brand-500" />
                  <div>
                    <span className="font-bold text-slate-900">{contextProduct.title}</span>
                    <span className="text-slate-400 ml-2">₹{contextProduct.price}</span>
                  </div>
                </div>
                <button onClick={() => setContextProduct(null)} className="text-slate-400 hover:text-slate-650">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Message Feed */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-[#fafafc]/50">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : (
                messages.map((m) => {
                  const isSent = m.senderId === user?._id;
                  return (
                    <div key={m._id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed text-left border ${
                        isSent
                          ? 'bg-brand-600 border-brand-600 text-white rounded-tr-none'
                          : 'bg-white border-slate-100 text-slate-800 rounded-tl-none shadow-xs'
                      }`}>
                        {/* Display linked product details if message is contextual */}
                        {m.productId && (
                          <div className="mb-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-brand-600" />
                            <div>
                              <p className="font-bold text-[10px] truncate">{m.productId.title}</p>
                              <p className="text-[9px] text-slate-500 font-semibold">₹{m.productId.price}</p>
                            </div>
                          </div>
                        )}
                        <p>{m.message}</p>
                        
                        <span className={`block text-[8px] mt-1.5 text-right ${isSent ? 'text-brand-100' : 'text-slate-400'}`}>
                          {new Date(m.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50/50"
              />
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-700 active:scale-95 text-white h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20 transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="h-16 w-16 text-slate-200 mb-4 animate-pulse" />
            <h3 className="font-bold text-slate-700 text-sm">Direct Messages</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
              Select a conversation from the sidebar or click "Chat with Seller" on any marketplace listing to begin discussion.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
