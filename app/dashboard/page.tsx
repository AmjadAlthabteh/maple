'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Clock, CheckCircle, Loader2 } from 'lucide-react';

interface Conversation {
  id: string;
  customerEmail: string;
  customerName?: string;
  subject?: string;
  status: string;
  lastMessageAt: string;
  messages: Array<{
    id: string;
    body: string;
    isInbound: boolean;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateResponse = async (conversationId: string, messageId: string) => {
    try {
      const response = await fetch('/api/ai/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, messageId }),
      });

      if (response.ok) {
        // Refresh conversation
        fetchConversations();
      }
    } catch (error) {
      console.error('Failed to generate response:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
        <p className="text-gray-600 mt-1">
          Manage and respond to customer inquiries with AI assistance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<MessageSquare className="h-6 w-6 text-blue-600" />}
          title="Total Conversations"
          value={conversations.length}
        />
        <StatCard
          icon={<Clock className="h-6 w-6 text-yellow-600" />}
          title="Pending"
          value={conversations.filter((c) => c.status === 'pending').length}
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          title="Resolved"
          value={conversations.filter((c) => c.status === 'resolved').length}
        />
      </div>

      {/* Conversations */}
      {conversations.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No conversations yet
          </h3>
          <p className="text-gray-600 mb-4">
            Connect your email account to start receiving customer messages
          </p>
          <a
            href="/dashboard/email-accounts"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Connect Email Account
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversation list */}
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                onClick={() => setSelectedConversation(conversation)}
                isSelected={selectedConversation?.id === conversation.id}
              />
            ))}
          </div>

          {/* Conversation detail */}
          <div className="bg-white rounded-lg border p-6">
            {selectedConversation ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {selectedConversation.subject || 'No subject'}
                </h3>
                <div className="space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
                {selectedConversation.messages.length > 0 &&
                  selectedConversation.messages[selectedConversation.messages.length - 1]
                    .isInbound && (
                    <button
                      onClick={() =>
                        generateResponse(
                          selectedConversation.id,
                          selectedConversation.messages[selectedConversation.messages.length - 1].id
                        )
                      }
                      className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Generate AI Response
                    </button>
                  )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Select a conversation to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div>{icon}</div>
      </div>
    </div>
  );
}

function ConversationCard({
  conversation,
  onClick,
  isSelected,
}: {
  conversation: Conversation;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition ${
        isSelected
          ? 'bg-blue-50 border-blue-300'
          : 'bg-white hover:bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-gray-900">
            {conversation.customerName || conversation.customerEmail}
          </h4>
          <p className="text-sm text-gray-600">{conversation.subject || 'No subject'}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            conversation.status === 'open'
              ? 'bg-blue-100 text-blue-700'
              : conversation.status === 'resolved'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {conversation.status}
        </span>
      </div>
      {conversation.messages[0] && (
        <p className="text-sm text-gray-600 line-clamp-2">{conversation.messages[0].body}</p>
      )}
      <p className="text-xs text-gray-500 mt-2">
        {new Date(conversation.lastMessageAt).toLocaleString()}
      </p>
    </button>
  );
}

function MessageBubble({
  message,
}: {
  message: {
    body: string;
    isInbound: boolean;
    createdAt: string;
  };
}) {
  return (
    <div className={`flex ${message.isInbound ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          message.isInbound ? 'bg-gray-100 text-gray-900' : 'bg-blue-600 text-white'
        }`}
      >
        <p className="text-sm">{message.body}</p>
        <p
          className={`text-xs mt-1 ${
            message.isInbound ? 'text-gray-500' : 'text-blue-100'
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
