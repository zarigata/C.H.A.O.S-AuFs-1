// =============================================
// ============== CODEX CONTACTS =============
// =============================================
// Contacts list component for C.H.A.O.S.
// MSN Messenger-style contact list with collapsible groups and status indicators

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Search, UserPlus } from 'lucide-react';
import { cn } from '../../lib/utils';
import ContactCard from '../ui/contact-card';
import { Friend } from '../../types';

interface ContactsListProps {
  contacts: Friend[];
  selectedContactId?: string;
  onContactSelect: (contact: Friend) => void;
  onAddContact?: () => void;
  className?: string;
}

/**
 * ContactsList component
 * 
 * Classic MSN Messenger-style contact list with:
 * - Contacts grouped by status (Online, Away, Offline)
 * - Collapsible groups
 * - Search functionality
 * - Contact status indicators
 */
const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  selectedContactId,
  onContactSelect,
  onAddContact,
  className,
}) => {
  // State for search input and expanded groups
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    online: true,
    away: true,
    busy: true,
    offline: false, // Offline group collapsed by default (classic MSN behavior)
  });
  
  // Filter and group contacts based on status and search
  const groupedContacts = useMemo(() => {
    // Filter by search query
    const filteredContacts = searchQuery
      ? contacts.filter(contact => 
          contact.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : contacts;
    
    // Group by status
    return {
      online: filteredContacts.filter(contact => contact.status === 'ONLINE'),
      away: filteredContacts.filter(contact => contact.status === 'AWAY'),
      busy: filteredContacts.filter(contact => contact.status === 'BUSY'),
      offline: filteredContacts.filter(contact => contact.status === 'OFFLINE'),
    };
  }, [contacts, searchQuery]);
  
  // Toggle group expanded state
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group],
    }));
  };
  
  // Get total contacts count
  const totalContacts = contacts.length;
  const onlineCount = groupedContacts.online.length + groupedContacts.away.length + groupedContacts.busy.length;
  
  return (
    <div className={cn(
      'flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden',
      className
    )}>
      {/* Header with search */}
      <div className="p-3 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded border-slate-300 focus:border-msn-blue focus:ring-1 focus:ring-msn-blue msn-input"
          />
          <Search
            size={16}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
          />
        </div>
        
        {/* Summary line */}
        <div className="text-xs mt-2 text-slate-500">
          {onlineCount} of {totalContacts} contacts online
        </div>
      </div>
      
      {/* Contact list with groups */}
      <div className="flex-1 overflow-y-auto">
        {/* Online group */}
        <div className="contact-group">
          <div
            className="flex items-center px-3 py-2 bg-slate-100 dark:bg-slate-800 cursor-pointer border-y border-slate-200 dark:border-slate-700"
            onClick={() => toggleGroup('online')}
          >
            {expandedGroups.online ? (
              <ChevronDown size={16} className="text-msn-blue mr-1" />
            ) : (
              <ChevronRight size={16} className="text-msn-blue mr-1" />
            )}
            <span className="font-medium text-sm text-msn-blue">
              Online ({groupedContacts.online.length})
            </span>
          </div>
          
          {expandedGroups.online && (
            <div className="py-1">
              {groupedContacts.online.length === 0 ? (
                <div className="px-4 py-2 text-xs text-slate-500 italic">
                  No online contacts
                </div>
              ) : (
                groupedContacts.online.map(contact => (
                  <ContactCard
                    key={contact.id}
                    user={contact}
                    isSelected={contact.id === selectedContactId}
                    onClick={() => onContactSelect(contact)}
                  />
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Away group */}
        <div className="contact-group">
          <div
            className="flex items-center px-3 py-2 bg-slate-100 dark:bg-slate-800 cursor-pointer border-y border-slate-200 dark:border-slate-700"
            onClick={() => toggleGroup('away')}
          >
            {expandedGroups.away ? (
              <ChevronDown size={16} className="text-msn-yellow mr-1" />
            ) : (
              <ChevronRight size={16} className="text-msn-yellow mr-1" />
            )}
            <span className="font-medium text-sm text-msn-yellow">
              Away ({groupedContacts.away.length})
            </span>
          </div>
          
          {expandedGroups.away && (
            <div className="py-1">
              {groupedContacts.away.length === 0 ? (
                <div className="px-4 py-2 text-xs text-slate-500 italic">
                  No away contacts
                </div>
              ) : (
                groupedContacts.away.map(contact => (
                  <ContactCard
                    key={contact.id}
                    user={contact}
                    isSelected={contact.id === selectedContactId}
                    onClick={() => onContactSelect(contact)}
                  />
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Busy group */}
        <div className="contact-group">
          <div
            className="flex items-center px-3 py-2 bg-slate-100 dark:bg-slate-800 cursor-pointer border-y border-slate-200 dark:border-slate-700"
            onClick={() => toggleGroup('busy')}
          >
            {expandedGroups.busy ? (
              <ChevronDown size={16} className="text-msn-red mr-1" />
            ) : (
              <ChevronRight size={16} className="text-msn-red mr-1" />
            )}
            <span className="font-medium text-sm text-msn-red">
              Busy ({groupedContacts.busy.length})
            </span>
          </div>
          
          {expandedGroups.busy && (
            <div className="py-1">
              {groupedContacts.busy.length === 0 ? (
                <div className="px-4 py-2 text-xs text-slate-500 italic">
                  No busy contacts
                </div>
              ) : (
                groupedContacts.busy.map(contact => (
                  <ContactCard
                    key={contact.id}
                    user={contact}
                    isSelected={contact.id === selectedContactId}
                    onClick={() => onContactSelect(contact)}
                  />
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Offline group */}
        <div className="contact-group">
          <div
            className="flex items-center px-3 py-2 bg-slate-100 dark:bg-slate-800 cursor-pointer border-y border-slate-200 dark:border-slate-700"
            onClick={() => toggleGroup('offline')}
          >
            {expandedGroups.offline ? (
              <ChevronDown size={16} className="text-msn-gray mr-1" />
            ) : (
              <ChevronRight size={16} className="text-msn-gray mr-1" />
            )}
            <span className="font-medium text-sm text-msn-gray">
              Offline ({groupedContacts.offline.length})
            </span>
          </div>
          
          {expandedGroups.offline && (
            <div className="py-1">
              {groupedContacts.offline.length === 0 ? (
                <div className="px-4 py-2 text-xs text-slate-500 italic">
                  No offline contacts
                </div>
              ) : (
                groupedContacts.offline.map(contact => (
                  <ContactCard
                    key={contact.id}
                    user={contact}
                    isSelected={contact.id === selectedContactId}
                    onClick={() => onContactSelect(contact)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Add contact button */}
      {onAddContact && (
        <div className="p-3 border-t">
          <button
            onClick={onAddContact}
            className="flex items-center justify-center w-full gap-2 py-1.5 rounded msn-button"
          >
            <UserPlus size={16} className="text-msn-blue" />
            <span className="text-sm">Add Contact</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactsList;
